"use client";
// TRIBE-style pill tabs adapted to NeuroViral (EEG theta/beta, short-form UGC).
// Sits under the characteristics panel on Screen 1. The first tab ("Browse Clips")
// shows what the model LEARNED from the current clip + similar clips it predicts
// will perform; the rest are explanatory blurbs.
import { useState } from "react";
import { learnedTraits, relatedClips } from "@/lib/demo";

const TABS = [
  { label: "Browse Clips", body: "" },
  {
    label: "Predicted vs Real",
    body:
      "Compare NeuroViral's predicted interest with real EEG from people watching the same clip. The real signal captures the brain's full state — muscle artifacts, wandering thoughts, and natural variability between people — while the model predicts the response to only what is seen and heard.",
  },
  {
    label: "In-Silico",
    body:
      "Tweak a clip's hook, pacing, cuts, or captions and predict the interest response before you ever shoot it — so you stop spraying and praying.",
  },
  {
    label: "The Signal (θ/β)",
    body:
      "We track the theta/beta band-power ratio from forehead electrodes — engagement rises as theta/beta falls. The first system to predict short-form virality response at this resolution for people it has never interacted with.",
  },
];

export default function InsightTabs() {
  const [active, setActive] = useState(0);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        {TABS.map((t, i) => (
          <button
            key={t.label}
            onClick={() => setActive(i)}
            className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              i === active
                ? "bg-neutral-100 text-neutral-900"
                : "border border-neutral-700 text-neutral-300 hover:bg-neutral-800"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {active === 0 ? <BrowseClips /> : <p className="text-sm leading-relaxed text-neutral-400">{TABS[active].body}</p>}
    </div>
  );
}

function BrowseClips() {
  const [playing, setPlaying] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <div>
        <div className="text-sm text-neutral-400">What we learned from this clip:</div>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          {learnedTraits.map((t, i) => (
            <span key={t} style={{ animationDelay: `${i * 110}ms` }} className="reveal rounded-full border border-neutral-700 px-2 py-0.5 text-xs text-neutral-300">
              {t}
            </span>
          ))}
        </div>
      </div>

      <div>
        <div className="reveal mb-2 text-xs uppercase tracking-wide text-neutral-500" style={{ animationDelay: "480ms" }}>clips predicted to perform similarly</div>
        <div className="grid grid-cols-3 gap-2.5">
          {relatedClips.map((c, i) => {
            const isPlaying = playing === c.title;
            return (
              <div key={c.title} className="reveal" style={{ animationDelay: `${600 + i * 150}ms` }}>
                <div className="group relative aspect-[9/16] overflow-hidden rounded-lg border border-neutral-800 bg-gradient-to-b from-neutral-700/60 to-neutral-950">
                  {isPlaying && c.clip ? (
                    <video
                      src={c.clip}
                      className="h-full w-full object-cover"
                      controls
                      autoPlay
                      playsInline
                      onEnded={() => setPlaying(null)}
                    />
                  ) : (
                    <button
                      type="button"
                      onClick={() => c.clip && setPlaying(c.title)}
                      className="absolute inset-0 h-full w-full cursor-pointer"
                      aria-label={`Play ${c.title}`}
                    >
                      {c.thumb && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={c.thumb} alt={c.title} className="h-full w-full object-cover" />
                      )}
                      <span className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black/45 text-xs text-white backdrop-blur-sm">▶</span>
                      </span>
                      <span className="absolute right-1 top-1 rounded bg-black/60 px-1 py-0.5 text-[10px] font-medium tabular-nums text-green-300">
                        {c.score.toFixed(2)}
                      </span>
                    </button>
                  )}
                </div>
                <div className="mt-1 truncate text-xs text-neutral-200">{c.title}</div>
                <div className="truncate text-[11px] text-neutral-500">{c.creator}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
