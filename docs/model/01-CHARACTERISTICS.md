# 01 — The Characteristics (solidified feature catalog)

> The thing you asked to lock first. This is the contract the feature extractor
> (`model/extract_features.py`, an upgrade of `scripts/analyze-selected-videos.py`)
> must produce. Every feature is **offline** (pre/post-hoc), nothing real-time.

## Two principles that drive everything

1. **Time-resolved first, aggregate second.** Emit a **per-window feature row** at a
   fixed cadence (default **2 Hz**, i.e. every 0.5s; configurable). Aggregates
   (mean/std/max + slope) are derived *from* the curves. The curve is what aligns to
   the EEG interest curve and powers M2 ("where it spikes").
2. **The hook window (0–3s) is its own feature block.** Short-form retention is won
   or lost in the first ~3s. Compute every feature again, restricted to 0–3s, and
   expose them as `hook_*`.

Output schema is **versioned** (`feature_schema_version`) so models pin a version.

## Feature catalog

Legend — **TR** = emit as time-resolved curve · **Agg** = aggregate scalar ·
**Exists** = already produced by `analyze-selected-videos.py` · **Eff** = build effort.

### A. Text  (strong predictor, easy)
| Feature | TR/Agg | Exists | Definition | Eff |
|---|---|---|---|---|
| `ocr_text_presence` | TR | partial | fraction of frame-window with on-screen text (already have ratio, make it a curve) | S |
| `ocr_text_zone` | Agg | ✅ | top/middle/bottom distribution; `likely_subtitles` flag | — |
| `hook_text_present` | Agg | ✗ | is there overlay text in 0–3s (huge for retention) | S |
| `transcript_wps` | TR | ✗ | words/sec from Whisper segment timestamps (speech pace) | M |
| `opening_curiosity` | Agg | ✗ | opening line contains question / number / "how/why/secret" (curiosity-gap heuristic on first transcript segment) | S |
| `top_terms` | Agg | ✅ | keep for qualitative/LLM tagging, not a numeric feature | — |

### B. Pacing / scene cuts  (strong, easy)
| Feature | TR/Agg | Exists | Definition | Eff |
|---|---|---|---|---|
| `cuts_per_sec` | Agg | ✅(count) | scene cuts / duration | S |
| `cut_density_curve` | TR | ✗ | cuts in each rolling window (pacing over time) | S |
| `time_to_first_cut` | Agg | ✗ | seconds to first cut (fast start signal) | S |
| `hook_cuts` | Agg | ✗ | cut count in 0–5s | S |
| `mean_shot_len`, `shot_len_std` | Agg | ✗ | from `cut_times` gaps | S |

### C. Colour / palette  (weak–moderate, easy — keep cheap)
| Feature | TR/Agg | Exists | Definition | Eff |
|---|---|---|---|---|
| `brightness` | TR | ✅(mean) | per-window luma (already sampled per frame, stop averaging) | S |
| `colorfulness` | TR | ✅(mean) | Hasler-Süsstrunk colorfulness per window | S |
| `saturation`, `contrast` | Agg | ✗ | cheap add from existing frame samples | S |
| `dominant_rgb`, `avg_rgb` | Agg | ✅ | keep as-is | — |
> Don't over-invest. Colour is a production-quality proxy with a low predictive
> ceiling; ship the cheap version and move on.

### D. Audio  (good, but raise the level of abstraction)
| Feature | TR/Agg | Exists | Definition | Eff |
|---|---|---|---|---|
| `loudness_curve` (RMS dB) | TR | ✅(per-0.5s, then averaged) | **keep the series** you already compute, don't collapse to mean | S |
| `speech_present`, `music_present` | Agg | partial | promote `soundscape_hint` into explicit flags (centroid/ZCR/dyn-range rules already there) | S |
| `onset_density` / tempo | Agg | ✗ | beat/onset rate (energy in dynamics); proxy for "trending audio" punch | M |
| `hook_loudness` | Agg | ✗ | mean loudness 0–3s + whether audio starts immediately | S |
| `silence_fraction` | Agg | ✗ | fraction of windows below a dB floor | S |
| `spectral_centroid`, `dynamic_range` | Agg | ✅ | keep | — |

### E. Visual elements  (was too vague — made concrete; highest-value NEW work)
| Feature | TR/Agg | Exists | Definition | Eff |
|---|---|---|---|---|
| `face_present` | TR | ✗ | face detected in window (MediaPipe/OpenCV) | M |
| `face_size_frac`, `face_centrality` | TR | ✗ | largest-face area fraction + distance from center (talking-head/closeup signal) | M |
| `face_count` | TR | ✗ | number of faces | M |
| `hook_face` | Agg | ✗ | face present in first frame / 0–3s (one of the strongest UGC retention signals) | M |
| `motion_magnitude` | TR | ✗ | mean abs frame-difference (cheap) or optical-flow magnitude (richer) | M |
| `is_talking_head` | Agg | ✗ | derived: high face_centrality + low motion + speech_present | S |

### F. Normalization / controls  (not predictors — needed so models aren't fooled)
| Feature | Source | Why |
|---|---|---|
| `duration_s`, `aspect_ratio`, `width/height` | ffprobe ✅ | confounds retention; control for them |
| `creator_id` (username) | `selected-videos.csv` ✅ | **group key for CV**; follower base drives raw views |
| `selection_type` (top/random) | `selected-videos.csv` ✅ | sampling stratum |

## What to cut / de-prioritize

- Deep semantic scene classification, object detection beyond faces, aesthetic models
  — high effort, low marginal value at N=122. Skip for the hackathon.
- Raw `views` as a target (see `00-OVERVIEW.md` §4.1). Keep it only as a column.

## Output contract (one row per window + one summary row per video)

```jsonc
// model/features/<video_id>.json
{
  "feature_schema_version": "2.0",
  "video_id": "DXcanxdD2ls",
  "creator_id": "airlearn.anna",
  "duration_s": 38.87, "aspect_ratio": 0.5625, "fps_sampled": 2.0,
  "windows": [                    // TIME-RESOLVED — the curve
    { "t": 0.0, "brightness": 0.34, "colorfulness": 15.2, "loudness_db": -25.7,
      "cut_in_window": 0, "ocr_text_present": 1, "face_present": 1,
      "face_size_frac": 0.18, "motion": 0.07 },
    { "t": 0.5, ... }
  ],
  "hook": {                       // 0–3s block
    "hook_text_present": 1, "hook_face": 1, "hook_cuts": 2,
    "hook_loudness": -22.1, "opening_curiosity": 1 },
  "aggregate": {                  // derived from windows for M1
    "cuts_per_sec": 0.31, "time_to_first_cut": 1.4, "mean_shot_len": 3.2,
    "brightness_mean": 0.34, "colorfulness_mean": 15.2, "loudness_mean_db": -25.7,
    "speech_present": 1, "music_present": 0, "silence_fraction": 0.08,
    "face_present_frac": 0.74, "motion_mean": 0.09, "is_talking_head": 1,
    "ocr_text_presence_ratio": 0.55, "likely_subtitles": true,
    "transcript_wps_mean": 2.9 }
}
```

Keep `palettes/*.png` for the slides. The aggregate block is the row that feeds M1;
`windows[]` feeds M2 and the EEG alignment.
