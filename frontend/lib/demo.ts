// Demo-only precomputed values for the Log + Report screens (the "scaled" story).
// Keyed by the mock video_ids in contracts/mocks/videos.json. Swap for real
// aggregates once the EEG pipeline is live.

export const demoInterest: Record<string, number> = {
  "11111111-1111-1111-1111-111111111111": 0.81,
  "22222222-2222-2222-2222-222222222222": 0.34,
  "33333333-3333-3333-3333-333333333333": 0.74,
};

export const demoNote: Record<string, string> = {
  "11111111-1111-1111-1111-111111111111":
    "Strong spike at the hook (0:02). Fast cuts + bold on-screen text sustained theta/beta.",
  "22222222-2222-2222-2222-222222222222":
    "Flat response. Slow intro, no hook in the first 3 seconds.",
  "33333333-3333-3333-3333-333333333333":
    "Punchy hook + captions throughout kept attention high until the CTA.",
};

// "Browse Clips": what the model learned from the current clip, plus clips it
// predicts will perform similarly. Demo data.
export const learnedTraits: string[] = [
  "relatable office-humor hook",
  "fast talking-head, eye contact",
  "burned-in captions throughout",
  "\"tag a coworker\" call-to-action",
];

export type RelatedClip = { title: string; creator: string; trait: string; score: number; thumb?: string; clip?: string };

export const relatedClips: RelatedClip[] = [
  { title: "POV: the coworker who replies-all", creator: "@corporate.skits", trait: "relatable hook", score: 0.83 },
  { title: "Things my manager says in standup", creator: "@9to5comedy", trait: "talking-head + captions", score: 0.78 },
  { title: "When someone microwaves fish at work", creator: "@officehumor", trait: "2-second hook", score: 0.74 },
  { title: "Tag a friend who does this in meetings", creator: "@deskbound", trait: "tag-a-coworker CTA", score: 0.71 },
  { title: "Office small talk, ranked", creator: "@worklife", trait: "fast cuts", score: 0.69 },
  { title: "When the meeting could've been an email", creator: "@cubicle.life", trait: "punchy text overlay", score: 0.66 },
];
