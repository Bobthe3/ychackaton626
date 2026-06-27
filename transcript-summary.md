# YC Hackathon Prep — Transcript Summary

**Team:** 3 builders (Speaker A = lead/backend "Yuva", Speaker B = front-end "Devin"(?), Speaker D = neuro/storyteller, Speaker C = neuroscience advisor "Holly")
**Event:** YC Growth Hackathon (demo in ~2 days)

## The Product

An **EEG-based virality predictor for short-form video (UGC)**. People watch TikTok/Reels-style videos while wearing an EEG headset; the device captures brainwave "interest spikes." A model maps **video → brainwave waveform**, and an LLM decodes that waveform into natural language + a virality score, explaining *why* a video engages a viewer.

**Pitch in one line:** Stop "spray and pray" UGC marketing — use your own neural data to predict which videos will go viral *before* spending ad money, lowering CPM/CAC.

## Key Decisions

- **EEG only.** Dropped pupillometry / eye tracking — "everyone can do eye tracking," EEG is the differentiator and stronger demo hook.
- **Brainwave bands:** Use **theta + beta ratio (theta/beta)** as the core signal. Dropped frontal alpha asymmetry — alpha lives at the back of the head and won't read well on a forehead-electrode consumer EEG. Keep alpha as a bonus only.
- **Demo > product.** It's a demo, not a full product. Synthetic/pre-recorded data is fine; the live waveform can be a real-time-looking display. One person wears the headset on stage as a visual hook.
- **Data scope:** ~**50 videos** (~20 min of content), **one niche = commercial Tech UGC**, talking-head style. Stored on Cloudflare and pulled via API.
- **Don't over-engineer the ML** — possibly start from an existing model; build a light artifact-rejection layer (remove EMG/muscle noise) if needed. Be careful about IP in skill files.

## Architecture / Screens

- **Screen 1 — Live scroll view:** video player + big EEG waveform(s) at the bottom moving in (apparent) real time, with neural spikes annotated as "high interest."
- **Screen 2 — Per-video analysis:** video characteristics + metadata + a streaming chat-like log (artifact-style cards per video).
- **Screen 3 — Post-session report (separate):** summary stats — which videos won, which creator/format performed best, why.
- **No typing on stage** — everything is pre-loaded / "wrapper."

**APIs:** (1) Cloudflare API for video + characteristics + metadata; (2) GPT-realtime chat interface (sponsor) driven by a system prompt of the video data; (3) local Python server streaming EEG from the device.

**Video schema (5 top fields):** audio info, subtitles/transcript summary, color profile (average color bar per scene), scene/cut count, on-screen text. **Metadata:** length, creation date, creator name, likes/shares.

## Pitch Narrative

"We're B2B SaaS founders, bored at the hackathon, doom-scrolling TikTok — and we all liked Tech content. So we wore EEGs to see *why* our brains like certain videos."
→ Show the device (hook) → feature walkthrough → **judge interaction**: have judges (e.g. "Aaron", "Sarah") wear it on limited data, show their interest spikes, even an Aaron-vs-Sarah "who has better taste" bit → close: more data unlocks more accuracy → **"Stop spraying and praying. Use science to go viral"** (reduces CPM → CAC → saves your bottom line, less "chopped" by friends).

**Roles in pitch:** B wears the device; D gives the narrative; A does the demo walkthrough + the judge interaction.

## Plan / Timeline

- **Today:** pick 50+ Tech-UGC videos (D), set up structure + scaffolding, build front end (B) and backend (A). D requesting an EEG dataset (gated on email access; worst case use just the 3 teammates' data).
- **Tomorrow (hackathon at 4pm):** all three record their own EEG data → train the model → final front end → rehearse, tighten pitch to 2–3 min.
- B will write a precise PRD and keep repo structure clean so front/back-end don't conflict.
