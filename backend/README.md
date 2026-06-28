# backend/ — Devan's part

Model + data + EEG. Python. Produces everything Holly's front-end consumes via
[`../contracts`](../contracts). Don't edit `frontend/`.

```
eeg_server/    local Python WebSocket server: OpenBCI/BrainFlow -> theta/beta -> EegSample
precompute/    offline: extract characteristics (transcript, cuts, audio) for the 50 clips
cloudflare/    Worker/R2 serving GET /api/videos (Video schema) + the MP4s
model/         fine-tune / simulate video -> waveform
```

## Run
```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
python eeg_server/server.py    # ws://localhost:8765  (give Holly the port + sample rate)
```

## Owed to Holly
- `GET /api/videos` matching `contracts/video.schema.json` (color_profile omitted — Holly does it).
- EEG WebSocket emitting `contracts/eeg-sample.schema.json` frames, with `video_id` + `video_t_ms` set.
- A recorded `eeg-sample.jsonl` + `videos.json` mock so she can build before the headset works.
- Decode semantics: what a theta/beta spike "means", for Holly's chat system prompt.
