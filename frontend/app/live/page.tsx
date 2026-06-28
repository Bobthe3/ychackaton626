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
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    getVideos().then(setVideos);
  }, []);

  useEffect(() => {
    const unsub = subscribeEeg((s) => setSamples((prev) => [...prev.slice(-200), s]));
    return unsub;
  }, []);

  const video = videos[current];
  const latest = samples[samples.length - 1];
  const title = video?.characteristics.transcript_summary.split("—")[0].trim();
  // real mp4 vs mock → show <video> only for real files (mocks point at example.com)
  const isReal = !!video?.url && !video.url.includes("example.com");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-5">
      {/* header */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-2 rounded-full border border-red-500/40 bg-red-500/10 px-3 py-1 text-xs font-medium text-red-400">
          <span className="rec-dot h-2 w-2 rounded-full bg-red-500" /> REC
        </span>
        <span className="text-sm text-neutral-400">
          theta/beta <span className="font-semibold tabular-nums text-neutral-100">{latest?.theta_beta.toFixed(1) ?? "—"}</span>
        </span>
        <span className="ml-auto text-sm text-neutral-400">Holly 🧠</span>
      </div>

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

        {/* info column — fills its 50% half */}
        <div className="w-full space-y-3">
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-500">now playing</div>
            <div className="mt-1 text-lg font-semibold leading-tight">{title ?? "—"}</div>
            <div className="text-sm text-neutral-500">
              {video?.metadata.creator} · {video ? fmt((video.metadata.duration_ms * 2) / 3) : "0:00"} / {video ? fmt(video.metadata.duration_ms) : "0:00"}
            </div>
          </div>
          {video && <CharacteristicsPanel video={video} />}
          <InsightTabs />
        </div>
      </div>

      {/* waveform */}
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
