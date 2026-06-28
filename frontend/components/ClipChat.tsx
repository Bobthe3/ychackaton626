"use client";
// Screen 1 middle column — a two-way chat about the clip on screen. Opens with
// the model's narration of what it learned (auto, on play), then the user can
// ask follow-ups. Streams from /api/decode, which runs a get_clip_characteristics
// tool-use loop on gpt-5.4-mini. Replaces the old tabs + related-clips grid.
import { useCallback, useEffect, useRef, useState } from "react";
import type { Video } from "@/lib/types";
import type { PredictedCurve } from "@/lib/predict";

interface Msg {
  role: "user" | "assistant";
  content: string;
  /** assistant turn is mid-stream and hasn't produced text yet → show tool status */
  pending?: boolean;
}

export default function ClipChat({
  video,
  peakT,
  onAnalyzed,
}: {
  video?: Video;
  peakT?: number | null;
  /** lift an uploaded+analyzed clip up to /live so it plays + shows its predicted EEG line */
  onAnalyzed?: (video: Video, curve: PredictedCurve) => void;
}) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const clip = video && {
    characteristics: video.characteristics,
    creator: video.metadata.creator,
    duration_ms: video.metadata.duration_ms,
    peak_t: peakT ?? null,
  };
  const localReply = useCallback(
    (history: Msg[]) => localAnalystReply(video, peakT, history.at(-1)?.role === "user" ? history.at(-1)?.content : undefined),
    [video, peakT],
  );

  // stream an assistant reply for the given history (excludes the empty assistant shell)
  const run = useCallback(
    async (history: Msg[]) => {
      if (!clip) return;
      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setBusy(true);
      setMessages([...history, { role: "assistant", content: "", pending: true }]);
      try {
        const res = await fetch("/api/decode", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ clip, messages: history.map((m) => ({ role: m.role, content: m.content })) }),
          signal: ctrl.signal,
        });
        if (!res.ok || !res.body) {
          setMessages([...history, { role: "assistant", content: localReply(history) }]);
          return;
        }
        const reader = res.body.getReader();
        const dec = new TextDecoder();
        let acc = "";
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          acc += dec.decode(value, { stream: true });
          setMessages([...history, { role: "assistant", content: acc }]);
        }
      } catch {
        if (!ctrl.signal.aborted) setMessages([...history, { role: "assistant", content: localReply(history) }]);
      } finally {
        setBusy(false);
      }
    },
    [clip, localReply],
  );

  // auto-narrate the opening turn whenever the clip changes
  useEffect(() => {
    if (!video) return;
    run([]);
    return () => abortRef.current?.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [video?.video_id]);

  // keep pinned to the latest message
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    setInput("");
    const history = [...messages.filter((m) => m.content), { role: "user" as const, content: text }];
    run(history);
  };

  // upload a new clip -> run the model pipeline -> lift it to /live as the active clip
  const handleUpload = async (file: File) => {
    if (analyzing) return;
    setAnalyzing(true);
    abortRef.current?.abort();
    setMessages([{ role: "assistant", content: "Analyzing your clip — extracting content features, SigLIP/CLAP embeddings, and predicting the brainwave… (~15s)" }]);
    const url = URL.createObjectURL(file);
    try {
      const fd = new FormData();
      fd.append("video", file);
      const res = await fetch("/api/predict-upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok || data.error) throw new Error(data.error || `upload ${res.status}`);
      const uploaded: Video = {
        video_id: data.video_id,
        url,
        characteristics: data.characteristics,
        metadata: { duration_ms: data.duration_ms, creator: "your upload" },
      };
      // lifts to /live: it becomes the active clip (plays + predicted EEG line),
      // and the new video prop re-triggers the opening narration here.
      onAnalyzed?.(uploaded, data.curve as PredictedCurve);
    } catch (e) {
      URL.revokeObjectURL(url);
      setMessages([{ role: "assistant", content: `Couldn't analyze that clip: ${e instanceof Error ? e.message : "error"}` }]);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto pr-1">
        {messages.map((m, i) =>
          m.role === "user" ? (
            <div key={i} className="flex justify-end">
              <div className="max-w-[80%] rounded-2xl rounded-br-md bg-neutral-100 px-3.5 py-2 text-sm text-neutral-900">{m.content}</div>
            </div>
          ) : (
            <div key={i} className="space-y-1.5">
              <div className="flex items-center gap-1.5 text-[11px] text-neutral-500">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#9fe9ff]" />
                {m.pending && !m.content ? "reading clip characteristics…" : "NeuroViral analyst"}
              </div>
              <div className="whitespace-pre-wrap text-sm leading-relaxed text-[#cfeeff]">
                {m.content}
                {busy && i === messages.length - 1 && (
                  <span className="ml-0.5 inline-block h-3.5 w-[3px] animate-pulse bg-[#9fe9ff] align-middle" />
                )}
              </div>
            </div>
          ),
        )}
      </div>

      {/* composer */}
      <div className="mt-3 rounded-2xl border border-neutral-700 bg-neutral-900/60 p-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Ask about this clip…"
          className="w-full bg-transparent px-2 py-1.5 text-sm text-neutral-100 placeholder:text-neutral-500 focus:outline-none"
        />
        <div className="flex items-center justify-between px-1 pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={analyzing}
              aria-label="Upload a video to analyze"
              title="Upload a video to analyze"
              className="flex h-7 w-7 items-center justify-center rounded-full border border-neutral-700 text-base leading-none text-neutral-300 transition-colors hover:bg-neutral-800 disabled:opacity-40"
            >
              +
            </button>
            <span className="rounded-md bg-neutral-800 px-2 py-0.5 text-[11px] text-neutral-400">{analyzing ? "analyzing clip…" : "clip decode"}</span>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="video/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleUpload(f);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            onClick={send}
            disabled={!input.trim() || busy}
            aria-label="Send"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-[#2f8fd6] text-white transition-opacity disabled:opacity-30"
          >
            ↑
          </button>
        </div>
      </div>
    </div>
  );
}

function localAnalystReply(video?: Video, peakT?: number | null, question?: string) {
  const c = video?.characteristics;
  if (!c) return "The clip is loading. Once it is ready, I can decode the hook, pacing, captions, and predicted attention curve.";

  const peak = peakT != null ? `${peakT.toFixed(1)}s` : "the opening seconds";
  const hook = c.transcript_summary.split("—")[0].trim();
  const base = `${hook} is built around a fast, legible setup: ${c.cut_count} cuts, ${c.subtitles ? "burned-in captions" : "no captions"}, ${c.audio || "audio"}, and the on-screen text "${c.on_screen_text}". The model expects the strongest attention around ${peak}, where the hook becomes instantly understandable.`;

  if (!question) return base;

  const q = question.toLowerCase();
  if (q.includes("why") || q.includes("win") || q.includes("work")) {
    return `${base} It works because the viewer does not need context: the premise lands immediately, the captions reduce listening effort, and the pacing keeps visual change high enough to prevent drift.`;
  }
  if (q.includes("improve") || q.includes("better") || q.includes("change")) {
    return `The highest-leverage change is to sharpen the first two seconds: make the premise readable in one glance, keep captions on-screen, and avoid slowing the edit before the predicted ${peak} spike.`;
  }
  if (q.includes("cut") || q.includes("pace")) {
    return `${c.cut_count} cuts gives this reel a high-change rhythm. For this format, the model is rewarding quick context shifts more than cinematic continuity.`;
  }
  return base;
}
