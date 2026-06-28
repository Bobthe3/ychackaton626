"use client";
import type { Video } from "@/lib/types";
import ColorBar from "./ColorBar";
import colorProfiles from "@/public/color-profiles.json";

// The 5-field characteristics panel (Screen 1). color_profile is merged in client-side.
export default function CharacteristicsPanel({ video }: { video: Video }) {
  const colors = (colorProfiles as Record<string, string[]>)[video.video_id] ?? [];
  const c = video.characteristics;
  return (
    <div className="space-y-2.5 rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm">
      <div className="mb-1 text-xs uppercase tracking-wide text-neutral-500">characteristics</div>
      <Row label="color"><ColorBar colors={colors} /></Row>
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
