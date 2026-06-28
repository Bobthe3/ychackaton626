# 02 — Pipeline & Models

> How the feature layer ([`01`](./01-CHARACTERISTICS.md)) and the three label
> sources become one training table, and what we train on it. All offline.

## Proposed code layout (new top-level `model/`)

```
model/
  extract_features.py   # upgrade of scripts/analyze-selected-videos.py → schema v2 (per-window + hook + aggregate)
  build_dataset.py      # join features + IG labels + app exposures + EEG interest → parquet/csv tables
  train_virality.py     # M1
  train_interest.py     # M2
  bridge_analysis.py    # M3 correlations + plots
  predict.py            # inference: MP4 → virality score + annotated interest curve
  datasets/             # built tables (gitignored)
  out/                  # model artifacts, plots, SHAP (gitignored)
```

Reuse the existing venv where possible (`hardware/capture/.venv` has numpy/scipy;
add scikit-learn, pandas, mediapipe, opencv-python in a dedicated `model/.venv` to
avoid disturbing the recorder env).

## The unified dataset (build_dataset.py)

Three joins, three grains. Produce **two tables**:

### Table 1 — `video_level.parquet` (for M1, one row per video)
Join key: `video_id`.
- **Features:** `aggregate` + `hook` blocks from `model/features/<id>.json`.
- **IG labels:** from `selected-videos.csv` → derive content-intrinsic targets:
  - `like_rate = like_count / views`
  - `share_rate = shares / views`
  - `comment_rate = comment_count / views`
  - `engagement_rate = (likes+comments+shares) / views`
  - `views_log = log10(views)` (keep, but **not** the headline target)
  - `views_rank_within_creator` (rank by views inside each `creator_id`)
- **App labels (if seen in study):** mean `pct_watched`, completion rate, save rate,
  mean dwell from `per_exposure_participant.csv` aggregated by `video_id`.

### Table 2 — `exposure_level.parquet` (for M2/M3, one row per exposure)
Join key: `exposure_id`. Source: `per_exposure_participant.csv` LEFT JOIN
`hardware/analysis/out/<eegSyncId>_per_exposure.csv` on `exposure_id`.
- Behavioral: `dwell_ms, watch_ms, pct_watched, loops, final_thumb, saved`.
- Neural: `interest_0_1, theta_power, beta_power, theta_beta_ratio,
  eeg_coverage_frac, mean_channel_quality`.
- Carry `video_id, content_type, feed_position, participant_id`.
- **Window-level variant** (for curve modeling): re-slice EEG into the same 0.5s
  cadence as the feature `windows[]` so each video window has an aligned interest
  value. Extend `join_eeg.py` to emit a per-window CSV (Task P-03), or resample in
  `build_dataset.py`.

Filter quality: drop exposures with `eeg_coverage_frac < 0.5` or
`mean_channel_quality < threshold`. Log how many rows survive (no silent dropping).

## M1 — Virality / engagement regressor

- **X:** `video_level` aggregate + hook features (+ controls: duration, aspect).
- **y (headline):** `engagement_rate`. Also fit `share_rate`, `like_rate` separately.
- **Model:** gradient boosting (`HistGradientBoostingRegressor`) or ridge; both,
  report the better. Keep it interpretable.
- **CV:** **GroupKFold by `creator_id`** (a creator never spans train+test) — this is
  the anti-leakage requirement; report vs a creator-mean baseline.
- **Metrics:** Spearman ρ (rank), MAE, R². Headline = "beats creator-mean baseline".
- **Explain:** SHAP / permutation importance → the "top drivers of virality" slide.

## M2 — Interest / retention curve model (the hero)

Two sub-targets; do whichever has data:
- **M2a (always available): retention curve from app data.** time-resolved features →
  per-window "still watching" probability or `pct_watched` shape. Trains on all
  study exposures even without EEG.
- **M2b (the mind-reading demo): EEG interest curve.** window features → `interest_0_1`
  per window. Needs real EEG sessions (Task D-01).
- **Model:** per-window regression (gradient boosting) or a small sequence model
  (1D smoothing + ridge) — N is small, keep it light. Predict the *curve*, then
  detect peaks/dips for annotation.
- **Eval:** leave-one-video-out; report curve correlation (predicted vs real EEG
  interest) and whether predicted peaks land on real peaks. **Hero visual:** overlay
  predicted curve + real EEG curve for one held-out recorded video.

## M3 — The bridge (credibility)

Pure correlation/plots, no training:
- EEG `interest_0_1` vs app `pct_watched` / completion (per exposure) → expect ρ > 0.
- EEG interest & engagement_rate vs IG `engagement_rate` (per video) → directional.
- Hook features vs first-3s EEG interest → "good hooks light up the brain".
Report ρ + CI; show scatter plots. This is the slide that says "the signal is real".

## Anti-leakage & honesty guardrails (enforce in code review)

1. **Group CV by creator** for M1; **leave-one-video-out** for M2. No video/creator
   in both splits.
2. **No raw views as headline target.** Content-intrinsic rates only.
3. **Report N and dropped rows** at every join. Small N stated openly.
4. **EEG interest labeled "provisional / relative"** in every plot caption.
5. **Baselines always shown** (creator-mean for M1, global-mean curve for M2).
6. Pin `feature_schema_version`; fail loudly on mismatch.

## Reproducibility

- One command rebuilds everything: `make dataset && make train` (or a `run_all.sh`).
- Deterministic seeds. Built tables + artifacts gitignored; scripts + small fixtures
  committed.
