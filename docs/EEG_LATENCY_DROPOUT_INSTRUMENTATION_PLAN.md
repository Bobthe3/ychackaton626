# EEG Latency and Dropout Instrumentation Plan

## Goal

Make the recorder observable enough to answer two questions during and after a run:

- How fresh is the live EEG shown in the UI?
- Did EEG sample flow stop, slow down, or become stale while the web server stayed alive?

## Implementation Steps

1. Add recorder health fields in `hardware/capture/record.py`
   - Track `last_sample_wall_ms`, `last_sample_ts_ms`, `consecutive_empty_reads`, `stale_for_ms`.
   - Add `/health` fields for `sample_age_ms`, `stale`, `empty_reads`, `last_batch_n`, and effective sample rate.

2. Add latency timestamps to each live tick
   - `sample_last_ts_ms`: newest BrainFlow EEG timestamp in the batch.
   - `batch_received_wall_ms`: Python wall clock immediately after `get_board_data()`.
   - `tick_computed_wall_ms`: Python wall clock after theta/beta/interest computation.
   - `sse_sent_wall_ms`: Python wall clock immediately before SSE write.
   - `samples_written`: cumulative sample count.

3. Add sidecar logs per recording
   - `<eegSyncId>.events.jsonl`: connect, stream start, empty reads, stale threshold, reconnect/fail, shutdown.
   - `<eegSyncId>.latency.csv`: per-tick timing and sample-flow metrics.

4. Add a stale-data watchdog
   - Warn after 1 second without samples.
   - Mark `/health` unhealthy after 3 seconds.
   - In study mode, fail/exit after 5-10 seconds stale so bad runs do not appear alive.
   - In bench mode, optionally attempt reconnect and mark a new segment.

5. Update the UI
   - Show sample age, end-to-end UI lag, and stream status.
   - Distinguish "web server connected" from "fresh EEG samples".
   - Compute browser receive/render timestamps in `EventSource.onmessage`.
   - Display `client_received_wall_ms - sse_sent_wall_ms`.

## Lag Metrics

Capture these timestamps:

```text
sample_last_ts_ms
batch_received_wall_ms
tick_computed_wall_ms
sse_sent_wall_ms
client_received_wall_ms
client_rendered_wall_ms
```

Compute:

```text
board_to_python_ms = batch_received_wall_ms - sample_last_ts_ms
python_processing_ms = tick_computed_wall_ms - batch_received_wall_ms
sse_transport_ms = client_received_wall_ms - sse_sent_wall_ms
browser_render_ms = client_rendered_wall_ms - client_received_wall_ms
end_to_end_ui_ms = client_rendered_wall_ms - sample_last_ts_ms
```

For localhost, Python `time.time()` and browser `Date.now()` are on the same machine. If the UI runs on another device, add a `/time` endpoint and estimate client/server clock offset before trusting cross-device deltas.

## Acceptance Criteria

- `/health` exposes freshness and stale-state fields.
- The UI shows when EEG samples are stale even if SSE is still connected.
- Every run writes `.events.jsonl` and `.latency.csv`.
- A stale board stream is detected within 3 seconds.
- Study mode invalidates or exits a stale run within 5-10 seconds.
- Post-hoc logs can identify when lag grew and when sample flow stopped.
