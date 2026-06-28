"use client";
// Screen 1 — Live scroll (the money shot). See prd-holly.md §2.
import { useEffect, useState } from "react";
import { getVideos } from "@/lib/api";
import { subscribeEeg } from "@/lib/ws";
import type { Video, EegSample } from "@/lib/types";
import Waveform from "@/components/Waveform";
import CharacteristicsPanel from "@/components/CharacteristicsPanel";

export default function LivePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [current, setCurrent] = useState(0);
  const [samples, setSamples] = useState<EegSample[]>([]);

  useEffect(() => {
    getVideos().then(setVideos);
  }, []);

  useEffect(() => {
    const unsub = subscribeEeg((s) => setSamples((prev) => [...prev.slice(-200), s]));
    return unsub;
  }, []);

  const video = videos[current];
  const latest = samples[samples.length - 1];

  return (
    <div className="grid h-[80vh] grid-rows-[1fr_auto] gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center justify-center rounded-lg bg-black">
          {/* TODO(Holly): vertical reel player. Swap to next clip to advance the demo. */}
          {video ? (
            <video src={video.url} className="h-full" controls autoPlay muted />
          ) : (
            <span className="text-neutral-500">loading clips…</span>
          )}
        </div>
        <div>
          <div className="mb-2 text-sm text-neutral-400">
            NOW PLAYING · theta/beta {latest?.theta_beta.toFixed(1) ?? "—"}
          </div>
          {video && <CharacteristicsPanel video={video} />}
        </div>
      </div>

      <div>
        <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">
          Interest (theta/beta · live)
        </div>
        <Waveform samples={samples} />
      </div>
    </div>
  );
}
