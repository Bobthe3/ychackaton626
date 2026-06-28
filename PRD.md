# PRD — NeuroViral (working title)

> **Stop spraying and praying.** Wear an EEG, watch short-form videos, and let your own
> brain tell you which ones will go viral — *before* you spend a dollar on ads.

**Event:** YC Growth Hackathon · demo in ~2 days · niche = **Tech UGC** (commercial tech, talking-head style)

**Team (3):**

| Person | Role | Owns |
| --- | --- | --- |
| **Holly** (you) | recorder / front-end | **The 3 demo screens** (UI) |
| **Devan** | model + backend | Model training, EEG Python server, Cloudflare + chat APIs |
| **Yuva** | pitch / founder + neuro | The narrative & on-stage story; **defined the EEG signal (theta/beta)** |

> ⚠️ **Two things still TBD — see §10. I assumed the safe default; flip with one word.**
> 1. EEG on demo day: **synthetic/pre-recorded** (primary) with real-time as a bonus.
> 2. Model: **lightweight real signal (theta/beta) + simulated video→waveform** prediction.

---

## 1. Problem

UGC marketers run "trial and error in production": hire 10 creators, post for a month, then
put ad spend behind whatever happened to perform. Engagement metrics (likes, views) are
**lagging** — you only learn after you ship. That's slow and burns money (high CPM → high CAC).

## 2. Concept

Like Meta's **TRIBE** (fMRI → content response), but with cheap **EEG**:

- Show curated Tech-UGC clips to people wearing a headset.
- Capture an **interest signal** from the brain second-by-second against the video timeline.
- An LLM **decodes** the waveform into plain language + a **virality score**, explaining *why*
  a clip engaged the viewer (which hook / pacing / element fired interest).
- Bottom line: **reduce the number of darts you throw** to hit virality → CPM ↓ → CAC ↓.

**The neuro signal:** **theta/beta band-power ratio** (forehead electrodes). We explicitly
**drop frontal alpha asymmetry** — alpha lives at the back of the head and won't read cleanly
on a consumer forehead-electrode EEG. Theta + beta are present frontally and visibly move →
better for a demo.

## 3. The Demo (this is what we're graded on)

**Demo > product.** No typing on stage — everything is pre-loaded ("wrapper"). One teammate
**wears the headset the whole time** as a visual hook. Three screens:

1. **Live scroll** — video reel + big waveform with annotated interest spikes (apparent real-time).
2. **Session log** — per-video analysis cards (the 5-field schema + metadata) in a streaming chat-style feed.
3. **Session report** (separate) — summary stats: which clips/creators/formats won, and why.

**Pitch arc (Yuva):** bored B2B founders doom-scrolling → all of us like Tech content → wear EEG
to see *why* → feature walkthrough → **judge interaction** (Aaron/Sarah wear it, compare taste)
→ more data = more accuracy → *"stop spraying and praying, use science."*

### Closing easter egg — Orange Slice as our GTM workflow (sponsor bonus, NOT a product feature)

Orange Slice is a go-to-market engineering platform: an agentic spreadsheet / agent package for
building revenue workflows through code. It fits this closing beat because it is about **turning a
signal into a growth workflow**, not pretending we can identify anonymous editors behind a viral clip.

> *"NeuroViral tells you what content will spike attention. Orange Slice turns that signal into the
> GTM workflow: find the right Heads of Growth, enrich them, and launch the outbound sequence."*

- **What it is:** one prebuilt Orange Slice workflow / agentic spreadsheet row:
  `ICP: Head of Growth at UGC-heavy B2B/consumer brands` → enrich → draft outbound using the winning
  hook/format from NeuroViral.
- **Why this and not "recruit the creator":** the people in our (sponsor/founder-fronted) demo clips
  are founders you can't recruit, and the actual video editors are usually not attributable. GTM is
  the honest sponsor tie-in.
- **Rule:** keep it to one slide / one line. It earns sponsor relevance without muddling the core
  EEG → virality story. Cut it if the pitch runs long.

---

## 4. UI (ASCII mockups)

### Screen 1 — Live scroll  *(Holly)*
```
┌──────────────────────────────────────────────────────────┐
│  NeuroViral        ● REC   theta/beta 2.3      Holly 🧠   │
├───────────────────────────┬──────────────────────────────┤
│                           │  NOW PLAYING                  │
│       ┌────────────┐      │  "3 AI apps that..."          │
│       │            │      │  @techbro · 0:12 / 0:18       │
│       │   VIDEO    │      │                               │
│       │ (vertical  │      │  ┌─ characteristics ───────┐  │
│       │   reel)    │      │  │ color ▮▮▮▮▮▮▮▯▯▯         │  │
│       │            │      │  │ cuts  7                  │  │
│       │            │      │  │ audio music + VO         │  │
│       └────────────┘      │  │ subs  yes                │  │
│                           │  │ text  "you NEED this"    │  │
│                           │  └──────────────────────────┘ │
├───────────────────────────┴──────────────────────────────┤
│  INTEREST  (theta/beta · live)                            │
│        ╭╮      ╭─╮            ╭╮                           │
│   ─────╯╰──────╯ ╰────╮   ╭──╯╰─────   spike = interest   │
│                       ╰───╯                               │
│        ▲hook          ▲drop          ▲CTA                 │
└──────────────────────────────────────────────────────────┘
```

### Screen 2 — Session log  *(Holly)*
```
┌──────────────────────────────────────────────────────────┐
│  Session log                               streaming ●    │
├──────────────────────────────────────────────────────────┤
│  ┌─ video 1 ─────────────────────────────────────────┐   │
│  │ [▣] "3 AI apps..."   @techbro                      │   │
│  │ interest 0.81  ▮▮▮▮▮▮▮▮▯▯                          │   │
│  │ ↳ Strong spike at the hook (0:02). Fast cuts +     │   │
│  │   bold on-screen text sustained theta/beta.        │   │
│  └────────────────────────────────────────────────────┘  │
│  ┌─ video 2 ─────────────────────────────────────────┐   │
│  │ [▣] "my honest review"   @sara                     │   │
│  │ interest 0.34  ▮▮▮▯▯▯▯▯▯▯                          │   │
│  │ ↳ Flat. Slow intro, no hook in first 3s.           │   │
│  └────────────────────────────────────────────────────┘  │
│  ...                                                       │
│  ┌─ ask ───────────────────────────────────────┐  [ ↑ ]  │
│  │ why did video 1 win?                          │         │
│  └───────────────────────────────────────────────┘         │
└──────────────────────────────────────────────────────────┘
```

### Screen 3 — Session report  *(Holly)*
```
┌──────────────────────────────────────────────────────────┐
│  SESSION REPORT   ·  3 viewers · 50 clips · Tech UGC       │
├──────────────────────────────────────────────────────────┤
│  TOP PERFORMERS (by interest)                             │
│   1. "3 AI apps..."   @techbro   ▮▮▮▮▮▮▮▮▯  0.81          │
│   2. "I tried..."     @devtok    ▮▮▮▮▮▮▮▯▯  0.74          │
│   3. "honest review"  @nora      ▮▮▮▮▮▮▯▯▯  0.68          │
│                                                           │
│  WHAT WINS                 WHO WINS                        │
│   ▸ hook in first 2s        ▸ @techbro (avg 0.77)         │
│   ▸ 6–9 cuts                ▸ best format: fast talking-   │
│   ▸ bold on-screen text       head + captions             │
│   ▸ warm color palette                                    │
│                                                           │
│   →  Stop spraying and praying.   CPM ↓   CAC ↓           │
└──────────────────────────────────────────────────────────┘
```

---

## 5. Data scope

- **~50+ videos**, **one niche** = commercial Tech UGC, talking-head style (~20 min of content).
- Likes/shares **hidden** during capture so brain response isn't biased by social proof.
- Stored on **Cloudflare**, served to the front-end via API as MP4 + precomputed characteristics.

## 6. Schema — the interface contract  *(lock this first; Holly ↔ Devan integrate here)*

```jsonc
// Per-video payload (Cloudflare API → front-end). Characteristics are PRECOMPUTED.
{
  "video_id": "uuid",
  "url": "https://.../clip.mp4",
  "characteristics": {              // the 5 fields shown on Screen 1/2
    "audio": "music + VO",          // one word/short: music | VO | music+VO
    "transcript_summary": "...",    // 1–3 lines (pre-analysis step)
    "color_profile": ["#e8c9a0", "#c97b4a", ...],  // avg color per scene → a bar
    "cut_count": 7,                 // number of scenes/cuts
    "on_screen_text": "you NEED this"
  },
  "metadata": {
    "duration_ms": 18000,
    "created_at": "2026-06-01",
    "creator": "@techbro",
    "likes": 124000, "shares": 8200
  }
}

// EEG sample (local Python server → front-end over WebSocket), aligned to the clip timeline
{
  "session_id": "uuid",
  "video_id": "uuid",
  "video_t_ms": 4200,               // ms offset into the clip (alignment key)
  "theta_beta": 2.3,                // primary band-power ratio
  "interest_score": 0.81            // 0–1 derived, for the waveform + cards
}
```

## 7. Tech stack

| Layer | Choice | Owner | Why |
| --- | --- | --- | --- |
| **3 screens (UI)** | Next.js (App Router) + TS + Tailwind + shadcn/ui | **Holly** | Fast, looks great on stage; 3 routes |
| **Live waveform** | uPlot or raw `<canvas>` over **WebSocket** | Holly (Devan feeds it) | Smooth high-frequency stream |
| **EEG bridge** | Python + OpenBCI / BrainFlow SDK → **WebSocket** | **Devan** | EEG SDKs are Python; computes theta/beta + interest_score |
| **Video + characteristics API** | **Cloudflare** (Workers/R2) serving MP4 + §6 schema | **Devan** | One API, precomputed offline |
| **Chat / decode API** | **GPT-realtime (OpenAI — sponsor)**; system prompt = video data + waveform | **Holly** (Devan supplies waveform + decode semantics) | Lives in Holly's Screen 2 chat UI; front-end calls OpenAI. Devan provides "what a theta/beta spike means" for the prompt. Sponsor prize + credits |
| **Model: video → waveform** | Fine-tune on requested dataset **if it arrives**, else simulate | **Devan** | Demo-grade; see §10 |
| **Color profile extraction** | ffmpeg + simple avg-color-per-scene script | **Holly** | Cheap, visually striking; Holly renders it anyway, so she owns extraction too |
| **Deploy** | Vercel (UI) + small box/Render (Python EEG server runs local on demo machine) | Devan | Demo URLs; EEG must be local to the headset |
| **GTM workflow (bonus)** | **Orange Slice (sponsor)** — agentic spreadsheet / agent package for `ICP → enrich → outbound` | **Holly** | Closing easter egg only (see §3); Holly delivers it. **Not** in the product. Can be prebuilt once offline for a slide. Cut if pitch runs long |
| **Build accelerant** | Claude Code | all | Lean on it for ML / unfamiliar parts |

**One real decision:** UI in **Next.js/TS**, EEG + model in **Python**, talking over **WebSocket**
(live waveform) + **HTTP** (video/chat). Don't do EEG or fine-tuning in JS.

### Repo structure (scaffolded)

```
ychackaton626/
├── contracts/                  SHARED — the §6 schema. Lock once; changing it = ping the other.
│   ├── video.schema.json         video payload (Cloudflare → front-end)
│   ├── eeg-sample.schema.json    EEG sample (Python WS → front-end)
│   └── mocks/                    videos.json + eeg-sample.jsonl (build against these)
│
├── frontend/   ── Holly ──      Next.js + TS — everything the judges look at
│   ├── app/live | log | report/  the 3 demo screens
│   ├── components/               Waveform · ColorBar · CharacteristicsPanel · VideoCard
│   ├── lib/                      types · api · ws · openai (chat/decode)
│   └── scripts/extract-color     color_profile extraction
│
├── backend/    ── Devan ──      Python — EEG, data, model
│   ├── eeg_server/               OpenBCI/BrainFlow → theta/beta → WebSocket
│   ├── precompute/               offline characteristics for the 50 clips
│   ├── cloudflare/               GET /api/videos (Video schema) + R2 MP4s
│   └── model/                    fine-tune / simulate video → waveform
│
└── PRD.md · prd-holly.md · transcript.md · README.md
```

**Merge discipline:** **Holly** only edits `frontend/`, **Devan** only edits `backend/`, both agree
on `contracts/` once. No overlapping files = no merge conflicts. Work on separate branches
(`holly-frontend`, `devan-backend`) → PR into `main`.

## 8. Scope — build vs cut (2-day reality)

| Build (must-have) | Cut / fake for now |
| --- | --- |
| 3 screens, no-typing wrapper flow | Auth, full product, eye-tracking, pupillometry |
| Waveform synced to playing clip | Generating new videos on the fly |
| 50 clips on Cloudflare + precomputed schema | Large-scale survey / 100-person study |
| Session log + report screens | Per-user personalization model |
| Pre-recorded EEG fallback ready | Training from scratch (we fine-tune or simulate) |

## 9. Timeline

- **Today:** lock this PRD + §6 schema. Devan picks **50+** Tech-UGC clips → Cloudflare +
  precompute characteristics. Holly scaffolds the 3 screens. Devan stands up EEG WebSocket.
  Devan chases dataset-access email.
- **Tomorrow (hackathon @ 4pm):** the 3 of us record our **own** EEG while scrolling → feed the
  model → finalize UI ↔ backend integration → **rehearse pitch to 2–3 min**.
- **On stage:** Holly demos the screens she built; Yuva drives the narrative; Devan handles
  judge interaction (Aaron/Sarah wear the headset) + keeps the stream alive.

## 10. Open questions (need your call)

- [ ] **EEG on demo day:** synthetic/pre-recorded (assumed) vs must be real-time live capture?
- [ ] **Model:** simulated video→waveform (assumed) vs actually fine-tune on the dataset?
- [ ] **Dataset access** — did the gated EEG dataset email come back? (Devan)
- [ ] Will judges (Aaron/Sarah) actually wear the headset, and may we use their names on stage?
- [ ] Final 50-clip list locked? (Devan) — confirm single sub-niche within Tech UGC.

## 11. Risks

| Risk | Mitigation |
| --- | --- |
| **Headset breaks/jitters live** (top risk) | Pre-recorded EEG fallback; one person wears it the whole time; rehearse ≥3× |
| Dataset doesn't arrive | Simulate video→waveform; train light theta/beta only on our 3 recordings |
| Holly ↔ Devan overlap | Single §6 schema contract; Holly owns all UI, Devan owns all data/model |
| Waveform looks weak on screen | Auto-scale display; use theta/beta (not alpha) so spikes are visible |
| Pitch runs long | Hard-cap 2–3 min; Yuva rehearses; cut the chat feature if needed |
