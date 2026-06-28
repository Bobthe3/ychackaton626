"use client";
import type { RefObject } from "react";
import type { Video } from "@/lib/types";
import MovieBarcode from "./MovieBarcode";

// The 5-field characteristics panel (Screen 1). color_profile is extracted client-side,
// live, as a movie-barcode strip from the REAL playing video (via videoRef).
export default function CharacteristicsPanel({
  video,
  videoRef,
}: {
  video: Video;
  videoRef?: RefObject<HTMLVideoElement | null>;
}) {
  const c = video.characteristics;
  return (
    <div className="space-y-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm">
      <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">characteristics</div>
      <div className="flex items-center gap-3">
        <span className="w-14 shrink-0 text-neutral-500">color</span>
        <MovieBarcode videoRef={videoRef} seed={video.video_id} height={22} />
      </div>
      <Row label="cuts"><span className="tabular-nums">{c.cut_count}</span></Row>
      <Row label="audio">{c.audio}</Row>
      <Row label="subs">{c.subtitles ? "yes" : "no"}</Row>
      <Row label="text"><span className="text-neutral-300">“{c.on_screen_text}”</span></Row>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-14 shrink-0 text-neutral-500">{label}</span>
      <span>{children}</span>
    </div>
  );
}
