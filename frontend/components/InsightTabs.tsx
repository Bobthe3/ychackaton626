"use client";
// TRIBE-style pill tabs + blurb, adapted to NeuroViral (EEG theta/beta, short-form UGC).
// Sits under the characteristics panel on Screen 1.
import { useState } from "react";

const TABS: { label: string; body: string }[] = [
  {
    label: "Browse Clips",
    body:
      "Scroll real short-form Tech UGC while we read the brain. Each clip's interest curve is captured live, second by second, against the video timeline.",
  },
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
      <p className="text-sm leading-relaxed text-neutral-400">{TABS[active].body}</p>
    </div>
  );
}
