# 04 — Product Pipeline (the end-to-end vision)

> The shipped product: **upload a video → predict its EEG/interest waveform → predict
> likes/comments from that waveform → have an LLM explain how to improve it.** EEG is
> the **mediator**, not a side-signal. Trained on the EEG we collect by scrolling the
> stimulus set ourselves (sessions run shortly).

## The chain

```
 upload video
   │
 [1] extract features              ✅ model/extract_features.py
   │     windows[] (0.5s) + hook(0-3s) + aggregate
   ▼
 [2] features → PREDICT EEG curve   🔒 model/train_interest.py        (M2, the hero)
   │     per-window interest_0_1 waveform
   ▼
 [3] EEG curve → PREDICT virality   🔒 model/train_virality_from_eeg.py (M1-via-EEG)
   │     likes / comments / engagement_rate
   ▼
 [4] features + weak-windows → LLM advice   🟢 model/explain.py
   │
 end-to-end glue: model/predict.py  (chains 1→2→3→4)
```

## Why mediated (and why the direct baseline matters)

`model/train_virality.py` (M1 direct: features → engagement) is the **baseline**, and on
the current data it is **null** — leave-one-creator-out within-creator Spearman ≈ 0.03,
does not beat a global-mean predictor (5 creators, one niche, N=121). That null is the
point: raw features don't predict virality, so the bet is that the **brain response
does**. The EEG-mediated path must beat this baseline to justify itself; that comparison
is the headline scientific claim.

## Stage interfaces (lock these so stages plug together)

- **[1]→[2]** `features.json.windows[]`: list of `{t, brightness, colorfulness,
  loudness_db, motion, face_present, face_size_frac, cut_in_window, ocr_text_present, …}`.
- **[2] output** predicted curve: `[{t, interest_0_1}]` at the same 0.5s cadence.
  Training target = real EEG interest from `hardware/analysis/join_eeg.py` per-window
  export (Task P-03): `out/<eegSyncId>_per_window.csv` → `exposure_id,t,interest_0_1,coverage,quality`.
- **[2]→[3]** per-video EEG summary vector: `{mean_interest, auc, hook_interest(0-3s),
  peak, dip, slope, frac_above_0.5}` — computed from the curve (real or predicted).
- **[3] output** `{engagement_rate, like_rate, comment_rate}`; trained on the per-video
  EEG summary (real, averaged over participants) vs IG labels (`model/datasets/ig_labels.csv`).
- **[4] input** `features.json` + predicted curve + the weakest windows; **output**
  structured `{overall, hook_critique, weak_sections[], edits[]}`.

## Data we must collect (unblocks [2] and [3])

EEG recordings on the locked stimulus set, ≥3–5 participants, joined per-exposure +
per-window. The stimulus videos already carry IG labels, so once EEG exists we have
paired `(features, EEG, virality)` on the same 121 videos — both [2] and [3] train.
See `03-AGENT-TASKS.md` Task D-01.

## Build-now vs blocked

| Stage | Status | Notes |
|---|---|---|
| [1] extract | ✅ done | 121 videos, schema v2 |
| [2] train_interest | 🔒 data | build trainer + **synthetic-EEG** path now so the code runs end-to-end; swap real data in |
| [3] train_virality_from_eeg | 🔒 data | same; compare against the null M1 direct baseline |
| [4] explain.py | 🟢 now | runs on features today; gets sharper with predicted weak-windows |
| predict.py glue | 🟢 now | wire 1→2→3→4 with stubs that become real models |
| M1 direct baseline | ✅ done | `train_virality.py` — null, defines the bar |

> **Synthetic-EEG discipline:** any synthetic interest curve used to exercise [2]/[3]
> before real data MUST be loudly labeled synthetic and produce NO accuracy claims — it
> validates plumbing only.
