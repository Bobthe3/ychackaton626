# EEG Session Runbook — collecting the real brain data

> **Goal:** record clean EEG while a participant scrolls the stimulus feed, so each
> app **exposure** (participant × one video) can be joined to an EEG slice offline.
> This is the one blocker for stages [2] and [3] of the model
> (see [`docs/model/04-PRODUCT-PIPELINE.md`](./model/04-PRODUCT-PIPELINE.md)).
> Recorder mechanics live in the **`flowstate-eeg-capture`** skill; this doc is the
> *study protocol* that wraps it.

A good session produces, for one `eegSyncId`:
`hardware/recordings/<eegSyncId>.csv` (+`.meta.json`) **and** app event exports →
`join_eeg.py` → `out/<eegSyncId>_per_window.csv` + `_per_exposure.csv` → the models.

---

## ⚠️ The two things that silently break the join — read first

1. **`eegSyncId` must match exactly.** The app mints a **random UUID** at session
   start (`lib/session.tsx:131`) and the recorder must write
   `hardware/recordings/<that-UUID>.csv`. If they differ, the join finds nothing.
   → **Strongly recommended one-time fix:** make the id presettable so you can choose
   it *before* recording. In `lib/session.tsx`, change
   `const eegSyncId = randomUUID();` →
   `const eegSyncId = process.env.EXPO_PUBLIC_EEG_SYNC_ID ?? randomUUID();`
   Then you set `EXPO_PUBLIC_EEG_SYNC_ID=<id>` per session and start the recorder
   with the same `<id>` first. *(Ask me to implement this — it removes the live race.
   Hold until the in-progress merge on this branch is resolved.)*
   → **Without that change (fallback):** start the session, read the minted id from
   the `session_start` event (Metro console logs it, or `GET /api/admin/export?table=eeg_join_events`),
   then start the recorder with it — but you lose the first seconds. The presettable
   id is much safer.

2. **App and recorder must share a wall clock.** The join is by `eegSyncId` +
   epoch-ms. The recorder stamps `time.time()` on the Mac; the app stamps
   `Date.now()`. If the app runs on a **phone** and the recorder on the **Mac**, clock
   skew corrupts every window. → **Run the study on the Mac's web build
   (`npm run web`)**, same machine as `record.py`. One clock, no skew. Only use a phone
   if you've verified NTP sync on both and accept the risk.

---

## One-time setup (do once, before any sessions)

- [ ] Stimulus set locked + imported into the local server catalog:
      `npm run videos:import` then run the server with the stimulus videos
      (`VIDEOS_DIR="$PWD/server/data/stimulus-videos" npm run server` — see the
      `server-launch-command` note; port 8788). This adds access codes
      `EEG30` / `EEG10` / `EEG05`.
- [ ] App points at the server: `.env.local` has `EXPO_PUBLIC_API_BASE` set; run
      `npm run web` on the **same Mac** as the recorder.
- [ ] Recorder venv ready: `hardware/capture/.venv` exists (numpy/scipy installed).
- [ ] BLED112 dongle visible: `ls /dev/cu.usbmodem*` → e.g. `/dev/cu.usbmodem11`.
- [ ] (Recommended) apply the presettable-`eegSyncId` change above.
- [ ] Decide session length: **start with `EEG10` (10 min)** — the 30-min board
      dropout is still under investigation (`docs/EEG_30_MIN_BOARD_DROPOFF_INVESTIGATION_PLAN.md`).
      Move to `EEG30` only after a clean 35-min soak.

## Do a DRY RUN first (1 throwaway session)

Before any real participant, run the full loop once on yourself with a 2–5 min code
and **confirm `join_eeg.py` outputs non-empty `interest_0_1`**. This is Task D-02 —
it flushes out the `eegSyncId` / clock issues while they're cheap to fix.

---

## Per-session procedure

### A. Hardware preflight (mitigates the 30-min dropout)
- [ ] Fresh / verified Ganglion battery.
- [ ] BLED112 on a USB extension, away from the laptop chassis; Ganglion close with
      line of sight.
- [ ] Close OpenBCI GUI / any other BrainFlow process (only one owner of the dongle).
- [ ] Disable Mac sleep / aggressive power saving for the run.
- [ ] Electrodes seated; good scalp contact (you'll confirm via `tick.quality` below).

### B. Choose the `eegSyncId`
- [ ] Generate one: `date +sess-%Y%m%d-%H%M%S` (or a UUID). Call it `<ID>`.

### C. Start the recorder, verify it's healthy
```bash
cd /Users/devan/Documents/Flowstate/YCHackaton/hardware/capture
.venv/bin/python record.py --eeg-sync-id <ID> --dongle /dev/cu.usbmodem11 --port 9001
```
- [ ] In another shell: `curl -sS http://127.0.0.1:9001/health` shows
      `connected: true`, `eeg_sync_id == <ID>`, `samples_written` climbing ~200/s,
      and `tick.quality` per-channel contact looks acceptable.
- [ ] Confirm freshness: `/health.sample_age_ms < 500` before the participant starts.

### D. Start the app session with the SAME id
- [ ] On the Mac web build, enter code `EEG10` (consent + demographics).
- [ ] If you applied the presettable fix: launch web with
      `EXPO_PUBLIC_EEG_SYNC_ID=<ID> npm run web` so the session uses `<ID>`.
      Otherwise: begin the session, grab the minted id from the `session_start` log,
      and **that** becomes `<ID>` (you'll have started the recorder with it).
- [ ] Participant scrolls the feed normally until the silent timer ends.

### E. Stop cleanly
- [ ] **Ctrl-C the recorder in its foreground shell** (flushes the CSV, writes
      `ended_at_unix_ms` + `n_samples`, releases the board). Do not just close the
      terminal — a half-dead recorder can keep port 9001 bound (see skill's clean-kill).

### F. Verify the recording immediately
```bash
wc -l hardware/recordings/<ID>.csv          # rows ≈ 200 × seconds
tail -3 hardware/recordings/<ID>.csv         # channels still varying (not flatlined)
cat hardware/recordings/<ID>.meta.json       # ended_at_unix_ms set, n_samples > 0
```
- [ ] If it flatlined or stopped early → **discard, re-run** (don't join bad data).

---

## After the session: export → join → validate

```bash
# 1. Export the app's analytics (writes server/data/exports/*.csv)
npm run data:export      # or: API_BASE=http://localhost:8788 npm run data:export

# 2. Join EEG to exposures for this session
cd hardware/analysis
../capture/.venv/bin/python join_eeg.py --eeg-sync-id <ID>
#   → out/<ID>_per_exposure.csv   (one row per exposure)
#   → out/<ID>_per_window.csv     (0.5s interest curve — stage-2 target)
```
- [ ] **Validate:** `out/<ID>_per_exposure.csv` has rows with non-empty
      `interest_0_1` and `eeg_coverage_frac ≥ 0.5`. If empty → the `eegSyncId` didn't
      match or clocks skewed (see §⚠️). Fix before the next session.
- [ ] Log how many exposures survived coverage filtering.

---

## Feeding the models (after you have ≥3–5 good sessions)

```bash
# Stage [2] — interest-curve model. Concatenate every session's per-window CSV:
head -1 hardware/analysis/out/<firstID>_per_window.csv > /tmp/all_per_window.csv
tail -q -n +2 hardware/analysis/out/*_per_window.csv >> /tmp/all_per_window.csv
python3 model/train_interest.py --per-window /tmp/all_per_window.csv

# Stage [3] — virality-from-EEG. Build one eeg-summary row per video_id
# (mean of each EEG field across all per_exposure rows), then:
#   columns: video_id, mean_interest, auc, hook_interest, peak, dip, slope, frac_above_0.5
python3 model/train_virality_from_eeg.py --eeg-summary /tmp/eeg_summary_by_video.csv
```
- The stage-3 summary aggregation is a small pandas group-by on the `_per_exposure`
  files — **ask me to add a `build_eeg_summary.py` helper** when you reach this step.
- Compare the result against the null direct-features baseline (`model/out/m1_results.json`).
  Real EEG **beating** that baseline is the headline finding.

---

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `join` output empty | `eegSyncId` mismatch (recording filename ≠ app id) — the #1 cause. Verify `ls hardware/recordings/<ID>.csv` matches the app's `eeg_sync_id` in the export. |
| Interest present but times nonsensical | Clock skew — app on phone, recorder on Mac. Re-run on the Mac web build. |
| `eeg_sync_id` blank in export | Session wasn't run with EEG configured / id not propagated. Confirm the `session_start` event carried `eegSyncId`. |
| Samples stop mid-run, server still "alive" | The silent dropout. Discard the run; check `/health.sample_age_ms`. See the 30-min investigation doc. |
| Port 9001 stuck after a kill | `pkill -9 -f record.py; lsof -nP -iTCP:9001 -sTCP:LISTEN` then kill the PID; confirm `lsof /dev/cu.usbmodem11` is free. |
| Low `tick.quality` | Reseat electrodes / improve scalp contact before starting. |

---

## Per-session log (copy one per session)

```
eegSyncId        : ____________________
participant      : P__   date/time: __________
access code      : EEG10        length: 10 min
preflight        : battery ok [ ]  dongle ext [ ]  sleep off [ ]  sample_age<500 [ ]
recording rows   : ______   flatline? [ ]   meta n_samples: ______
exports done     : [ ]   join run: [ ]
exposures joined : ____   coverage≥0.5: ____
notes            : __________________________________________
```

## Sampling target

Maximize **distinct stimulus videos with ≥1 good EEG exposure** (ideally ≥2–3
participants per video for stable per-video averages). With `EEG10`, each participant
covers a shuffled chunk; **3–5 participants × a few sessions** gets meaningful
coverage of the 121 labeled videos. Prioritize coverage over session length until the
30-min dropout is fixed.w 
