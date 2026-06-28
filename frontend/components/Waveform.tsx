"use client";
// Live interest waveform — the most-watched element on stage.
// Two layers (prd-holly.md §5): a faint dashed "predict" line (what the model
// expected) under the bright solid "real" line (measured EEG). Auto-scales Y
// across BOTH so spikes always pop. Area fill + line + live dot + heuristic
// spike labels (local maxima → "hook"/"CTA"), no model needed.
import type { EegSample } from "@/lib/types";

const W = 1000;
const H = 200;
const PAD = 16; // sides + bottom inset
const TOP = 38; // reserved top band so the legend + ▲hook/▲CTA labels are never covered by the signal

export default function Waveform({ samples }: { samples: EegSample[] }) {
  if (samples.length < 2) {
    return (
      <div className="flex h-[200px] items-center justify-center rounded-xl border border-neutral-800 bg-neutral-900/60 text-sm text-neutral-600">
        waiting for signal…
      </div>
    );
  }

  const real = samples.map((s) => s.interest_score);
  const hasPredict = samples.some((s) => typeof s.predict_score === "number");
  // predict falls back to real where absent so the line stays continuous
  const predict = samples.map((s) => (typeof s.predict_score === "number" ? s.predict_score : s.interest_score));

  // auto-scale across both layers
  const all = hasPredict ? real.concat(predict) : real;
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;

  const X = (i: number) => PAD + (i / (samples.length - 1)) * (W - 2 * PAD);
  const Y = (v: number) => H - PAD - ((v - min) / range) * (H - PAD - TOP);

  const pts = (vals: number[]) => vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const realLine = pts(real);
  const predictLine = pts(predict);
  const area = `${PAD},${H - PAD} ${realLine} ${(W - PAD)},${H - PAD}`;

  // top spikes on the REAL signal = local maxima in the upper band
  const labels: { x: number; y: number; tag: string }[] = [];
  for (let i = 1; i < samples.length - 1; i++) {
    const v = real[i];
    if (v > real[i - 1] && v >= real[i + 1] && v > min + range * 0.6) {
      labels.push({ x: X(i), y: Y(v), tag: "spike" });
    }
  }
  const top = labels.sort((a, b) => a.y - b.y).slice(0, 2);
  if (top[0]) top[0].tag = "hook";
  if (top[1]) top[1].tag = "CTA";

  const lastReal = real[real.length - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[200px] w-full rounded-xl border border-neutral-800 bg-neutral-900/60">
      <defs>
        <linearGradient id="wf" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
        </linearGradient>
      </defs>

      <polygon points={area} fill="url(#wf)" />

      {/* predict layer — faint dashed, sits under the real line */}
      {hasPredict && (
        <polyline
          points={predictLine}
          fill="none"
          stroke="#64748b"
          strokeWidth="1.75"
          strokeDasharray="5 5"
          strokeLinejoin="round"
          opacity="0.7"
        />
      )}

      {/* real layer — bright solid */}
      <polyline points={realLine} fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinejoin="round" />

      {/* legend */}
      {hasPredict && (
        <g fontSize="11" transform={`translate(${W - 150}, 16)`}>
          <line x1="0" y1="0" x2="16" y2="0" stroke="#64748b" strokeWidth="1.75" strokeDasharray="5 5" />
          <text x="20" y="4" fill="#94a3b8">predict</text>
          <line x1="74" y1="0" x2="90" y2="0" stroke="#4ade80" strokeWidth="2.5" />
          <text x="94" y="4" fill="#86efac">real</text>
        </g>
      )}

      {top.map((p, i) => (
        <g key={i}>
          <circle cx={p.x} cy={p.y} r="4" fill="#4ade80" />
          <text x={p.x} y={p.y - 10} fill="#86efac" fontSize="12" textAnchor="middle">▲{p.tag}</text>
        </g>
      ))}

      {/* live dot on the real signal */}
      <circle cx={X(samples.length - 1)} cy={Y(lastReal)} r="5" fill="#fff">
        <animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}
