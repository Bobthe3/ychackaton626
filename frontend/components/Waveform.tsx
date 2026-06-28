"use client";
// Live interest waveform — the most-watched element on stage.
// Two layers (prd-holly.md §5): a faint dashed "predict" line (what the model
// expected) under the bright solid "real" line (measured EEG). Auto-scales Y
// across BOTH so spikes always pop. Area fill + line + live dot + heuristic
// spike labels (local maxima → "hook"/"CTA"), no model needed.
import type { EegSample } from "@/lib/types";

const W = 1000;
const H = 200;
const LEFT = 34; // y-axis gutter for ratio tick labels
const RIGHT = 16;
const TOP = 38; // reserved top band so the legend + ▲hook/▲CTA labels are never covered by the signal
const BOTTOM = 22; // x-axis gutter for time tick labels
const NY = 4; // horizontal gridlines
const NX = 5; // vertical gridlines

function clock(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

export default function Waveform({ samples }: { samples: EegSample[] }) {
  // Before the clip plays there's no signal yet — we still render the full grid
  // + axes (just no line) so the feature reads as "live monitor, armed".
  const hasData = samples.length >= 2;

  const real = samples.map((s) => s.interest_score);
  const hasPredict = samples.some((s) => typeof s.predict_score === "number");
  // predict falls back to real where absent so the line stays continuous
  const predict = samples.map((s) => (typeof s.predict_score === "number" ? s.predict_score : s.interest_score));

  // auto-scale across both layers; default to 0..1 before any data
  const all = hasPredict ? real.concat(predict) : real;
  const min = hasData ? Math.min(...all) : 0;
  const max = hasData ? Math.max(...all) : 1;
  const range = max - min || 1;

  const X = (i: number) => LEFT + (i / Math.max(1, samples.length - 1)) * (W - LEFT - RIGHT);
  const Y = (v: number) => H - BOTTOM - ((v - min) / range) * (H - BOTTOM - TOP);

  const pts = (vals: number[]) => vals.map((v, i) => `${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join(" ");
  const realLine = pts(real);
  const predictLine = pts(predict);
  const area = `${LEFT},${H - BOTTOM} ${realLine} ${(W - RIGHT)},${H - BOTTOM}`;

  // background grid — horizontal ratio ticks (y) + vertical time ticks (x).
  // Empty state falls back to 0.00–1.00 on y and 0:00–0:30 on x.
  const yTicks = Array.from({ length: NY + 1 }, (_, k) => {
    const v = min + (k / NY) * range;
    return { v, y: Y(v) };
  });
  const xTicks = Array.from({ length: NX + 1 }, (_, k) => {
    const frac = k / NX;
    const x = LEFT + frac * (W - LEFT - RIGHT);
    const t = hasData ? samples[Math.round(frac * (samples.length - 1))].video_t_ms : frac * 30000;
    return { x, t };
  });

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
          <stop offset="0%" stopColor="#9fe9ff" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#9fe9ff" stopOpacity="0" />
        </linearGradient>
        {/* fluorescent glow for the real line */}
        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* background grid + ratio / time ticks (behind the line) */}
      <g>
        {yTicks.map((t, k) => (
          <g key={`y${k}`}>
            <line x1={LEFT} y1={t.y} x2={W - RIGHT} y2={t.y} stroke="#ffffff" strokeOpacity="0.06" strokeWidth="1" />
            <text x={LEFT - 5} y={t.y + 3} fill="#64748b" fontSize="9" textAnchor="end">{t.v.toFixed(2)}</text>
          </g>
        ))}
        {xTicks.map((t, k) => (
          <g key={`x${k}`}>
            <line x1={t.x} y1={TOP} x2={t.x} y2={H - BOTTOM} stroke="#ffffff" strokeOpacity="0.05" strokeWidth="1" />
            <text x={t.x} y={H - BOTTOM + 13} fill="#64748b" fontSize="9" textAnchor={k === 0 ? "start" : k === NX ? "end" : "middle"}>{clock(t.t)}</text>
          </g>
        ))}
      </g>

      {/* legend — shown even when idle so the predict/real feature reads up-front */}
      <g fontSize="11" transform={`translate(${W - 150}, 16)`} opacity={hasData ? 1 : 0.5}>
        <line x1="0" y1="0" x2="16" y2="0" stroke="#2f8fd6" strokeWidth="1.5" strokeDasharray="3 6" opacity="0.85" />
        <text x="20" y="4" fill="#6fb6e6">predict</text>
        <line x1="74" y1="0" x2="90" y2="0" stroke="#d6f7ff" strokeWidth="2.75" />
        <text x="94" y="4" fill="#d6f7ff">real</text>
      </g>

      {!hasData && (
        <text x={W / 2} y={(TOP + H - BOTTOM) / 2} fill="#475569" fontSize="11" textAnchor="middle">
          ▶ press play — live brainwave appears here
        </text>
      )}

      {hasData && (
        <>
          <polygon points={area} fill="url(#wf)" />

          {/* predict layer — deeper saturated blue, dashed: clearly the lower/background layer */}
          {hasPredict && (
            <polyline
              points={predictLine}
              fill="none"
              stroke="#2f8fd6"
              strokeWidth="1.5"
              strokeDasharray="3 6"
              strokeLinejoin="round"
              opacity="0.85"
            />
          )}

          {/* real layer — fluorescent cool white-blue, glowing, on top */}
          <polyline points={realLine} fill="none" stroke="#d6f7ff" strokeWidth="2.75" strokeLinejoin="round" filter="url(#glow)" />

          {top.map((p, i) => (
            <g key={i}>
              <circle cx={p.x} cy={p.y} r="4" fill="#d6f7ff" filter="url(#glow)" />
              <text x={p.x} y={p.y - 10} fill="#d6f7ff" fontSize="12" textAnchor="middle">▲{p.tag}</text>
            </g>
          ))}

          {/* live dot on the real signal */}
          <circle cx={X(samples.length - 1)} cy={Y(lastReal)} r="5" fill="#fff">
            <animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </>
      )}
    </svg>
  );
}
