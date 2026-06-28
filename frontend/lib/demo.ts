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
