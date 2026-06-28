import type { EegSample } from "./types";

type Handler = (s: EegSample) => void;

/** Subscribe to Devan's EEG WebSocket. Returns an unsubscribe fn.
 *  If no WS url is set, falls back to replaying the shared mock .jsonl. */
export function subscribeEeg(onSample: Handler): () => void {
  const url = process.env.NEXT_PUBLIC_EEG_WS_URL;

  if (!url) {
    return replayMock(onSample);
  }

  const sock = new WebSocket(url);
  sock.onmessage = (ev) => {
    try {
      onSample(JSON.parse(ev.data) as EegSample);
    } catch (e) {
      console.warn("[ws] bad EEG frame", e);
    }
  };
  sock.onerror = () => console.warn("[ws] EEG socket error — is Devan's server up?");
  return () => sock.close();
}

/** Demo/dev fallback: replay contracts/mocks/eeg-sample.jsonl at ~2 Hz. */
function replayMock(onSample: Handler): () => void {
  let cancelled = false;
  (async () => {
    const text = await fetch("/mocks/eeg-sample.jsonl").then((r) => r.text()).catch(() => "");
    const lines = text.split("\n").filter(Boolean);
    let i = 0;
    const tick = () => {
      if (cancelled || lines.length === 0) return;
      onSample(JSON.parse(lines[i % lines.length]) as EegSample);
      i++;
      setTimeout(tick, 500);
    };
    tick();
  })();
  return () => {
    cancelled = true;
  };
}
