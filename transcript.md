# YC Hackathon Prep — Meeting Summary

**Date:** Jun 24
**Participants:** Devan Velji (+ Yuva, referenced) and a teammate ("operator")

## Concept

Build a "Meta TRIBE for virality." Instead of fMRI, use the team's EEG hardware to capture
P300 / interest spikes while people watch short-form content. Collect neural + survey data
across consumer profiles, then build a **prediction layer** that tells a creator what
hooks/elements make a video go viral for a given audience — a "director's cut to go viral"
(intro → hook → retention → call to action → conclusion).

Two hackathon tracks to target: **"reading minds"** and **"algorithm hacking."**

## Key Decisions

- **Demo is the priority.** Judges respond to a strong live demo more than a polished product.
  Plan: one person wears the headset live while the audience watches brainwaves spike in real
  time against video/ad content, shown on a second screen/tab next to the content feed.
- **Real-time accuracy** is ~5ms; add a time buffer to smooth it. Top derisking goal: make
  sure the hardware does **not** break during the demo.
- **Data:** collect fresh neural data before the hackathon; fall back to existing S3 data for
  the demo if time is short. Model approach = fine-tune an existing dataset alongside fresh
  neural data (training ~10–24 hrs).
- **Content:** standardize on a narrow niche to keep sample size useful. Leading options:
  talking-head app-review videos ("3 apps that changed my life" format) and AI "Fruit/Strawberry
  Love Island" clips. Target headline e.g. *"We found the best ad format for consumer apps."*
- **Platform:** already built (video feed, upvote/downvote/save, eye tracking, feedback
  questions, admin dashboard). For the demo, strip to the first feed page + brainwave view.
  Devan to clone it into a fresh repo so the teammate can collaborate.
- **Hackathon logistics:** event is within ~3 days; teammate still needs to apply (winning
  reportedly leads to a YC interview).

## Roles

- **Devan** — full-stack: platform / application layer, front-end design, brainwave UI.
- **Yuva** — hardware + real-time data streams; owns the headset.
- **Teammate ("operator")** — pitch narrative, science framing, work division; will write the
  PRD and propose the task split.

## Action Items

- [ ] **Teammate:** generate the PRD (with UI frame) and send to Devan + Yuva; propose work division.
- [ ] **Devan:** send a screenshot of the demo / brainwave ("firmware") interface; ask Shree where it lives.
- [ ] **Devan:** clone the platform into a new shared repo.
- [ ] **Teammate:** apply to the hackathon (DM organizers to confirm eligibility).
- [ ] **All:** meet tomorrow **12:00–5:00** at the house (side room) to collect scrolling neural
      data on themselves and start fine-tuning — no prior studies exist for scrolling yet.
