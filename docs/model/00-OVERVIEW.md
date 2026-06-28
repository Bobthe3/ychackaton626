# FlowState Model — Overview & Scope

> **Owner:** Devan · **Updated:** 2026-06-27 · **For:** YC hackathon (Reading Minds + AI UGC tracks)
>
> **Decisions locked (2026-06-27):** the **EEG interest/retention curve (M2) is the
> hero** (Reading Minds track). **Real EEG sessions will be run later** — so build the
> whole pipeline **EEG-ready on fixtures now**, so real recordings plug in with zero
> rework. Until then, **M2a (app-retention curve) is the immediately-trainable proxy
> hero** and the demo uses the fixture EEG overlay.
>
> This is the source-of-truth plan for the virality/retention model. Sibling files:
> [`01-CHARACTERISTICS.md`](./01-CHARACTERISTICS.md) (the feature catalog),
> [`02-PIPELINE-AND-MODELS.md`](./02-PIPELINE-AND-MODELS.md) (dataset build + training/eval),
> [`03-AGENT-TASKS.md`](./03-AGENT-TASKS.md) (agent-ready task cards).

## 1. The vision (one sentence)

Extract video characteristics **offline**, join them to **EEG interest** recorded
while people watched those videos, and produce (a) a per-video **virality/engagement
score** and (b) a **predicted neural-interest / retention curve** that shows *where in
a video attention spikes and dips*.

**Everything is offline / post-hoc.** The only real-time component is the feed-study
app, which already captures interaction analytics and is **done — do not modify it**
unless a new analytics field is explicitly required (see Task R-04 guard).

## 2. The model frame: one feature layer, three label bridges

```
            ┌─────────── offline video feature layer ───────────┐
 video ──▶  │ time-resolved curves (1–2 Hz) + 0–3s hook + aggregate │
            └───────────────────────────────────────────────────┘
                         │              │               │
                         ▼              ▼               ▼
              IG engagement-rate   App retention    EEG interest curve
                 (market)          (behavioral)        (neural) ★HERO
   M1: aggregate → engagement score      M2: time-resolved → interest/retention curve
                         └──── M3: show all three agree (credibility) ─────┘
```

- **M1 — Virality/engagement regressor.** Aggregate features → content-intrinsic
  engagement rate. The "will it pop" number, with SHAP "why".
- **M2 — Interest/retention curve model (the hero).** Time-resolved features →
  EEG interest curve and/or app retention. Annotated peaks/dips. On recorded videos,
  overlay the *real* EEG to prove the prediction tracks reality.
- **M3 — The bridge.** EEG interest correlates with app completion and with virality
  — the argument that the neural signal is real and predictive.

## 3. Data inventory (what exists today)

| Asset | Path | Grain | State |
|---|---|---|---|
| Stimulus videos | `server/data/stimulus-videos/`, `selected-stimuli.sql` | per video (~81 imported of 122) | ✅ |
| IG virality labels | `scripts/ig-reels-scraper/ig-data/selected-videos.csv` | per video (views/likes/comments/shares) | ✅ creator-confounded |
| Offline features | `scripts/.../video-analysis/videos/<id>/features.json` | per video, **aggregate only** | ✅ 81 files; rollup CSV stale |
| App behavioral labels | `server/data/exports/per_exposure_participant.csv`, `eeg_join_events.csv` | per exposure | ✅ |
| EEG recordings | `hardware/recordings/<eegSyncId>.csv` (+`.meta.json`) | 4ch @ 200Hz | ⚠️ only bench tests so far |
| EEG↔exposure join | `hardware/analysis/join_eeg.py` → `out/<id>_per_exposure.csv` | per exposure, `interest_0_1` | ✅ works on fixtures |

## 4. Honest constraints (bake these into every decision)

1. **Raw `views` is mostly distribution, not content.** ~122 videos from a few
   creators → follower count dominates views. **Target content-intrinsic labels:**
   engagement *rate* (likes/views, shares/views, saves/views), in-app completion,
   EEG interest. Validate **within-creator** (grouped CV). Never train on raw views
   as the headline target.
2. **EEG↔video data does not exist yet — sessions run later (decided).** Recordings
   are `conn-test-*` benches; `eeg_sync_id` is "often empty in real exports". The real
   participant sessions on the locked stimulus set (Task D-01) are **scheduled for
   later**, so they are **not on the agents' critical path**. The mandate instead:
   build the pipeline **EEG-ready against the fixtures** (`join_eeg.py` sample fixture)
   so D-01's output is a plug-in, not a rebuild. Train **M2a (app retention)** now as
   the proxy hero; M2b (EEG) and the EEG side of M3 switch on the moment D-01 lands.
3. **Small N everywhere.** 122 videos for M1; a few sessions × ~20–40 exposures for
   M2. → Use **simple, interpretable models** (gradient boosting / linear / ridge),
   leave-one-out or grouped CV, and **report uncertainty**. No deep nets.
4. **EEG interest is provisional.** It's an inverted, within-session-normalized
   theta/beta ratio (see `join_eeg.py` README). Present as a *relative directional*
   signal, validated against behavioral retention — not a calibrated absolute.
5. **Hardware caps session length** (30-min dropout under investigation). Plan
   sessions ≤ the proven-stable duration; chunk if needed.

## 5. Success criteria (what "done" looks like for the demo)

- [ ] **One unified training table** built from features + 3 label sources (Task P-02).
- [ ] **M1** predicts engagement rate with grouped CV better than a creator-mean
      baseline, with a SHAP plot of top drivers (Task M-01).
- [ ] **M2** produces a per-video interest/retention curve; on ≥1 real recorded
      video the predicted curve visibly tracks the real EEG curve (Task M-02).
- [ ] **M3** shows a positive, reported correlation: EEG interest ↔ app completion,
      and EEG/engagement ↔ virality (Task M-03).
- [ ] **`predict.py`**: drop in an MP4 → virality score + annotated interest curve
      (Task M-04). This is the live judge demo.

## 6. Milestones (suggested order; full cards in `03-AGENT-TASKS.md`)

1. **Unblock data** — finish features on all 122, run real EEG sessions (D-01, F-01).
2. **Feature layer v2** — time-resolved + hook + face/motion (F-02, F-03).
3. **Dataset build** — join everything to one table (P-01, P-02).
4. **Models** — M1, M2, M3, predict.py (M-01…M-04).
5. **Demo surface** — wire curve + score into the presentation screen (X-01).
