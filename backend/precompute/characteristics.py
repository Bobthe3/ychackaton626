"""Offline: compute per-clip characteristics for the 50 Tech-UGC videos (Devan).

Output matches contracts/video.schema.json (WITHOUT color_profile — Holly extracts that).
Writes a videos.json that the Cloudflare API serves.

Run:  python precompute/characteristics.py
"""

import json
import pathlib

OUT = pathlib.Path(__file__).parents[2] / "contracts" / "mocks" / "videos.json"


def analyze(clip_path: str) -> dict:
    # TODO(Devan): fill these in.
    #   transcript_summary -> whisper + a one-line LLM summary
    #   cut_count          -> scenedetect / ffmpeg scene filter
    #   audio              -> classify music vs VO from the audio track
    #   on_screen_text     -> OCR a few frames
    return {
        "audio": "music+VO",
        "transcript_summary": "TODO",
        "cut_count": 0,
        "on_screen_text": "TODO",
        "subtitles": False,
    }


if __name__ == "__main__":
    # TODO(Devan): iterate real clips; this just documents the shape.
    print(f"would write {OUT}")
