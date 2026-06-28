"use client";
// Live "movie barcode" — appends one vertical stripe per tick, building the
// classic film-palette strip in real time (prd-holly: color_profile is extracted
// client-side, keyed by video_id — NOT precomputed by Devan).
//
// Source priority per stripe:
//   1. If a <video> is playing and its frames are readable, the stripe is the
//      AVERAGE color of the current frame (true real-time extraction).
//   2. Otherwise (mock placeholder / cross-origin-tainted frame) the stripe is
//      SYNTHESIZED as an evolving film palette — warm neutrals with the
//      occasional cool accent — so the strip is always live, never static.
import { useEffect, useState, type RefObject } from "react";

const MAX = 200; // stripes kept on screen (older ones scroll off the left)
const TICK = 140; // ms per stripe

export default function MovieBarcode({
  videoRef,
  seed,
  height = 44,
  className = "",
}: {
  videoRef?: RefObject<HTMLVideoElement | null>;
  seed?: string;
  height?: number;
  className?: string;
}) {
  const [stripes, setStripes] = useState<string[]>([]);

  useEffect(() => {
    setStripes([]); // reset when the source clip changes
    let cancelled = false;

    // tiny offscreen canvas for frame sampling
    const canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    const ctx = canvas.getContext("2d", { willReadFrequently: true });

    // synth state: HSL random-walk constrained to a film-palette band
    let h = 32;
    let s = 0.18;
    let l = 0.3;
    const rnd = seedRand(seed);

    const sampleVideo = (): string | null => {
      const v = videoRef?.current;
      if (!v || v.readyState < 2 || v.videoWidth === 0 || !ctx) return null;
      try {
        ctx.drawImage(v, 0, 0, canvas.width, canvas.height);
        const d = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
        let r = 0;
        let g = 0;
        let b = 0;
        const n = d.length / 4;
        for (let i = 0; i < d.length; i += 4) {
          r += d[i];
          g += d[i + 1];
          b += d[i + 2];
        }
        return `rgb(${Math.round(r / n)} ${Math.round(g / n)} ${Math.round(b / n)})`;
      } catch {
        return null; // tainted canvas (cross-origin frame) → fall back to synth
      }
    };

    const synth = (): string => {
      l = clamp(l + (rnd() - 0.5) * 0.18, 0.06, 0.86); // brightness drifts
      s = clamp(s + (rnd() - 0.5) * 0.08, 0.04, 0.5); // saturation drifts
      if (rnd() < 0.06) {
        h = 200 + (rnd() - 0.5) * 30; // sporadic cool blue/teal accent
      } else {
        h = h < 60 ? h + (rnd() - 0.5) * 12 : h + (40 - h) * 0.3; // ease back to warm
      }
      return `hsl(${Math.round(h)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%)`;
    };

    const id = setInterval(() => {
      if (cancelled) return;
      const color = sampleVideo() ?? synth();
      setStripes((prev) => {
        const next = prev.length >= MAX ? prev.slice(prev.length - MAX + 1) : prev.slice();
        next.push(color);
        return next;
      });
    }, TICK);

    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [videoRef, seed]);

  return (
    <div
      className={`flex w-full overflow-hidden rounded-lg border border-neutral-800 bg-neutral-950 ${className}`}
      style={{ height }}
    >
      {stripes.length === 0 ? (
        <div className="flex w-full items-center justify-center text-[10px] text-neutral-600">extracting palette…</div>
      ) : (
        stripes.map((c, i) => <div key={i} className="h-full flex-1" style={{ background: c }} />)
      )}
    </div>
  );
}

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

// per-seed PRNG mixed with Math.random, so each clip's synth differs yet stays lively
function seedRand(seed?: string) {
  let x = 2166136261 >>> 0;
  for (const ch of seed ?? "x") {
    x ^= ch.charCodeAt(0);
    x = Math.imul(x, 16777619);
  }
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    x >>>= 0;
    return (x / 4294967296 + Math.random()) % 1;
  };
}
