# interest_v2 — a behaviorally-grounded interest score

## Why
The legacy `interest_0_1` was a single EEG feature (theta/beta), inverted and normalized
to a session's 5th/95th percentile — not anchored to any observed behavior, and only
defined where EEG exists. `interest_v2` is grounded in the analytics the app actually
records, so the number means something concrete.

## Definition (per exposure, 0–1)
A weighted fusion of the collected signals, each mapped to [0,1], with weights
**renormalized over whichever components are present** for that exposure:

| component | from collected data | weight | rationale |
|---|---|---|---|
| `completion` | `pct_watched` | 0.35 | how much of the video was watched |
| `rewatch` | `1 − 0.5^loops` (saturating) | 0.25 | deliberate replays = strong interest |
| `explicit` | thumbs_up/save=1, thumbs_down=0 | 0.25 | direct interest statement (sparse: 15+/4−) |
| `eeg` | engagement-sign theta/beta (0–1) | 0.15 | neural engagement, quality-gated (cov & q ≥ 0.5) |

`interest_v2 = Σ wᵢ·cᵢ / Σ wᵢ` over present components.

**Dropped:** an attention component (`1 − awayMs/dwell`). `awayMs` / `attentionTracking`
exist in the event schema but are empty in this dataset (0 exposures) — nothing to ground
it on yet. Add it when that telemetry is populated.

## Grounding validation
Implicit-only score (completion+rewatch+eeg, **no** explicit) by what users explicitly said:
- thumbs_up / saved: **0.32** (n=15)  ·  neutral: **0.11** (n=282)  ·  thumbs_down: 0.41 (n=4)

What people *liked* was watched far more than neutral content (0.32 vs 0.11) — the implicit
behavior is grounded. The thumbs_down (n=4) scored high implicitly too: genuine
**hate-watching** (one video 98% watched + replayed, then disliked). Engagement ≠ approval —
which is exactly why `explicit` and `eeg` are kept as separate channels. With explicit
included, the full composite orders correctly: up **0.52** > down 0.29 > neutral 0.11.

## Scope
- Per **exposure** (behavioral signals are per-exposure scalars), so it grounds the
  per-exposure interest used for ranking videos / M3 / the "engaging vs viral" analysis.
- The per-**window** EEG curve (M2 target) stays EEG-derived; `interest_v2` is not a curve.
- Covers **301 exposures** (vs the ~169 EEG-only); EEG contributes to the 41 with good-quality EEG.

## Files
`hardware/analysis/interest_v2.py` → `out/engagement/interest_v2.csv` (per-component breakdown)
+ `interest_v2.json` (weights, validation, coverage). Weights are documented constants — tune
in the script; re-run to regenerate. Legacy `interest_0_1` is untouched.

## Result it changes
"Engaging but didn't go viral" (grounded): `jess_studytips_DZQ-rHvDstI` — interest_v2 **0.999**,
only **2,671 views**. Same creator's `DW7yS_FkaP5` had interest_v2 0.86 and **690K views** —
near-identical grounded engagement, 250× the reach.
