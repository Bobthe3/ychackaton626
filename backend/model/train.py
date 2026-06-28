"""Model: video features -> interest waveform (Devan).

Demo-grade. Two modes (see PRD §10 open question):
  - simulate: deterministic waveform from characteristics (hook timing, cuts) — no training
  - fine-tune: train on the requested EEG dataset + our own 3-person recordings

Run:  python model/train.py
"""


def simulate_waveform(characteristics: dict, duration_ms: int) -> list[dict]:
    """Fallback for the demo: fabricate a believable interest curve from features."""
    # TODO(Devan): bump interest near the hook, decay on slow stretches, lift on CTA.
    return []


def train(dataset_path: str):
    # TODO(Devan): fine-tune once the dataset email comes back; else ship simulate_waveform.
    raise NotImplementedError


if __name__ == "__main__":
    print("model stub — see PRD §10: simulate vs fine-tune")
