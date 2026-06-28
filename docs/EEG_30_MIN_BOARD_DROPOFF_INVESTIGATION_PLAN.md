# EEG 30-Minute Board Dropoff Investigation Plan

## Goal

Determine why Ganglion/BLED112 capture stopped delivering samples during longer runs and harden the setup until 30-minute study sessions are reliable.

## Current Evidence

For `conn-test-20260627-153640`:

- The CSV did not flatline before the stop; the final channel rows still vary.
- The canonical recording contains 236,214 samples and about 20 minutes 18 seconds of data.
- The final EEG sample arrived around 15:57:00 local time.
- The recorder process stayed alive until 18:36:18.
- `record.py` currently loops forever when `board.get_board_data()` returns zero samples, so the web server can remain alive after EEG sample flow has stopped.

This means the available artifacts prove a silent sample-flow stop, but not the board-side cause.

## Controlled Tests

1. Synthetic-board soak test
   - Run the BrainFlow synthetic board for 35 minutes.
   - Expected result: no stale periods and stable latency.
   - If this fails, investigate recorder/process/UI logic before hardware.

2. Ganglion baseline soak test
   - Run the real Ganglion and BLED112 for 35 minutes with the current physical setup.
   - Capture `.events.jsonl`, `.latency.csv`, CSV, and meta.

3. Physical-layer variation tests
   - Repeat with a fresh/known-good Ganglion battery.
   - Repeat with the BLED112 on a USB extension cable away from the laptop chassis.
   - Repeat with the Ganglion closer to the dongle and with line of sight.
   - Repeat with laptop sleep and aggressive power saving disabled.

4. Contention test
   - Verify OpenBCI GUI and any other BrainFlow/recorder process are closed.
   - Confirm only one process owns `/dev/cu.usbmodem11`.

## Failure Signature Matrix

| Observation | Likely Area |
|---|---|
| Synthetic board drops | Recorder loop, logging, Python process, or UI/server logic |
| Synthetic stable but Ganglion drops | BLE, BLED112, Ganglion power, RF interference, or BrainFlow Ganglion driver |
| Samples stop but process remains alive | Silent empty-read failure mode; watchdog should catch this |
| BrainFlow exception logged | Driver/board session failure; use exception text for next diagnosis |
| Latency grows before samples stop | Buffering or system/process scheduling issue |
| Sample age jumps while SSE stays connected | Board stream stale, not web transport stale |

## Run Checklist

- Fresh or verified Ganglion battery.
- BLED112 visible at `/dev/cu.usbmodem11`.
- No OpenBCI GUI or second recorder process.
- BLED112 placed away from laptop chassis, ideally on a USB extension.
- Ganglion close to BLED112 with minimal obstruction.
- Mac sleep disabled for the run.
- Confirm `/health.sample_age_ms < 500` before starting a real study session.
- Confirm effective sample rate is near expected during a 2-minute preflight.

## Acceptance Criteria For 30-Minute Sessions

- One 35-minute synthetic-board run with no stale period over 1 second.
- One 35-minute Ganglion run with no stale period over 1 second.
- Effective sample rate remains close to expected over the full run.
- Live UI latency p95 stays below the chosen threshold, excluding intentional DSP window lag.
- Any dropout invalidates the run within 5-10 seconds instead of silently continuing.

## Follow-Up Fixes

- Add a study-mode watchdog that fails fast on stale sample flow.
- Add a bench-mode reconnect path that logs segment boundaries.
- Include board/session lifecycle events in `.events.jsonl`.
- Preserve enough BrainFlow logging to diagnose driver or BLE failures after a long run.
