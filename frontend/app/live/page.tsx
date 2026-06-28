"use client";
// Screen 1 — Live scroll (the money shot). See prd-holly.md §2.
import { useEffect, useRef, useState } from "react";
import { getVideos } from "@/lib/api";
import { subscribeEeg } from "@/lib/ws";
import type { Video, EegSample } from "@/lib/types";
import Waveform from "@/components/Waveform";
import CharacteristicsPanel from "@/components/CharacteristicsPanel";
import InsightTabs from "@/components/InsightTabs";

function fmt(ms: number) {
  const s = Math.floor(ms / 1000);
  return `0:${String(s).padStart(2, "0")}`;
}

export default function LivePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [current] = useState(0);
  const [samples, setSamples] = useState<EegSample[]>([]);
  const [started, setStarted] = useState(false); // flips on first play
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getVideos().then(setVideos);
  }, []);

  // brainwave only streams once the clip is playing
  useEffect(() => {
    if (!started) return;
    const unsub = subscribeEeg((s) => setSamples((prev) => [...prev.slice(-200), s]));
    return unsub;
  }, [started]);

  const video = videos[current];
  const latest = samples[samples.length - 1];
  const title = video?.characteristics.transcript_summary.split("—")[0].trim();
  // real mp4 vs mock → show <video> only for real files (mocks point at example.com)
  const isReal = !!video?.url && !video.url.includes("example.com");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      {/* video + characteristics — 50/50 split with a center divider */}
      <div className="grid grid-cols-[1fr_1px_1fr] items-stretch gap-8">
        {/* video stage — fixed height, fits a 9:16 reel OR a 16:9 clip via object-contain */}
        <div className="flex h-[440px] items-center justify-center">
          {isReal ? (
            <video
              ref={videoRef}
              src={video!.url}
              className="h-full w-auto max-w-[560px] rounded-2xl border border-neutral-800 bg-black object-contain"
              playsInline controls
              onPlay={() => setStarted(true)}
            />
          ) : (
            <div className="relative flex h-full w-auto items-end overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-800 to-neutral-950"
                 style={{ aspectRatio: "9 / 16" }}>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl text-neutral-700">▶</div>
              <div className="relative w-full bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-neutral-300">
                {title ?? "loading…"}
              </div>
            </div>
          )}
        </div>

        {/* center divider */}
        <div className="bg-neutral-800/80" />

        {/* info column — appears only after the clip starts playing; capped to
            the video height, scrolls internally so the waveform stays on screen */}
        <div className="h-[440px] w-full space-y-3 overflow-y-auto pr-2">
          {/* now playing — always shown as the basic intro */}
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-500">now playing</div>
            <div className="mt-1 text-lg font-semibold leading-tight">{title ?? "—"}</div>
            <div className="text-sm text-neutral-500">
              {video?.metadata.creator} · {fmt(started && video ? (video.metadata.duration_ms * 2) / 3 : 0)} / {video ? fmt(video.metadata.duration_ms) : "0:00"}
            </div>
          </div>

          {started ? (
            <>
              <div className="reveal" style={{ animationDelay: "60ms" }}>
                {video && <CharacteristicsPanel video={video} videoRef={videoRef} />}
              </div>
              <div className="reveal" style={{ animationDelay: "280ms" }}>
                <InsightTabs />
              </div>
            </>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-neutral-400">{video?.characteristics.transcript_summary}</p>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-400">
                ▶ Press play — we&apos;ll read the brain&apos;s response in real time and break down why this clip works.
              </div>
            </>
          )}
        </div>
      </div>

      {/* waveform — grid always visible (shows the feature); line streams in on play */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-neutral-500">interest · theta/beta · live</span>
          <span className="text-sm tabular-nums text-[#9fe9ff]">{latest ? latest.interest_score.toFixed(2) : "—"}</span>
        </div>
        <Waveform samples={samples} />
      </div>
    </div>
  );
}
