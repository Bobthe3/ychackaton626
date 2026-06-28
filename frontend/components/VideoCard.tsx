"use client";
// Session-log card (Screen 2): characteristics + interest + LLM one-liner.
import type { Video } from "@/lib/types";
import ColorBar from "./ColorBar";
import colorProfiles from "@/public/color-profiles.json";

export default function VideoCard({ video, interest, note }: {
  video: Video;
  interest?: number;
  note?: string; // from the chat/decode API
}) {
  const colors = (colorProfiles as Record<string, string[]>)[video.video_id] ?? [];
  return (
    <div className="rounded-lg border border-neutral-800 p-3">
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">
          {video.characteristics.transcript_summary.slice(0, 36)}…
        </span>
        <span className="text-neutral-400">{video.metadata.creator}</span>
      </div>
      <div className="mt-1 flex items-center gap-3 text-xs text-neutral-400">
        <span>interest {interest?.toFixed(2) ?? "—"}</span>
        <ColorBar colors={colors} />
      </div>
      <p className="mt-2 text-sm text-neutral-300">
        ↳ {note ?? "(decode pending — wire the chat API)"}
      </p>
    </div>
  );
}
