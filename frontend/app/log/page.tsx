"use client";
// Screen 2 — Session log: per-video cards + chat/decode (Holly owns the chat API).
import { useEffect, useState } from "react";
import { getVideos } from "@/lib/api";
import type { Video } from "@/lib/types";
import VideoCard from "@/components/VideoCard";

export default function LogPage() {
  const [videos, setVideos] = useState<Video[]>([]);

  useEffect(() => {
    getVideos().then(setVideos);
  }, []);

  return (
    <div className="mx-auto max-w-2xl space-y-3">
      <div className="text-sm text-neutral-400">Session log · streaming ●</div>
      {videos.map((v) => (
        <VideoCard key={v.video_id} video={v} />
      ))}

      {/* TODO(Holly): "ask" box -> /api/decode (OpenAI). Stream reply into the targeted card. */}
      <div className="flex gap-2">
        <input
          className="flex-1 rounded border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm"
          placeholder="why did video 1 win?"
        />
        <button className="rounded bg-neutral-200 px-3 text-neutral-900">↑</button>
      </div>
    </div>
  );
}
