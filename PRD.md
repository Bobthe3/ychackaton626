# PRD — NeuroViral (working title)

> *"Meta TRIBE for virality."* Read people's brains while they watch short-form
> content, then predict what makes a video go viral for a given audience.

**Owner:** Holly (operator / pitch / narrative)
**Build:** Devan (platform + live brainwave viz), Holly (prediction layer), Yuva (hardware + data)
**Event:** YC Hackathon — ~3 days out. Two tracks targeted: *Reading Minds* + *Algorithm Hacking*.

---

## 1. Problem

Creators and advertisers guess at what makes content go viral. Engagement metrics
(views, likes) are *lagging* — you only learn after you ship. There's no way to know,
*before* publishing, which hook / pacing / element actually fires interest in a target
viewer's brain.

## 2. Concept

Meta's **TRIBE** model used fMRI on ~700 people to map content → brain response.
We do the same thing with **EEG hardware** instead of fMRI:

- Show curated short-form content to people wearing the headset.
- Capture **P300 / interest spikes** in real time — see exactly where interest *spikes*
  and where it *drops off*, second by second, against the video timeline.
- Train a **prediction layer** on (content features × neural response × consumer profile).
- Output a **"director's cut to go viral"**: given a target audience, tell the creator what
  hook / pacing / elements to use at each beat (intro → hook → retention → CTA → conclusion).

## 3. The Demo (this is what we are graded on)

The demo is two screens running side by side. **The demo > the product** — judges reward a
clean, visceral live moment.

**Screen 1 — Live capture (Devan)**
A teammate wears the headset and scrolls a stripped-down content feed. The audience watches
the **brainwave spike in real time** as content plays — visible P300 spikes on a hook, flat
line on a boring beat. Real-time latency ~5ms + small time buffer for smoothness.

**Screen 2 — Prediction layer (Holly)**
A creator types a target ("make a video for 18–24, app-review content"). The model returns a
**director's cut**: each beat annotated with what element to use, backed by "we looked at N
brain-spike sessions across this content type."

**Narrative beat:** *content in → brain reacts → we learned the pattern → here's your viral blueprint.*

## 4. User Flows

### 4.1 Data-collection app (already built, trim for demo)
1. Participant puts on headset, opens feed.
2. Watches curated clips; can upvote / downvote / save. (Eye-tracking optional.)
3. Every few clips → a quick feedback question.
4. ~20–30 min session, then close. Data → admin dashboard.

### 4.2 Prediction layer (new — Holly's build)
1. Creator enters a prompt: target persona + age range + content type.
2. System returns a **viral blueprint**: intro / hook / retention / CTA / conclusion, each beat
   tagged with the element to use and *why* (which neural pattern it maps to).
3. (Optional) Show a "evidence" snapshot: N sessions, brain spikes by content type.

## 5. Content selection

Niche down to keep the sample useful (don't show random everything). Standardize on:
- **Talking-head app-review** ("3 apps that changed my life" format) — lots of reference content,
  clean format, works for the headline *"We found the best ad format for consumer apps."*
- **AI "Fruit / Strawberry Love Island"** clips — highly hooky, easy to read strong responses.

## 6. Data schema — the interface contract

**This is the single integration point between Devan's capture and Holly's model.** Lock it
first, then both sides build fully in parallel.

```jsonc
// One neural-response sample, aligned to the content timeline
{
  "session_id": "uuid",
  "participant_id": "uuid",
  "content_id": "uuid",          // which clip
  "content_t_ms": 4200,          // ms offset into the clip (alignment key)
  "wall_clock_ms": 1719200000000,
  "eeg": {
    "p300_amplitude": 7.4,       // µV, primary interest signal
    "channels": { "Fz": 3.1, "Cz": 5.2, "Pz": 7.4 },  // raw per-channel µV
    "interest_score": 0.81       // 0–1 derived, for the live viz
  },
  "event": "upvote | downvote | save | feedback | null",
  "feedback": { "question_id": "uuid", "answer": "..." }  // when event=feedback
}

// Content metadata (features the model learns against)
{
  "content_id": "uuid",
  "type": "app_review | ai_love_island",
  "duration_ms": 18000,
  "beats": [ { "t_ms": 0, "label": "intro" }, { "t_ms": 1500, "label": "hook" }, ... ]
}
```

## 7. Scope — build vs cut (1-day reality)

| Build (must-have for demo) | Cut / fake for now |
| --- | --- |
| Trimmed feed: 1st page + up/down/save | Full product flow, auth, real eye-tracking |
| Live brainwave viz synced to playing clip | Generating new videos on the fly (too slow) |
| Prediction-layer prompt → blueprint output | Large-scale survey collection |
| Data schema + S3 store + admin view | Per-user personalization model |
| Fallback: pre-recorded S3 data for the demo | Training from scratch (we **fine-tune**) |

**Model:** fine-tune an existing dataset alongside fresh neural data (training ~10–24 hrs).
Collect fresh scrolling data **before** the event; if time runs out, demo on S3 data.

## 8. Work division

| Owner | Owns | Deliverable |
| --- | --- | --- |
| **Holly** (operator) | PRD, pitch & narrative, demo choreography, content selection, **prediction-layer UI (Screen 2)** | The story + the blueprint screen |
| **Devan** | Trimmed platform, **live brainwave viz (Screen 1)**, capture integration | The live-capture front |
| **Yuva** | Headset hardware, real-time data streams, derisking | Reliable EEG stream |

**Why this split:** only one integration point (the schema in §6). Holly builds the screen that
tells the story she's pitching; Devan owns capture/viz; Yuva owns the hardware that must not break.

## 9. Timeline (3 days)

- **T-3 (today):** lock this PRD + data schema. Holly drafts pitch. Yuva confirms hardware.
- **T-2 (tomorrow, 12:00–5:00 @ house):** collect scrolling neural data on ourselves
  (no prior scrolling studies exist). Start fine-tuning. Both screens scaffolded.
- **T-1:** integrate Screen 1 ↔ Screen 2 over the schema. Fine-tune finishes. Curate content.
- **Hackathon day:** rehearse demo ≥3×, derisk hardware, finalize pitch.

## 10. Risks & derisking

| Risk | Mitigation |
| --- | --- |
| **Hardware breaks live** (top risk) | Rehearse on-device ≥3×; pre-recorded S3 fallback ready |
| No scrolling data yet | Collect on ourselves T-2 (12–5 session) |
| Real-time jitter | ~5ms latency + time buffer to smooth the viz |
| Two devs overlap | Vertical split + single schema contract (§6, §8) |
| Neither dev has fine-tuned before | Fine-tune (not train); pair on it; lean on Claude Code |

## 11. Open questions

- [ ] Confirm hackathon eligibility / apply (Holly to DM organizers).
- [ ] Where does the brainwave/firmware tracking UI live? (Devan → ask Shree.)
- [ ] Which exact clips for the curated set? (Holly to finalize content list.)
