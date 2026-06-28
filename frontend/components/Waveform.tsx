"use client";
// Live interest waveform — the most-watched element on stage.
// Auto-scales Y so spikes always pop (prd-holly.md §5). Area fill + line + live dot
// + heuristic spike labels (local maxima → "hook"/"CTA"), no model needed.
import type { EegSample } from "@/lib/types";

const W = 1000;
const H = 200;
const PAD = 16;

export default function Waveform({ samples }: { samples: EegSample[] }) {
  if (samples.length < 2) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 text-sm text-neutral-600">
        waiting for signal…
      </div>
    );
  }

  const ys = samples.map((s) => s.interest_score);
  const min = Math.min(...ys);
  const max = Math.max(...ys);
  const range = max - min || 1; // auto-scale

  const X = (i: number) => PAD + (i / (samples.length - 1)) * (W - 2 * PAD);
  const Y = (v: number) => H - PAD - ((v - min) / range) * (H - 2 * PAD);

  const line = samples.map((s, i) => `${X(i).toFixed(1)},${Y(s.interest_score).toFixed(1)}`).join(" ");
  const area = `${PAD},${H - PAD} ${line} ${(W - PAD)},${H - PAD}`;

  // top spikes = local maxima in the upper half
  const labels: { x: number; y: number; tag: string }[] = [];
  for (let i = 1; i < samples.length - 1; i++) {
    const v = samples[i].interest_score;
    if (v > samples[i - 1].interest_score && v >= samples[i + 1].interest_score && v > min + range * 0.6) {
      labels.push({ x: X(i), y: Y(v), tag: "spike" });
    }
  }
  const top = labels.sort((a, b) => a.y - b.y).slice(0, 2);
  if (top[0]) top[0].tag = "hook";
  if (top[1]) top[1].tag = "CTA";

  const last = samples[samples.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[200px] w-full rounded-xl border border-neutral-800 bg-neutral-900/60">
      <defs>
        <linearGradient id="wf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={area} fill="url(#wf)" />
      <polyline points={line} fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round" />
      {top.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#4ade80" />
          <text x={p.x} y={p.y - 10} fill="#86efac" fontSize="12" textAnchor="middle">▲{p.tag}</text>
        </g>
      ))}
      {/* live dot */}
      <circle cx={X(samples.length - 1)} cy={Y(last.interest_score)} r="5" fill="#fff">
        <animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
