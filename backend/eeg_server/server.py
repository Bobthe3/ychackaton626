"""Local EEG WebSocket server (Devan).

Streams EegSample frames (see ../../contracts/eeg-sample.schema.json) to Holly's front-end.
Real path: BrainFlow -> band-power -> theta/beta -> interest_score.
This stub replays the shared mock so the front-end can integrate immediately.

Run:  python eeg_server/server.py   ->  ws://localhost:8765
"""

import asyncio
import json
import pathlib

import websockets  # pip install websockets

PORT = 8765
MOCK = pathlib.Path(__file__).parents[2] / "contracts" / "mocks" / "eeg-sample.jsonl"


async def stream(websocket):
    lines = [l for l in MOCK.read_text().splitlines() if l.strip()]
    i = 0
    while True:
        await websocket.send(lines[i % len(lines)])
        i += 1
        await asyncio.sleep(0.5)  # ~2 Hz; replace with real sample rate


async def main():
    print(f"EEG WS server on ws://localhost:{PORT} (mock replay)")
    async with websockets.serve(stream, "localhost", PORT):
        await asyncio.Future()


# TODO(Devan): replace stream() with BrainFlow capture:
#   - read board, compute band powers (theta 4-8Hz, beta 13-30Hz)
#   - theta_beta = theta / beta ; interest_score = normalized
#   - tag each frame with the currently-playing video_id + video_t_ms

if __name__ == "__main__":
    asyncio.run(main())
