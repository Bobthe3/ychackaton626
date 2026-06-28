"use client";
import { useEffect, useMemo, useRef, useState } from "react";

interface ReplaySample {
  tMs: number;
  interest: number;
}

interface ReplayItem {
  exposureId: string;
  dwellMs: number;
  samples: ReplaySample[];
}

interface ReplaySession {
  shortId: string;
  sessionId: string;
  items: ReplayItem[];
}

export default function LivePage() {
  const [items, setItems] = useState<ReplayItem[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const itemRefs = useRef(new Map<string, HTMLElement>());
  const startedAtRef = useRef(0);
  const didAdvanceRef = useRef(false);

  useEffect(() => {
    fetch("/mocks/session-replay.json")
      .then((res) => res.json() as Promise<ReplaySession[]>)
      .then((sessions) => {
        const requestedSession = new URLSearchParams(window.location.search).get("session")?.trim();
        const selected = requestedSession
          ? sessions.filter((session) => session.shortId === requestedSession || session.sessionId === requestedSession)
          : sessions;
        setItems(selected.flatMap((session) => session.items));
      })
      .catch((error) => console.warn("[replay] could not load session replay", error));
  }, []);

  const activeItem = items[activeIndex];
  const activeDurationMs = useMemo(() => durationFor(activeItem), [activeItem]);

  useEffect(() => {
    if (!items.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;

        const nextIndex = Number((visible.target as HTMLElement).dataset.index);
        if (Number.isFinite(nextIndex)) setActiveIndex(nextIndex);
      },
      { threshold: [0.7, 0.85, 0.95] },
    );

    itemRefs.current.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    if (!activeItem) return;
    startedAtRef.current = performance.now();
    didAdvanceRef.current = false;
    setElapsedMs(0);
  }, [activeItem?.exposureId]);

  useEffect(() => {
    if (!activeItem) return;

    let frame = 0;
    const tick = () => {
      const nextElapsed = Math.min(performance.now() - startedAtRef.current, activeDurationMs);
      setElapsedMs(nextElapsed);

      if (nextElapsed >= activeDurationMs && !didAdvanceRef.current) {
        didAdvanceRef.current = true;
        window.setTimeout(() => {
          const nextIndex = activeIndex + 1;
          const next = items[nextIndex];
          if (!next) return;
          itemRefs.current.get(next.exposureId)?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        }, 140);
        return;
      }

      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activeIndex, activeItem, activeDurationMs, items]);

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="h-screen snap-y snap-mandatory overflow-y-auto scroll-smooth">
        {items.map((item, index) => {
          const active = index === activeIndex;
          return (
            <section
              key={item.exposureId}
              ref={(node) => {
                if (node) itemRefs.current.set(item.exposureId, node);
                else itemRefs.current.delete(item.exposureId);
              }}
              data-index={index}
              className="grid h-screen snap-start place-items-center bg-black px-8"
            >
              <WaveformRectangle
                durationMs={durationFor(item)}
                sourceSamples={item.samples}
                samples={active ? samplesUntil(item.samples, elapsedMs, durationFor(item)) : []}
              />
            </section>
          );
        })}
      </div>
    </div>
  );
}

function durationFor(item?: ReplayItem) {
  if (!item) return 1000;
  const lastSampleMs = item.samples.at(-1)?.tMs ?? 0;
  return Math.max(1000, Math.min(item.dwellMs, lastSampleMs + 500));
}

function samplesUntil(samples: ReplaySample[], elapsedMs: number, durationMs: number) {
  const endMs = Math.min(elapsedMs, durationMs);
  const frameStepMs = 1000 / 60;
  const visible: ReplaySample[] = [];

  for (let tMs = 0; tMs < endMs; tMs += frameStepMs) {
    visible.push({ tMs, interest: sampleAt(samples, tMs) });
  }

  if (endMs > 0) {
    visible.push({ tMs: endMs, interest: sampleAt(samples, endMs) });
  }

  return smoothSamples(visible);
}

function sampleAt(samples: ReplaySample[], tMs: number) {
  if (!samples.length) return 0.5;
  if (tMs <= samples[0].tMs) return samples[0].interest;
  const last = samples.at(-1);
  if (!last || tMs >= last.tMs) return last?.interest ?? 0.5;

  const nextIndex = samples.findIndex((sample) => sample.tMs >= tMs);
  const previous = samples[Math.max(0, nextIndex - 1)];
  const next = samples[nextIndex];
  const span = next.tMs - previous.tMs || 1;
  const rawProgress = (tMs - previous.tMs) / span;
  const progress = rawProgress * rawProgress * (3 - 2 * rawProgress);
  return previous.interest + (next.interest - previous.interest) * progress;
}

function smoothSamples(samples: ReplaySample[]) {
  const pass = samples.map((sample, index) => {
    const before2 = samples[Math.max(0, index - 2)]?.interest ?? sample.interest;
    const before1 = samples[Math.max(0, index - 1)]?.interest ?? sample.interest;
    const after1 = samples[Math.min(samples.length - 1, index + 1)]?.interest ?? sample.interest;
    const after2 = samples[Math.min(samples.length - 1, index + 2)]?.interest ?? sample.interest;
    return {
      tMs: sample.tMs,
      interest: before2 * 0.08 + before1 * 0.22 + sample.interest * 0.4 + after1 * 0.22 + after2 * 0.08,
    };
  });

  let previous = pass[0]?.interest ?? 0.5;
  return pass.map((sample) => {
    previous = previous * 0.82 + sample.interest * 0.18;
    return { tMs: sample.tMs, interest: previous };
  });
}

function WaveformRectangle({
  durationMs,
  sourceSamples,
  samples,
}: {
  durationMs: number;
  sourceSamples: ReplaySample[];
  samples: ReplaySample[];
}) {
  const width = 1600;
  const height = 260;
  const topLimit = 21;
  const bottomLimit = height - 21;
  const startY = height * 0.68;
  const startInterest = sourceSamples[0]?.interest ?? 0.5;
  const positiveRange = Math.max(0.08, ...sourceSamples.map((sample) => sample.interest - startInterest));
  const negativeRange = Math.max(0.08, ...sourceSamples.map((sample) => startInterest - sample.interest));
  const yScale = Math.min((startY - topLimit) / positiveRange, (bottomLimit - startY) / negativeRange);

  const points = samples.map((sample) => ({
    x: (sample.tMs / durationMs) * width,
    y: clamp(startY - (sample.interest - startInterest) * yScale, topLimit, bottomLimit),
  }));
  const path = smoothPath(points);

  return (
    <div className="h-[260px] w-full max-w-[1600px] border border-white/70 bg-black">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-full w-full" preserveAspectRatio="none">
        {Array.from({ length: 6 }).map((_, index) => (
          <line
            key={`h-${index}`}
            x1="0"
            x2={width}
            y1={(index / 5) * height}
            y2={(index / 5) * height}
            stroke="rgba(255,255,255,0.10)"
          />
        ))}
        {Array.from({ length: 16 }).map((_, index) => (
          <line
            key={`v-${index}`}
            x1={(index / 15) * width}
            x2={(index / 15) * width}
            y1="0"
            y2={height}
            stroke="rgba(255,255,255,0.08)"
          />
        ))}
        {path ? (
          <>
            <path d={path} fill="none" stroke="rgba(52,211,153,0.18)" strokeWidth="16" strokeLinecap="round" />
            <path d={path} fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
          </>
        ) : null}
      </svg>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function smoothPath(points: Array<{ x: number; y: number }>) {
  if (points.length < 2) return "";
  if (points.length === 2) {
    return `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)} L ${points[1].x.toFixed(1)} ${points[1].y.toFixed(1)}`;
  }

  let d = `M ${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[Math.max(0, i - 1)];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[Math.min(points.length - 1, i + 2)];
    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return d;
}
