#!/usr/bin/env python3
"""M2 — Interest / EEG-curve regression  (pipeline stage [2]).

Feature windows[] → per-window interest_0_1 curve.

Evaluation: leave-one-video-out (LOVO) cross-validation.
Anti-leakage: no video appears in both train and test splits.
Feature schema version: "2.0"  (pinned; fails loudly on mismatch).

Data sources (pick one):
  --synthetic          Generate targets with synth_eeg.py on the fly.
                       ⚠️  PLUMBING CHECK ONLY — no accuracy claims.
                       All output is labeled SYNTHETIC.
  --per-window  CSV    Real EEG, P-03 export:
                         hardware/analysis/out/<eegSyncId>_per_window.csv
                       Schema: exposure_id, video_id, t, interest_0_1
                               [, coverage, quality]
                       If multiple exposures per video, interest_0_1 is
                       averaged across participants before joining.

Outputs (model/out/):
  m2_results.json
  m2_curve_overlay.png   ← HERO visual: predicted vs truth for one held-out video

──────────────────────────────────────────────────────────
WHAT TO CHANGE WHEN REAL EEG ARRIVES
──────────────────────────────────────────────────────────
  Drop --synthetic and pass --per-window hardware/analysis/out/<id>_per_window.csv
  Nothing else changes.  Re-run and compare m2_results.json.
──────────────────────────────────────────────────────────
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd
from scipy.stats import pearsonr, spearmanr
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.impute import SimpleImputer
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.pipeline import Pipeline

# ── paths ─────────────────────────────────────────────────────────────────────
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "model" / "out"
FEATURES_DIR = ROOT / "model" / "features" / "videos"
SCHEMA_VERSION = "2.0"

# allow `from synth_eeg import ...` (all model/ scripts live in the same dir)
sys.path.insert(0, str(Path(__file__).resolve().parent))

# ── feature columns fed to the regressor ─────────────────────────────────────
# These map directly to keys in features.windows[] plus t_norm derived from t.
WINDOW_FEATURES = [
    "t_norm",           # t / duration_s  — position-in-video, removes duration confound
    "face_present",
    "face_size_frac",
    "face_centrality",
    "motion",
    "loudness_db",
    "ocr_text_present",
    "brightness",
    "colorfulness",
    "saturation",
    "contrast",
    "cut_in_window",
]
TARGET = "interest_0_1"


# ── data loading ──────────────────────────────────────────────────────────────

def load_feature_windows(features_dir: Path = FEATURES_DIR) -> pd.DataFrame:
    """Return a flat per-window DataFrame from all feature JSON files."""
    rows: list[dict] = []
    skipped = 0
    for vdir in sorted(features_dir.iterdir()):
        if not vdir.is_dir():
            continue
        vid = vdir.name
        jpath = vdir / f"{vid}.json"
        if not jpath.exists():
            continue
        feat = json.loads(jpath.read_text())
        vsn = feat.get("feature_schema_version")
        if vsn != SCHEMA_VERSION:
            print(f"  SKIP {vid}: feature_schema_version '{vsn}' != '{SCHEMA_VERSION}'")
            skipped += 1
            continue
        dur = float(feat.get("duration_s") or 1.0)
        creator = feat.get("creator_id", "unknown")
        for w in feat.get("windows", []):
            row: dict = {
                "video_id": vid,
                "creator_id": creator,
                "duration_s": dur,
                "t": float(w["t"]),
                "t_norm": float(w["t"]) / dur if dur > 0 else 0.0,
            }
            for k in [
                "face_present", "face_size_frac", "face_centrality",
                "motion", "loudness_db", "ocr_text_present",
                "brightness", "colorfulness", "saturation",
                "contrast", "cut_in_window",
            ]:
                row[k] = w.get(k)
            rows.append(row)

    df = pd.DataFrame(rows)
    if skipped:
        print(f"  Skipped {skipped} videos (schema mismatch)")
    print(f"  Loaded {len(df)} feature windows for {df['video_id'].nunique()} videos")
    return df


def load_synth_targets(feat_df: pd.DataFrame) -> pd.DataFrame:
    """Join synthetic EEG interest targets onto feature windows."""
    from synth_eeg import build_synth_dataset  # noqa: deferred import

    print("\n" + "!" * 60)
    print("!  DATA SOURCE: SYNTHETIC EEG — NOT REAL BRAIN DATA        !")
    print("!  Results are PLUMBING VALIDATION ONLY.                   !")
    print("!  No accuracy claims.                                      !")
    print("!" * 60)

    eeg_df = build_synth_dataset()
    # merge on (video_id, t) — both come from the same windows[] list
    merged = feat_df.merge(
        eeg_df[["video_id", "t", TARGET]],
        on=["video_id", "t"],
        how="inner",
    )
    merged["_synthetic"] = True
    dropped = len(feat_df) - len(merged)
    if dropped:
        print(f"  Note: {dropped} feature rows had no matching synthetic target (t mismatch)")
    print(f"  Merged: {len(merged)} per-window rows with synthetic targets")
    return merged


def load_real_targets(feat_df: pd.DataFrame, per_window_csv: Path) -> pd.DataFrame:
    """
    Load real EEG per-window CSV (P-03 export) and join onto feature windows.

    Expected columns: exposure_id, video_id, t, interest_0_1 [, coverage, quality]

    If coverage / quality columns are present, low-quality rows are logged
    (not silently dropped) so the caller can decide.  Averaging across
    participants is done per (video_id, t) before merging.
    """
    eeg = pd.read_csv(per_window_csv)
    required = {"video_id", "t", "interest_0_1"}
    missing = required - set(eeg.columns)
    if missing:
        raise ValueError(f"--per-window CSV missing required columns: {missing}")

    # Log quality stats if available
    if "coverage" in eeg.columns:
        low = (eeg["coverage"] < 0.5).sum()
        print(f"  EEG rows with coverage < 0.5: {low} / {len(eeg)} (logged, not dropped)")
    if "quality" in eeg.columns:
        print(f"  mean_channel_quality: {eeg['quality'].mean():.3f}")

    n_exposures = eeg["exposure_id"].nunique() if "exposure_id" in eeg.columns else "?"
    print(f"  Real EEG: {len(eeg)} rows, {eeg['video_id'].nunique()} videos, "
          f"{n_exposures} exposures")

    # Average interest_0_1 across participants per (video_id, t)
    eeg_agg = (
        eeg.groupby(["video_id", "t"])["interest_0_1"]
        .mean()
        .reset_index()
    )
    merged = feat_df.merge(eeg_agg, on=["video_id", "t"], how="inner")
    merged["_synthetic"] = False
    print(f"  Joined: {len(merged)} per-window rows across "
          f"{merged['video_id'].nunique()} videos")
    return merged


# ── model ─────────────────────────────────────────────────────────────────────

def build_model() -> Pipeline:
    """Gradient-boosting regressor with median imputation."""
    return Pipeline([
        ("impute", SimpleImputer(strategy="median")),
        ("m", HistGradientBoostingRegressor(
            max_depth=3,
            learning_rate=0.08,
            max_iter=150,            # was 300; 121-fold leave-one-video-out was too slow
            early_stopping=True,     # stop when validation plateaus — faster per fold
            l2_regularization=1.0,
            random_state=0,
        )),
    ])


# ── cross-validation ──────────────────────────────────────────────────────────

def leave_one_video_out_cv(
    df: pd.DataFrame,
) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Leave-one-video-out CV.

    Returns (y_true, y_pred, vid_col) — all same length as df.
    Anti-leakage: each video is held out exactly once; its features never
    appear in the training set for its own fold.
    """
    videos = df["video_id"].unique()
    n = len(df)
    y_true_all = np.empty(n)
    y_pred_all = np.empty(n)
    vid_col = df["video_id"].to_numpy()
    y_all = df[TARGET].to_numpy(dtype=float)
    X_all = (
        df[WINDOW_FEATURES]
        .apply(pd.to_numeric, errors="coerce")
        .to_numpy()
    )

    print(f"  LOVO CV over {len(videos)} videos …")
    for i, held_vid in enumerate(videos):
        mask_te = vid_col == held_vid
        mask_tr = ~mask_te
        if mask_tr.sum() < 5:
            # too few training windows — fall back to training-set mean
            y_pred_all[mask_te] = y_all[mask_tr].mean() if mask_tr.any() else 0.5
            continue
        pipe = build_model()
        pipe.fit(X_all[mask_tr], y_all[mask_tr])
        y_pred_all[mask_te] = pipe.predict(X_all[mask_te])
        if (i + 1) % 25 == 0 or (i + 1) == len(videos):
            print(f"    {i + 1}/{len(videos)} videos done")

    return y_true_all, y_pred_all, vid_col


# ── metrics ───────────────────────────────────────────────────────────────────

def per_video_pearson(y: np.ndarray, yhat: np.ndarray, vid_col: np.ndarray) -> float:
    """n-weighted mean Pearson r computed inside each video (≥ 4 windows)."""
    vals, weights = [], []
    for v in pd.unique(vid_col):
        mask = vid_col == v
        if mask.sum() < 4:
            continue
        r, _ = pearsonr(y[mask], yhat[mask])
        if not np.isnan(r):
            vals.append(r)
            weights.append(int(mask.sum()))
    return float(np.average(vals, weights=weights)) if vals else float("nan")


# ── plots ─────────────────────────────────────────────────────────────────────

def plot_curve_overlay(
    df: pd.DataFrame,
    y_pred_all: np.ndarray,
    vid_col: np.ndarray,
    synthetic: bool,
    out_dir: Path,
) -> Optional[str]:
    """
    HERO visual: predicted interest curve vs ground-truth for one held-out video.
    Picks the video with the most windows for a clean plot.
    """
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except ImportError:
        return None

    videos, counts = np.unique(vid_col, return_counts=True)
    best_vid = videos[np.argmax(counts)]
    mask = vid_col == best_vid

    t_vals = df["t"].to_numpy()[mask]
    y_true = df[TARGET].to_numpy(dtype=float)[mask]
    y_pred = y_pred_all[mask]

    order = np.argsort(t_vals)
    t_vals, y_true, y_pred = t_vals[order], y_true[order], y_pred[order]

    fig, ax = plt.subplots(figsize=(11, 4))
    ax.plot(t_vals, y_true, color="#2196F3", linewidth=2.0,
            label="EEG interest — ground truth")
    ax.plot(t_vals, y_pred, color="#FF5722", linewidth=2.0,
            linestyle="--", label="Predicted (LOVO)")
    ax.fill_between(t_vals, y_true, y_pred, alpha=0.12, color="gray")
    ax.axhline(0.5, color="gray", linewidth=0.8, linestyle=":", label="midpoint")
    ax.set_xlabel("Time (s)", fontsize=11)
    ax.set_ylabel("interest_0_1", fontsize=11)
    ax.set_ylim(-0.02, 1.02)
    ax.legend(fontsize=9)

    synth_tag = "  [SYNTHETIC — plumbing validation only]" if synthetic else ""
    eeg_note = "EEG interest: provisional / relative"
    ax.set_title(
        f"M2 interest-curve overlay — {best_vid}{synth_tag}\n({eeg_note})",
        fontsize=11,
    )
    fig.tight_layout()
    out_path = out_dir / "m2_curve_overlay.png"
    fig.savefig(out_path, dpi=130)
    plt.close(fig)
    return str(out_path)


# ── main ──────────────────────────────────────────────────────────────────────

def main() -> int:
    parser = argparse.ArgumentParser(
        description="Train M2 interest-curve regressor (stage [2])"
    )
    src = parser.add_mutually_exclusive_group(required=True)
    src.add_argument(
        "--synthetic", action="store_true",
        help="Use synthetic EEG targets (plumbing check; no accuracy claims)",
    )
    src.add_argument(
        "--per-window", type=Path, metavar="CSV",
        help=(
            "Real EEG per-window CSV (P-03 export: "
            "hardware/analysis/out/<eegSyncId>_per_window.csv)"
        ),
    )
    args = parser.parse_args()

    OUT.mkdir(parents=True, exist_ok=True)
    synthetic: bool = args.synthetic

    print()
    print("=" * 60)
    if synthetic:
        print("⚠️  M2 — SYNTHETIC EEG MODE — NOT REAL BRAIN DATA  ⚠️")
    else:
        print("M2 TRAIN — REAL EEG MODE")
    print(f"   feature_schema_version = {SCHEMA_VERSION}")
    print("=" * 60)

    # ── [1] features ────────────────────────────────────────────────────────
    print("\n[1/4] Loading feature windows …")
    feat_df = load_feature_windows(FEATURES_DIR)

    # ── [2] targets ─────────────────────────────────────────────────────────
    print("\n[2/4] Loading EEG targets …")
    if synthetic:
        df = load_synth_targets(feat_df)
    else:
        df = load_real_targets(feat_df, args.per_window)

    print(f"\n  Training table: {len(df)} rows × {len(WINDOW_FEATURES)} features")
    print(f"  Videos: {df['video_id'].nunique()}   "
          f"Creators: {df['creator_id'].nunique()}")
    print(f"  Window features: {WINDOW_FEATURES}")
    print(f"  Target: {TARGET}")

    # ── [3] LOVO CV ─────────────────────────────────────────────────────────
    print("\n[3/4] Leave-one-video-out CV …")
    y_true, y_pred, vid_col = leave_one_video_out_cv(df)

    # ── [4] metrics + output ─────────────────────────────────────────────────
    print("\n[4/4] Computing metrics …")

    pooled_rho = float(spearmanr(y_true, y_pred).statistic)
    pooled_r, _ = pearsonr(y_true, y_pred)
    mean_vid_pearson = per_video_pearson(y_true, y_pred, vid_col)
    mae = float(mean_absolute_error(y_true, y_pred))
    r2 = float(r2_score(y_true, y_pred))

    # baseline: global mean across all windows
    base_pred = np.full_like(y_true, y_true.mean())
    base_mae = float(mean_absolute_error(y_true, base_pred))
    base_r2 = float(r2_score(y_true, base_pred))
    base_rho = float(spearmanr(y_true, base_pred).statistic)

    results = {
        "data_source": (
            "SYNTHETIC — plumbing only, no accuracy claims"
            if synthetic
            else "REAL EEG"
        ),
        "synthetic": synthetic,
        "feature_schema_version": SCHEMA_VERSION,
        "n_windows": int(len(df)),
        "n_videos": int(df["video_id"].nunique()),
        "window_features": WINDOW_FEATURES,
        "target": TARGET,
        "lovo_cv": {
            "pooled_spearman": round(pooled_rho, 4),
            "pooled_pearson": round(pooled_r, 4),
            "mean_per_video_pearson": round(mean_vid_pearson, 4),
            "mae": round(mae, 4),
            "r2": round(r2, 4),
        },
        "baseline_global_mean": {
            "pooled_spearman": round(base_rho, 4),
            "mae": round(base_mae, 4),
            "r2": round(base_r2, 4),
        },
    }

    plot_path = plot_curve_overlay(df, y_pred, vid_col, synthetic, OUT)

    print()
    print("=" * 60)
    if synthetic:
        print("⚠️  RESULTS ARE SYNTHETIC — PLUMBING VALIDATION ONLY  ⚠️")
    print(f"M2 LOVO results  ({df['video_id'].nunique()} videos, {len(df)} windows):")
    print(f"  Pooled Spearman ρ          = {pooled_rho:+.4f}")
    print(f"  Pooled Pearson r           = {pooled_r:+.4f}")
    print(f"  Mean per-video Pearson r   = {mean_vid_pearson:+.4f}")
    print(f"  MAE                        = {mae:.4f}")
    print(f"  R²                         = {r2:.4f}")
    print()
    print(f"  Baseline (global mean):")
    print(f"    Pooled Spearman ρ        = {base_rho:+.4f}")
    print(f"    MAE                      = {base_mae:.4f}")
    print(f"    R²                       = {base_r2:.4f}")

    if synthetic:
        print()
        print("  NOTE: Some predictive signal is expected with synthetic data")
        print("  because the target is a deterministic function of the features.")
        print("  This only proves the pipeline plumbing works end-to-end.")

    results_path = OUT / "m2_results.json"
    results_path.write_text(json.dumps(results, indent=2))
    print(f"\nWrote {results_path}")
    if plot_path:
        print(f"Wrote {plot_path}  ← HERO plot (predicted vs truth curve)")

    if synthetic:
        print()
        print("⚠️  SYNTHETIC DATA — NOT REAL BRAIN DATA  ⚠️")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
