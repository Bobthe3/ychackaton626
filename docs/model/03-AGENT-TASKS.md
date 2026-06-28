# 03 — Agent Task Cards

> Discrete, parallelizable units to hand to coding agents. Each card: **goal · inputs ·
> outputs · files · acceptance · depends-on**. IDs are stable; reference them in PRs.
> **Ordering (decided 2026-06-27):** EEG sessions (D-01) run **later** and are
> human-in-loop — **not on the agents' critical path**. The agent critical path is
> **F-01 → F-02 → P-02 → M-01 + M2a**, building **EEG-ready against the fixtures** so
> D-01's recordings plug in later with no rework. D-02/M2b/M-03-EEG switch on when
> real sessions land. F-01 is the quick first win.

## Phase D — Real EEG data (scheduled later, human-in-loop)

### D-01 · Run real EEG study sessions on the locked stimulus set ⏳ deferred
- **Goal:** Generate the EEG↔video data: real participants watching the stimulus feed
  **with the headset on**, producing joinable recordings. **Scheduled for later** —
  everything else is built EEG-ready so this is a drop-in, not a dependency.
- **Inputs:** feed app (codes `EEG30`/`EEG10`/`EEG05`), `record.py`, locked stimulus set.
- **Steps:** (1) lock the stimulus subset (single Tech-UGC sub-niche, see F-01).
  (2) Per session: start `record.py --eeg-sync-id <app eegSyncId>` **using the app's
  real `eegSyncId`**, run the session ≤ proven-stable length (per `docs/EEG_30_MIN_*`),
  Ctrl-C to flush. (3) Export `per_exposure_participant.csv` + `eeg_join_events.csv`.
  (4) Run `join_eeg.py --eeg-sync-id <id>` and confirm non-empty `interest_0_1`.
- **Output:** ≥3–5 sessions, each with a recording whose `eeg_sync_id` matches real
  exposures; `out/<id>_per_exposure.csv` with real interest values.
- **Acceptance:** ≥60 exposures total with `eeg_coverage_frac ≥ 0.5`. Document
  participant count + total exposures.
- **Depends on:** F-01 (stimulus lock). **Owner:** human-in-loop (hardware).

### D-02 · Verify the end-to-end EEG join (fixture now, real later)
- **Goal:** De-risk the join so D-01 data is plug-in. **Do this now on the committed
  fixture** (`hardware/analysis/sample_per_exposure_fixture.csv` + the `conn-test-*`
  recording, both already work per the join README); re-run on the first real session
  when D-01 lands.
- **Acceptance (now):** fixture flows export → `join_eeg.py` → non-empty per-exposure
  interest + a sanity plot. **Acceptance (later):** same on one real `eegSyncId`; fix
  any `eeg_sync_id`-empty / epoch-mismatch issues.
- **Depends on:** none for the fixture pass. Real pass depends on D-01.

## Phase F — Feature layer v2

### F-01 · Finish features on all 122 + rebuild the rollup
- **Goal:** The current `analysis-summary.csv` is stale (1 row) though ~81
  `features.json` exist; not all 122 are analyzed.
- **Steps:** run `npm run videos:analyze` (with `--transcribe`) over the full
  selected set; regenerate `analysis-summary.csv` from **all** per-video JSONs;
  report missing downloads.
- **Acceptance:** `analysis-summary.csv` has one row per available video (≈122),
  0 unexplained errors; `missing-downloads.json` lists any gaps.
- **Depends on:** none. Quick win, do first.

### F-02 · Time-resolve the existing features (schema v2)
- **Goal:** Stop averaging — emit per-window curves + a 0–3s `hook` block + derived
  `aggregate`, per the contract in `01-CHARACTERISTICS.md`.
- **Scope:** brightness, colorfulness, loudness(RMS), cut density, OCR-text-present,
  duration/aspect controls. (Face/motion is F-03.)
- **Files:** new `model/extract_features.py` (fork of `scripts/analyze-selected-videos.py`);
  reuse its ffmpeg/scenedetect/audio code. Write `model/features/<id>.json` v2.
- **Acceptance:** every analyzed video has a v2 JSON with `windows[]`, `hook`,
  `aggregate`, `feature_schema_version:"2.0"`; existing aggregate numbers reproduce
  within rounding.
- **Depends on:** F-01.

### F-03 · Add face + motion features (highest-value new visual work)
- **Goal:** `face_present/size/centrality/count` (MediaPipe or OpenCV Haar/DNN) and
  `motion_magnitude` (frame-diff; optical flow optional), per window + `hook_face`,
  `is_talking_head`.
- **Files:** extend `model/extract_features.py`; add deps to `model/.venv`.
- **Acceptance:** v2 JSON gains face/motion fields; spot-check 5 videos by eye
  (talking-head vs b-roll classified correctly).
- **Depends on:** F-02.

### F-04 · Promote audio semantics
- **Goal:** explicit `speech_present`/`music_present` flags, `silence_fraction`,
  `onset_density`, `hook_loudness` (from `soundscape_hint` rules already in the script).
- **Acceptance:** flags present + sanity-checked on 5 clips.
- **Depends on:** F-02. Can run parallel to F-03.

## Phase P — Dataset build

### P-01 · IG label derivation
- **Goal:** From `selected-videos.csv` derive content-intrinsic targets: `like_rate`,
  `share_rate`, `comment_rate`, `engagement_rate`, `views_log`,
  `views_rank_within_creator`. Attach `creator_id`, `selection_type`.
- **Output:** `model/datasets/ig_labels.csv`. **Depends on:** none.

### P-02 · Build the unified tables
- **Goal:** `build_dataset.py` → `video_level.parquet` (M1) + `exposure_level.parquet`
  (M2/M3) per `02-PIPELINE-AND-MODELS.md`.
- **Acceptance:** row counts logged at each join; no silent drops; both tables load in
  pandas with expected columns; quality filters applied + counted.
- **Depends on:** F-02, P-01, D-02 (for the EEG side; behavioral side can build earlier).

### P-03 · Per-window EEG interest export
- **Goal:** Extend `join_eeg.py` to also emit a **per-0.5s-window** interest series per
  exposure (not just one aggregate), aligned to the feature window cadence, for M2b.
- **Output:** `out/<id>_per_window.csv` (`exposure_id,t,interest_0_1,coverage,quality`).
- **Acceptance:** window cadence matches feature extractor; **fixture test passes now**
  (build + validate against the committed fixture; real recordings flow through
  unchanged when D-01 lands).
- **Depends on:** none for the fixture build. (Pure read/offline — does not touch the recorder.)

## Phase M — Models

### M-01 · M1 virality/engagement regressor
- GroupKFold-by-creator; target `engagement_rate` (+ `share_rate`, `like_rate`);
  baseline = creator-mean; SHAP plot. **Out:** `model/out/m1_*.{json,png}` + a 1-para
  results note. **Acceptance:** beats baseline on Spearman ρ; importance plot produced.
- **Depends on:** P-02.

### M-02 · M2 interest/retention curve model (HERO)
- M2a (app retention) always; M2b (EEG interest) if D-01 delivered. Leave-one-video-out;
  **hero plot = predicted curve vs real EEG curve** for one held-out recorded video,
  with annotated peaks/dips. **Acceptance:** curve correlation reported; hero plot saved.
- **Depends on:** P-02, P-03.

### M-03 · M3 bridge analysis
- Correlations: EEG interest ↔ app completion; EEG/engagement ↔ IG engagement_rate;
  hook features ↔ first-3s EEG interest. Scatter plots + ρ/CI. **Acceptance:** 3
  plots + a caption each, "provisional/relative" noted. **Depends on:** P-02, P-03.

### M-04 · predict.py (the live demo)
- Drop an MP4 → run extractor → M1 score + M2 annotated interest curve, rendered to a
  PNG/JSON. **Acceptance:** runs on an unseen MP4 end-to-end in one command; output is
  presentation-ready. **Depends on:** M-01, M-02.

## Phase X — Demo surface

### X-01 · Wire score + curve into the presentation screen
- Feed M-04 output into the live-demo screen (replay overlay per PRD §7). Coordinate
  file ownership with Holly. **Depends on:** M-04. **Owner:** Holly + Devan.

## Dependency sketch

Agent critical path is the top two rows (fixture-ready, no EEG-session dependency).
D-01 is deferred/human-in-loop; when it lands it re-runs D-02/P-03 with real data and
flips M2b/M-03-EEG from fixture to real — no rebuild.

```
NOW (agents):
  F-01 ─┬─ F-02 ─┬─ F-03 ─┐
        │        └─ F-04 ─┤
  P-01 ─┤                 ├─ P-02 ─┬─ M-01
  D-02(fixture) ─ P-03 ───┘        └─ M-02a (proxy hero), M-03(beh) ─ M-04 ─ X-01

LATER (human-in-loop):
  D-01 (run sessions) ─ D-02(real)/P-03(real) ─ M-02b (EEG hero), M-03(EEG)  ⟶ plug into M-04
```
