"use client";
// Live interest waveform. Swap this naive SVG for uPlot for a smoother stage demo.
// IMPORTANT: auto-scale Y so spikes always pop on a projector (prd-holly.md §5).
import type { EegSample } from "@/lib/types";

export default function Waveform({ samples }: { samples: EegSample[] }) {
  const w = 800;
  const h = 160;
  if (samples.length < 2) {
    return <div className="h-[160px] rounded bg-neutral-900" />;
  }

  const ys = samples.map((s) => s.interest_score);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1; // auto-scale

  const pts = samples
    .map((s, i) => {
      const x = (i / (samples.length - 1)) * w;
      const y = h - ((s.interest_score - min) / range) * (h - 10) - 5;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-[160px] w-full rounded bg-neutral-900">
      <polyline points={pts} fill="none" stroke="#4ade80" strokeWidth="2" />
    </svg>
  );
}
