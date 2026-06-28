#!/usr/bin/env python3
"""M1 — virality / engagement regressor.

Predicts content-intrinsic IG engagement from offline video features. With only 5
creators (all study-niche), the honest evaluation is **leave-one-creator-out**: the
model must score a creator it never trained on. The headline metric is the
**mean within-held-out-creator Spearman** — "for a creator we've never seen, do our
predicted scores rank their videos in the right order?" — plus pooled Spearman, MAE
and R2 vs a global-mean baseline.

Outputs (model/out/):
  m1_results.json                      metrics per target × model
  m1_importance_<target>.png           permutation importance (in-sample, directional)
  m1_pred_vs_actual_<target>.png       OOF predictions vs actual, coloured by creator
"""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.stats import spearmanr
from sklearn.ensemble import HistGradientBoostingRegressor
from sklearn.impute import SimpleImputer
from sklearn.inspection import permutation_importance
from sklearn.linear_model import Ridge
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import LeaveOneGroupOut, cross_val_predict
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import StandardScaler

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "model/out"

CONTROL = ["duration_s", "aspect_ratio", "src_fps"]
PACING = ["cuts_per_sec", "time_to_first_cut", "mean_shot_len", "shot_len_std", "scene_cut_count"]
VISUAL = ["motion_mean", "face_present_frac", "is_talking_head",
          "brightness_mean", "colorfulness_mean", "saturation_mean", "contrast_mean"]
AUDIO = ["loudness_mean_db", "silence_fraction", "onset_density",
         "spectral_centroid_hz", "dynamic_range_db", "speech_present", "music_present"]
TEXT = ["ocr_text_presence_ratio", "likely_subtitles", "transcript_wps_mean"]
HOOK = ["hook_face", "hook_text_present", "hook_cuts", "hook_loudness", "opening_curiosity"]
FEATURES = CONTROL + PACING + VISUAL + AUDIO + TEXT + HOOK

TARGETS = ["engagement_rate", "like_rate", "eng_rank_in_creator"]


def models() -> dict[str, Pipeline]:
    return {
        "hgb": Pipeline([
            ("impute", SimpleImputer(strategy="median")),
            ("m", HistGradientBoostingRegressor(
                max_depth=3, learning_rate=0.05, max_iter=300,
                l2_regularization=1.0, random_state=0)),
        ]),
        "ridge": Pipeline([
            ("impute", SimpleImputer(strategy="median")),
            ("scale", StandardScaler()),
            ("m", Ridge(alpha=2.0)),
        ]),
    }


def within_group_spearman(y, yhat, groups) -> float:
    """Mean Spearman computed inside each held-out group (>=4 samples), n-weighted."""
    vals, weights = [], []
    for g in pd.unique(groups):
        mask = groups == g
        if mask.sum() < 4:
            continue
        rho = spearmanr(y[mask], yhat[mask]).statistic
        if not np.isnan(rho):
            vals.append(rho)
            weights.append(mask.sum())
    return float(np.average(vals, weights=weights)) if vals else float("nan")


def evaluate(df: pd.DataFrame, target: str) -> dict:
    d = df.dropna(subset=[target]).reset_index(drop=True)
    X = d[FEATURES].apply(pd.to_numeric, errors="coerce")
    X["likely_subtitles"] = X["likely_subtitles"].fillna(0)
    y = d[target].to_numpy(dtype=float)
    groups = d["creator_id"].to_numpy()
    logo = LeaveOneGroupOut()

    result = {"target": target, "n": len(d), "creators": int(d.creator_id.nunique())}
    preds = {}
    for name, pipe in models().items():
        yhat = cross_val_predict(pipe, X, y, groups=groups, cv=logo)
        preds[name] = yhat
        result[name] = {
            "within_creator_spearman": round(within_group_spearman(y, yhat, groups), 4),
            "pooled_spearman": round(float(spearmanr(y, yhat).statistic), 4),
            "mae": round(float(mean_absolute_error(y, yhat)), 5),
            "r2": round(float(r2_score(y, yhat)), 4),
        }
    # baseline: per-fold global mean (creator held out -> predicts other creators' mean)
    base = np.empty_like(y)
    for tr, te in logo.split(X, y, groups):
        base[te] = y[tr].mean()
    result["baseline_globalmean"] = {
        "pooled_spearman": 0.0,
        "mae": round(float(mean_absolute_error(y, base)), 5),
        "r2": round(float(r2_score(y, base)), 4),
    }
    return result, d, X, y, preds


def plot_importance(X, y, target):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except Exception:
        return
    pipe = models()["hgb"].fit(X, y)
    imp = permutation_importance(pipe, X, y, n_repeats=20, random_state=0,
                                 scoring="neg_mean_absolute_error")
    order = np.argsort(imp.importances_mean)[-15:]
    plt.figure(figsize=(7, 5))
    plt.barh([FEATURES[i] for i in order], imp.importances_mean[order], color="#4c78a8")
    plt.title(f"M1 permutation importance — {target}\n(in-sample, directional)")
    plt.xlabel("mean MAE increase when shuffled")
    plt.tight_layout()
    plt.savefig(OUT / f"m1_importance_{target}.png", dpi=130)
    plt.close()


def plot_pred(d, y, yhat, target):
    try:
        import matplotlib
        matplotlib.use("Agg")
        import matplotlib.pyplot as plt
    except Exception:
        return
    plt.figure(figsize=(6, 6))
    for g in pd.unique(d.creator_id):
        m = d.creator_id.to_numpy() == g
        plt.scatter(y[m], yhat[m], label=g, alpha=0.7)
    lo, hi = float(min(y.min(), yhat.min())), float(max(y.max(), yhat.max()))
    plt.plot([lo, hi], [lo, hi], "k--", lw=1)
    plt.xlabel(f"actual {target}")
    plt.ylabel("predicted (leave-one-creator-out)")
    plt.title(f"M1 OOF predictions — {target}")
    plt.legend(fontsize=7)
    plt.tight_layout()
    plt.savefig(OUT / f"m1_pred_vs_actual_{target}.png", dpi=130)
    plt.close()


def main() -> int:
    OUT.mkdir(parents=True, exist_ok=True)
    df = pd.read_csv(ROOT / "model/datasets/video_level.csv")
    all_results = []
    for target in TARGETS:
        res, d, X, y, preds = evaluate(df, target)
        all_results.append(res)
        best = max(("hgb", "ridge"), key=lambda m: res[m]["within_creator_spearman"]
                   if not np.isnan(res[m]["within_creator_spearman"]) else -9)
        plot_importance(X, y, target)
        plot_pred(d, y, preds[best], target)
        print(f"\n=== {target}  (n={res['n']}, {res['creators']} creators) ===")
        for m in ("hgb", "ridge", "baseline_globalmean"):
            r = res[m]
            wc = r.get("within_creator_spearman", "—")
            print(f"  {m:20s} within-creator ρ={wc!s:>7}  pooled ρ={r.get('pooled_spearman','—')!s:>7}  "
                  f"MAE={r['mae']:.5f}  R²={r['r2']}")

    (OUT / "m1_results.json").write_text(json.dumps(all_results, indent=2))
    print(f"\nwrote {OUT/'m1_results.json'} + importance/pred plots")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
