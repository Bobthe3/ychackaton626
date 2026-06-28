"use client";
// Live interest waveform — the most-watched element on stage.
<<<<<<< Updated upstream
// Two layers (prd-holly.md §5): a faint dashed "predict" line (what the model
// expected) under the bright solid "real" line (measured EEG). Auto-scales Y
// across BOTH so spikes always pop. Area fill + line + live dot + heuristic
// spike labels (local maxima → "hook"/"CTA"), no model needed.
//
// Width is measured from the container (ResizeObserver) so the chart fills the
// full grid width crisply at any size — no viewBox letterboxing/empty margins.
import { useEffect, useRef, useState } from "react";
=======
// A single clean white line drawn against the full duration of the clip: the
// x-axis is the whole video timeline (0 → duration), so the line animates in
// from left to right as playback advances and fills the chart by the end.
>>>>>>> Stashed changes
import type { EegSample } from "@/lib/types";

const H = 200;
const LEFT = 34; // y-axis gutter for ratio tick labels
const RIGHT = 16;
const TOP = 20; // small reserved band so the leading dot/halo never clips
const BOTTOM = 22; // x-axis gutter for time tick labels
const NY = 4; // horizontal gridlines
const NX = 6; // vertical gridlines (full-duration time axis)

function clock(ms: number) {
  const s = Math.max(0, Math.round(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

<<<<<<< Updated upstream
export default function Waveform({ samples }: { samples: EegSample[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const [W, setW] = useState(1000);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const cw = entries[0]?.contentRect.width;
      if (cw && cw > 0) setW(Math.round(cw));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const hasData = samples.length >= 2;

  const real = samples.map((s) => s.interest_score);
  const hasPredict = samples.some((s) => typeof s.predict_score === "number");
  const predict = samples.map((s) => (typeof s.predict_score === "number" ? s.predict_score : s.interest_score));

  const all = hasPredict ? real.concat(predict) : real;
  const min = hasData ? Math.min(...all) : 0;
  const max = hasData ? Math.max(...all) : 1;
=======
export default function Waveform({
  samples,
  durationMs,
  live = true,
}: {
  samples: EegSample[];
  durationMs?: number;
  live?: boolean;
}) {
  // Before the clip plays there's no signal yet — we still render the full grid
  // + axes (just no line) so the feature reads as "live monitor, armed".
  const hasData = live && samples.length >= 2;

  const real = samples.map((s) => s.interest_score);

  // x-axis spans the FULL clip duration so the line draws across the whole
  // timeline as it plays. Fall back to the last sample time, then 30s.
  const lastT = samples.length ? samples[samples.length - 1].video_t_ms : 0;
  const span = Math.max(durationMs || 0, lastT, 1000);

  // y auto-scale with a minimum visual span + padding so a few early near-equal
  // points don't blow the line up vertically. Default 0..1 before any data.
  let lo = hasData ? Math.min(...real) : 0;
  let hi = hasData ? Math.max(...real) : 1;
  if (hi - lo < 0.25) {
    const c = (hi + lo) / 2;
    lo = c - 0.125;
    hi = c + 0.125;
  }
  const pad = hasData ? (hi - lo) * 0.15 : 0;
  const min = lo - pad;
  const max = hi + pad;
>>>>>>> Stashed changes
  const range = max - min || 1;

  const X = (tMs: number) =>
    LEFT + (Math.min(Math.max(tMs, 0), span) / span) * (W - LEFT - RIGHT);
  const Y = (v: number) => H - BOTTOM - ((v - min) / range) * (H - BOTTOM - TOP);

  const realLine = samples
    .map((s) => `${X(s.video_t_ms).toFixed(1)},${Y(s.interest_score).toFixed(1)}`)
    .join(" ");

<<<<<<< Updated upstream
=======
  // background grid — horizontal ratio ticks (y) + vertical time ticks (x).
>>>>>>> Stashed changes
  const yTicks = Array.from({ length: NY + 1 }, (_, k) => {
    const v = min + (k / NY) * range;
    return { v, y: Y(v) };
  });
  const xTicks = Array.from({ length: NX + 1 }, (_, k) => {
    const frac = k / NX;
    return { x: LEFT + frac * (W - LEFT - RIGHT), t: frac * span };
  });

<<<<<<< Updated upstream
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
    <div ref={ref} className="w-full">
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} preserveAspectRatio="none"
           className="h-[200px] w-full rounded-xl border border-neutral-800 bg-neutral-900/60">
        <defs>
          <linearGradient id="wf" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#9fe9ff" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#9fe9ff" stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

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
            {hasPredict && (
              <polyline points={predictLine} fill="none" stroke="#2f8fd6" strokeWidth="1.5" strokeDasharray="3 6" strokeLinejoin="round" opacity="0.85" />
            )}
            <polyline points={realLine} fill="none" stroke="#d6f7ff" strokeWidth="2.75" strokeLinejoin="round" filter="url(#glow)" />
            {top.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r="4" fill="#d6f7ff" filter="url(#glow)" />
                <text x={p.x} y={p.y - 10} fill="#d6f7ff" fontSize="12" textAnchor="middle">▲{p.tag}</text>
              </g>
            ))}
            <circle cx={X(samples.length - 1)} cy={Y(lastReal)} r="5" fill="#fff">
              <animate attributeName="r" values="4;7;4" dur="1.2s" repeatCount="indefinite" />
            </circle>
          </>
        )}
      </svg>
    </div>
=======
  const headX = X(lastT);
  const headY = Y(real[real.length - 1] ?? 0);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="h-[200px] w-full rounded-xl border border-neutral-800 bg-neutral-900/60">
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

      {!hasData && (
        <text x={W / 2} y={(TOP + H - BOTTOM) / 2} fill="#475569" fontSize="11" textAnchor="middle">
          ▶ press play — live brainwave appears here
        </text>
      )}

      {hasData && (
        <>
          {/* single clean white line — animates in across the full timeline.
              the wf-draw class sweeps the stroke on from left on first paint. */}
          <polyline
            className="wf-draw"
            points={realLine}
            fill="none"
            stroke="#ffffff"
            strokeWidth="2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />

          {/* live head — pulsing white dot at the current playback time */}
          <circle cx={headX} cy={headY} r="3.5" fill="#ffffff">
            <animate attributeName="r" values="3;5.5;3" dur="1.2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.55;1" dur="1.2s" repeatCount="indefinite" />
          </circle>
        </>
      )}

      <style>{`
        .wf-draw {
          stroke-dasharray: 2600;
          stroke-dashoffset: 2600;
          animation: wfDraw 0.9s ease-out forwards;
        }
        @keyframes wfDraw {
          to { stroke-dashoffset: 0; }
        }
      `}</style>
    </svg>
>>>>>>> Stashed changes
  );
}
