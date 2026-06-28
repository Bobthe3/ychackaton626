#!/usr/bin/env python3
"""
⚠️  SYNTHETIC EEG — NOT REAL BRAIN DATA  ⚠️

SYNTHETIC = True   # every output row carries this flag

This module fabricates plausible per-0.5 s interest_0_1 curves from
video feature windows[] using a transparent, hand-crafted formula.

PURPOSE: exercise the model-training plumbing for stages [2] and [3]
before real EEG recordings (Task D-01) are collected.  It makes NO
accuracy claims whatsoever.  All downstream code must loudly label any
result produced with this module as SYNTHETIC.

Feature schema version: "2.0"

──────────────────────────────────────────────────────────
WHAT TO CHANGE WHEN REAL EEG ARRIVES (Task P-03)
──────────────────────────────────────────────────────────
  Nothing in this file needs to change.  Instead:
    1. Run hardware/analysis/join_eeg.py to export
         hardware/analysis/out/<eegSyncId>_per_window.csv
       with schema: exposure_id, video_id, t, interest_0_1, coverage, quality
    2. Pass that CSV to:
         python3 model/train_interest.py --per-window <csv>
         python3 model/train_virality_from_eeg.py --eeg-summary <summary_csv>
       The --synthetic flag is never used again.
──────────────────────────────────────────────────────────

Per-window output schema (matches P-03 export, minus exposure_id):
    video_id     str    video identifier
    t            float  window start time in seconds (0.5 s cadence)
    interest_0_1 float  synthetic interest score clipped to [0, 1]
    _synthetic   bool   always True (provenance tag)

Stage [2]→[3] summary vector schema:
    mean_interest  float  mean interest_0_1 over all windows
    auc            float  trapezoidal AUC normalised by video duration
    hook_interest  float  mean interest_0_1 for t < 3.0 s
    peak           float  max interest_0_1
    dip            float  min interest_0_1
    slope          float  linear-regression slope of interest_0_1 vs t
    frac_above_0.5 float  fraction of windows with interest_0_1 > 0.5
"""
from __future__ import annotations

SYNTHETIC = True  # ← provenance sentinel; never set to False here

import hashlib
import json
from pathlib import Path
from typing import Optional

import numpy as np
import pandas as pd

ROOT = Path(__file__).resolve().parent.parent
FEATURES_DIR = ROOT / "model" / "features" / "videos"
SCHEMA_VERSION = "2.0"

# ─────────────────────────── synthetic formula (v1) ───────────────────────────
#
#  interest = clip(base
#                  + face_boost    (0.15 * face_present + 0.05 * face_size_frac)
#                  + motion_boost  (0.10 * clip(motion / 0.20, 0, 1))
#                  + loud_boost    (0.08 * clip(1 - |loudness_db| / 40, 0, 1))
#                  + text_boost    (0.07 * ocr_text_present)
#                  + hook_boost    (0.10 if t < 3.0 else 0)
#                  + cut_boost     (0.05 * cut_in_window)
#                  + time_decay    (-0.20 * t / duration_s)
#                  + noise         (N(0, 0.07) seeded by video_id + window_idx)
#              , 0, 1)
#
# Rationale:
#   • Faces and motion drive visual salience → higher EEG engagement
#   • Louder audio (|db| closer to 0) → higher alertness
#   • On-screen text → cognitive load → more engagement
#   • Hook window (0-3 s) → extra attention burst
#   • Scene cuts → novelty spike
#   • Attention linearly decays with time (content-agnostic fatigue)
# ──────────────────────────────────────────────────────────────────────────────

_BASE = 0.50
_FACE_W = 0.15
_FACE_SIZE_W = 0.05
_MOTION_W = 0.10
_MOTION_NORM = 0.20
_LOUD_W = 0.08
_LOUD_NORM = 40.0
_TEXT_W = 0.07
_HOOK_W = 0.10
_HOOK_THRESH_S = 3.0
_CUT_W = 0.05
_DECAY_W = 0.20
_NOISE_STD = 0.07


def _det_noise(video_id: str, window_idx: int, seed: int = 42) -> float:
    """Deterministic Gaussian noise seeded by (video_id, window_idx, master_seed)."""
    key = f"{video_id}:{window_idx}:{seed}".encode()
    h = int(hashlib.md5(key).hexdigest(), 16) % (2 ** 32)
    rng = np.random.default_rng(h)
    return float(rng.normal(0.0, _NOISE_STD))


def synth_interest_curve(
    windows: list[dict],
    video_id: str,
    duration_s: Optional[float] = None,
    rng_seed: int = 42,
) -> list[dict]:
    """
    Fabricate per-window {video_id, t, interest_0_1, _synthetic} rows.

    Parameters
    ----------
    windows    : list of window dicts from features JSON windows[]
    video_id   : video identifier (used for noise seed)
    duration_s : total video duration; defaults to last_t + 0.5
    rng_seed   : master seed for reproducibility

    Returns
    -------
    list of dicts — one per window — matching the P-03 per-window schema
    (minus exposure_id which is only present in real recordings).
    """
    if not windows:
        return []

    ts = [float(w["t"]) for w in windows]
    dur = float(duration_s) if duration_s is not None else (max(ts) + 0.5)
    if dur <= 0:
        dur = max(ts) + 0.5

    rows: list[dict] = []
    for idx, w in enumerate(windows):
        t = float(w["t"])

        face_boost = (
            _FACE_W * float(w.get("face_present", 0))
            + _FACE_SIZE_W * float(w.get("face_size_frac", 0.0))
        )
        motion = float(w.get("motion", 0.0))
        motion_boost = _MOTION_W * float(np.clip(motion / _MOTION_NORM, 0.0, 1.0))

        loudness = float(w.get("loudness_db", -40.0))
        loud_boost = _LOUD_W * float(np.clip(1.0 - abs(loudness) / _LOUD_NORM, 0.0, 1.0))

        text_boost = _TEXT_W * float(w.get("ocr_text_present", 0))
        hook_boost = _HOOK_W if t < _HOOK_THRESH_S else 0.0
        cut_boost = _CUT_W * float(w.get("cut_in_window", 0))
        time_decay = -_DECAY_W * (t / dur)
        noise = _det_noise(video_id, idx, rng_seed)

        raw = (
            _BASE + face_boost + motion_boost + loud_boost + text_boost
            + hook_boost + cut_boost + time_decay + noise
        )
        interest = float(np.clip(raw, 0.0, 1.0))

        rows.append({
            "video_id": video_id,
            "t": round(t, 4),
            "interest_0_1": round(interest, 4),
            "_synthetic": True,
        })
    return rows


def build_synth_dataset(
    features_dir: Path = FEATURES_DIR,
    rng_seed: int = 42,
) -> pd.DataFrame:
    """
    Walk all feature JSON files under features_dir and generate synthetic
    interest curves for every video whose feature_schema_version == "2.0".

    Returns DataFrame with columns: video_id, t, interest_0_1, _synthetic.
    """
    all_rows: list[dict] = []
    skipped = 0
    for vdir in sorted(features_dir.iterdir()):
        if not vdir.is_dir():
            continue
        vid = vdir.name
        jpath = vdir / f"{vid}.json"
        if not jpath.exists():
            continue
        feat = json.loads(jpath.read_text())
        if feat.get("feature_schema_version") != SCHEMA_VERSION:
            print(f"  WARNING synth_eeg: {vid} schema "
                  f"'{feat.get('feature_schema_version')}' != '{SCHEMA_VERSION}' — skipping")
            skipped += 1
            continue
        rows = synth_interest_curve(
            feat["windows"],
            vid,
            feat.get("duration_s"),
            rng_seed,
        )
        all_rows.extend(rows)

    df = pd.DataFrame(all_rows)
    if skipped:
        print(f"  synth_eeg: skipped {skipped} videos with wrong schema version")
    return df


def eeg_summary_vector(
    curve_rows: list[dict],
    hook_window_s: float = 3.0,
) -> dict:
    """
    Collapse a per-window interest curve into the stage [2]→[3] summary vector.

    Parameters
    ----------
    curve_rows    : list of {t, interest_0_1, ...} dicts (one per window)
    hook_window_s : seconds defining the "hook" period (default 3.0)

    Returns
    -------
    dict with keys (all float):
        mean_interest, auc, hook_interest, peak, dip, slope, frac_above_0.5
    """
    _nan = {k: float("nan") for k in
            ["mean_interest", "auc", "hook_interest", "peak",
             "dip", "slope", "frac_above_0.5"]}
    if not curve_rows:
        return _nan

    ts = np.array([float(r["t"]) for r in curve_rows])
    vs = np.array([float(r["interest_0_1"]) for r in curve_rows])

    # Sort by time (defensive)
    order = np.argsort(ts)
    ts = ts[order]
    vs = vs[order]

    hook_mask = ts < hook_window_s
    hook_interest = float(vs[hook_mask].mean()) if hook_mask.any() else float("nan")

    duration = float(ts[-1] - ts[0]) if len(ts) > 1 else 0.5
    auc = float(np.trapz(vs, ts) / duration) if duration > 0 else float(vs.mean())

    slope = float(np.polyfit(ts, vs, 1)[0]) if len(ts) > 1 else 0.0

    return {
        "mean_interest": round(float(vs.mean()), 4),
        "auc": round(auc, 4),
        "hook_interest": round(hook_interest, 4),
        "peak": round(float(vs.max()), 4),
        "dip": round(float(vs.min()), 4),
        "slope": round(slope, 6),
        "frac_above_0.5": round(float((vs > 0.5).mean()), 4),
    }


# ─────────────────────────── CLI (smoke-test / CSV export) ───────────────────

if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="Generate SYNTHETIC EEG interest curves from video features"
    )
    parser.add_argument("--out", type=Path, default=None,
                        help="Write per-window CSV to this path")
    parser.add_argument("--seed", type=int, default=42,
                        help="Random seed for reproducibility (default 42)")
    args = parser.parse_args()

    print()
    print("=" * 60)
    print("⚠️  SYNTHETIC EEG — NOT REAL BRAIN DATA  ⚠️")
    print("   Plumbing exercise only.  No accuracy claims.")
    print("=" * 60)

    df = build_synth_dataset(rng_seed=args.seed)
    print(f"\nGenerated {len(df)} synthetic per-window rows "
          f"for {df['video_id'].nunique()} videos")
    print(f"\nSample rows:")
    print(df[["video_id", "t", "interest_0_1"]].head(10).to_string(index=False))

    sample_vid = df["video_id"].iloc[0]
    rows = df[df["video_id"] == sample_vid].to_dict("records")
    sv = eeg_summary_vector(rows)
    print(f"\nSummary vector for {sample_vid}:")
    for k, v in sv.items():
        print(f"  {k:<20s} = {v}")

    if args.out:
        args.out.parent.mkdir(parents=True, exist_ok=True)
        df.to_csv(args.out, index=False)
        print(f"\nWrote {args.out}")

    print("\n⚠️  SYNTHETIC — PLUMBING ONLY ⚠️")
