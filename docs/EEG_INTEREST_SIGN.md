# EEG interest sign: use the engagement convention for the forehead montage

## TL;DR
The per-exposure / per-window `interest_0_1` label was computed by **inverting**
the theta/beta ratio (low theta/beta → high interest). That is the parietal/ADHD
convention. On FlowState's **forehead (frontal) Ganglion montage it is backwards**:
frontal-midline theta *rises* with sustained attention, so high theta/beta = more
engaged. Empirically the inverted label tracks watch behavior **negatively**; the
non-inverted ("engagement") label tracks it **positively**.

**Use the engagement-sign datasets in `hardware/analysis/out/engagement/`.**

## Evidence (within-session Spearman, coverage≥0.5 & quality≥0.5)
| relationship | inverted (legacy) | engagement (corrected) |
|---|---|---|
| interest vs `pct_watched` (app) | −0.48 | **+0.53** |
| interest vs `dwell_ms` (app+reels) | −0.46 | **+0.17** |
| raw `theta_beta_ratio` vs `pct_watched` | — | **+0.53** |

Two app sessions carry `pct_watched` (n=21, n=20); both show the same sign.
Behavior is an imperfect proxy for interest, but a consistent, strong negative
correlation under the legacy sign is a clear signal the inversion is wrong here.

## How to regenerate
Both tools take `--no-invert-interest` and `--out-dir` (non-destructive):
```bash
cd hardware/analysis
PY=../capture/.venv/bin/python
# app sessions (real eegSyncId ↔ time-bridged recording):
$PY join_eeg.py --eeg-sync-id <UUID> --recording ../recordings/<conn-test>.csv \
   --out-dir out/engagement --no-invert-interest
# reels_viewer logs:
$PY sync_reels_eeg.py --reels ~/Downloads/reels-*.csv \
   --recording ../recordings/<conn-test>.csv --label reels-XXXX \
   --out-dir out/engagement --no-invert-interest
```

## Model-ready artifacts (engagement sign)
- `out/engagement/ALL_per_exposure.csv` — 169 exposures (app 93 + reels 76)
- `out/engagement/ALL_per_window.csv` — 3,282 × 0.5 s tiles → **M2** `train_interest.py --per-window`
- `out/engagement/eeg_summary_by_video.csv` — 119 videos → **M3** `train_virality_from_eeg.py --eeg-summary`

The legacy inverted outputs remain in `out/` untouched. `join_eeg.py` default is
still `invert=True` for backward compatibility — flip it / switch model inputs to
`out/engagement/` to adopt the corrected label.

## Caveat
`interest_0_1` is still a **relative, within-session** readout normalized to the
5th/95th theta/beta percentiles — not a calibrated absolute interest. The sign is
now right; absolute calibration and artifact rejection (the raw µV rail ±1000+,
likely blinks/motion) are the next label-quality steps.
