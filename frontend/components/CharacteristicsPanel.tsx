"use client";
import type { Video } from "@/lib/types";
import ColorBar from "./ColorBar";
import colorProfiles from "@/public/color-profiles.json";

// The 5-field characteristics panel (Screen 1). color_profile is merged in client-side.
export default function CharacteristicsPanel({ video }: { video: Video }) {
  const colors = (colorProfiles as Record<string, string[]>)[video.video_id] ?? [];
  const c = video.characteristics;
  return (
    <div className="space-y-1 rounded-lg border border-neutral-800 p-3 text-sm">
      <Row label="color"><ColorBar colors={colors} /></Row>
      <Row label="cuts">{c.cut_count}</Row>
      <Row label="audio">{c.audio}</Row>
      <Row label="subs">{c.subtitles ? "yes" : "no"}</Row>
      <Row label="text">“{c.on_screen_text}”</Row>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-3">
      <span className="w-12 text-neutral-500">{label}</span>
      <span>{children}</span>
    </div>
  );
}
