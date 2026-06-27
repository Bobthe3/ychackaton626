# PRD — Holly's build

> Your slice of NeuroViral. You own everything the judges *look at*. Parent doc: [`PRD.md`](./PRD.md).

## What you own

| # | Deliverable | Notes |
| --- | --- | --- |
| 1 | **Screen 1 — Live scroll** | video reel + live waveform + characteristics panel |
| 2 | **Screen 2 — Session log** | per-video cards + **Chat/decode API (you own this)** |
| 3 | **Screen 3 — Session report** | top performers + "what wins / who wins" |
| 4 | **Live waveform rendering** | consume Devan's EEG WebSocket, draw it smoothly |
| 5 | **Chat / decode API integration** | GPT-realtime in Screen 2 (Devan supplies waveform + semantics) |
| 6 | **Color profile extraction** | ffmpeg avg-color-per-scene → the color bar |
| 7 | **Fiber API / GTM closing beat** | one `peopleSearch` call for a slide; you deliver it on stage (see §7) |

**You do NOT own:** picking/serving the 50 videos, precomputing characteristics, the EEG Python
server, model training. That's Devan. You *consume* his data via the contracts in §3.

---

## 1. Tech stack (your part)

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js (App Router) + TypeScript** | 3 routes = 3 screens; fast, looks great on stage |
| Styling | **Tailwind + shadcn/ui** | Polished UI in hours, not days |
| Live waveform | **uPlot** (or raw `<canvas>`) | Handles high-frequency streams smoothly; uPlot is tiny + fast |
| Realtime in | **WebSocket client** (native `WebSocket`) | Receives EEG samples from Devan's Python server |
| Video data in | **fetch** the Cloudflare API | MP4 + precomputed characteristics + metadata |
| Chat | **OpenAI GPT-realtime SDK** (sponsor) | You call it from the front-end; system prompt built from video data + waveform |
| Color extraction | **ffmpeg** + a small Node/Python script | Run offline once per clip, cache the result |
| GTM beat (bonus) | **Fiber AI** `peopleSearch` (sponsor), `x-api-key` | One call for a closing slide; pull offline. Not in the product. |
| Deploy | **Vercel** | Demo URL. (Devan's EEG server runs locally on the demo machine.) |
| Build accelerant | **Claude Code** | Lean on it for uPlot wiring, ffmpeg script, shadcn layout |

**Routes:** `/live` (Screen 1) · `/log` (Screen 2) · `/report` (Screen 3). One repo, one deploy.

**Golden rule for the demo:** **no typing on stage.** Everything is pre-loaded / wrapper. Waveform
and video are the two things that MUST look great — prioritize those over the chat.

---

## 2. UI (ASCII — what to build)

> Bracketed `{field}` = where a §3 schema field binds.

### Screen 1 — `/live`  (the money shot)
```
┌──────────────────────────────────────────────────────────┐
│  NeuroViral        ● REC   theta/beta {theta_beta}  Holly🧠│
├───────────────────────────┬──────────────────────────────┤
│                           │  NOW PLAYING                  │
│       ┌────────────┐      │  {transcript_summary[title]}  │
│       │            │      │  {creator} · 0:12 / {duration}│
│       │   VIDEO    │      │                               │
│       │ (vertical  │      │  ┌─ characteristics ───────┐  │
│       │   reel)    │      │  │ color {color_profile}▮▮▮ │  │  ← color bar
│       │  {url}     │      │  │ cuts  {cut_count}        │  │
│       │            │      │  │ audio {audio}            │  │
│       └────────────┘      │  │ subs  yes/no             │  │
│                           │  │ text  {on_screen_text}   │  │
│                           │  └──────────────────────────┘ │
├───────────────────────────┴──────────────────────────────┤
│  INTEREST  (theta/beta · live)   ← from WebSocket stream  │
│        ╭╮      ╭─╮            ╭╮                           │
│   ─────╯╰──────╯ ╰────╮   ╭──╯╰─────   spike = interest   │
│                       ╰───╯                               │
│        ▲hook          ▲drop          ▲CTA                 │
└──────────────────────────────────────────────────────────┘
```
- Waveform x-axis = `video_t_ms` (aligned to clip), y = `interest_score`. Auto-scale Y so spikes
  are always visible. Append samples as they arrive; keep a rolling window.
- Annotate the top spikes ("hook" / "CTA") — can be heuristic (local maxima), no model needed.

### Screen 2 — `/log`
```
┌──────────────────────────────────────────────────────────┐
│  Session log                               streaming ●    │
├──────────────────────────────────────────────────────────┤
│  ┌─ video 1 ─────────────────────────────────────────┐   │
│  │ [▣ thumb] {transcript_summary[title]}  {creator}   │   │
│  │ interest {avg interest_score}  ▮▮▮▮▮▮▮▮▯▯           │   │
│  │ ↳ {chat/decode output: why it spiked}              │   │  ← GPT-realtime
│  └────────────────────────────────────────────────────┘  │
│  ┌─ video 2 ─────────────────────────────────────────┐   │
│  │ [▣ thumb] ...   interest 0.34 ▮▮▮▯▯▯▯▯▯▯           │   │
│  │ ↳ Flat. Slow intro, no hook in first 3s.           │   │
│  └────────────────────────────────────────────────────┘  │
│  ...                                                       │
│  ┌─ ask ───────────────────────────────────────┐  [ ↑ ]  │
│  │ why did video 1 win?                          │         │
│  └───────────────────────────────────────────────┘         │
```
- Cards stream in as clips finish (artifact-style). Each card = one video's characteristics +
  avg interest + the LLM one-liner. The "ask" box → reply targeting a specific card.

### Screen 3 — `/report`
```
┌──────────────────────────────────────────────────────────┐
│  SESSION REPORT   ·  3 viewers · 50 clips · Tech UGC       │
├──────────────────────────────────────────────────────────┤
│  TOP PERFORMERS (by interest)                             │
│   1. {title}  {creator}   ▮▮▮▮▮▮▮▮▯  0.81                 │
│   2. ...                  ▮▮▮▮▮▮▮▯▯  0.74                 │
│   3. ...                  ▮▮▮▮▮▮▯▯▯  0.68                 │
│                                                           │
│  WHAT WINS                 WHO WINS                        │
│   ▸ hook in first 2s        ▸ {top creator} (avg 0.77)    │
│   ▸ 6–9 cuts                ▸ best format: fast talking-   │
│   ▸ bold on-screen text       head + captions             │
│   ▸ warm color palette                                    │
│                                                           │
│   →  Stop spraying and praying.   CPM ↓   CAC ↓           │
└──────────────────────────────────────────────────────────┘
```
- Pure summary view. Data can be **precomputed/fake** for the demo (this is the "scaled" story,
  not live). Make it look authoritative.

---

## 3. Interface with Devan (the contract — lock this FIRST)

Everything you build depends on these. Agree the shapes with Devan today, then build in parallel
against mocks.

### 3a. Video + characteristics — HTTP (Cloudflare → you)
`GET /api/videos` → array of:
```jsonc
{
  "video_id": "uuid",
  "url": "https://.../clip.mp4",
  "characteristics": {
    "audio": "music + VO",                 // short string
    "transcript_summary": "...",           // 1–3 lines (incl. a title you can show)
    // color_profile is NOT here — Holly extracts it client-side, keyed by video_id (see note below)
    "cut_count": 7,
    "on_screen_text": "you NEED this"
  },
  "metadata": {
    "duration_ms": 18000, "created_at": "2026-06-01",
    "creator": "@techbro", "likes": 124000, "shares": 8200
  }
}
```
> ✅ **DECIDED:** `color_profile` is YOUR output (§6 — you extract it) and stays **client-side,
> keyed by `video_id`**. You do NOT POST it back to Devan; his payload above may omit it. Keep a
> local `colorProfiles[video_id] -> string[]` map and merge at render time.

### 3b. EEG stream — WebSocket (Devan's Python server → you)
Connect to `ws://localhost:<port>`; receive a message per sample:
```jsonc
{ "session_id": "uuid", "video_id": "uuid", "video_t_ms": 4200,
  "theta_beta": 2.3, "interest_score": 0.81 }
```
> Confirm with Devan: **sample rate** (~Hz?), **port**, and whether `video_id`+`video_t_ms` are
> reliably set so you can align the waveform to the playing clip. Ask for a **mock stream** /
> recorded `.jsonl` so you can build before the headset works.

### 3c. Chat / decode — what you need from Devan
You own the OpenAI call + UI. From Devan you need the **decode semantics** for the system prompt:
> "A theta/beta spike means rising engagement; describe in plain language why this clip's
> hook/pacing/text drove interest." + per-video {characteristics + interest curve}.
Devan gives you the **interpretation rules**; you assemble the prompt + stream the reply into cards.

---

## 4. Build order (do it in this sequence)

1. **Lock §3 contracts with Devan** + get mock data (`videos.json`, a recorded EEG `.jsonl`).
2. Scaffold Next.js + Tailwind + shadcn; stub 3 routes.
3. **Screen 1 first** (the money shot): video player + uPlot waveform fed by the mock stream.
4. Color extraction script → cache `color_profile` per `video_id`; wire the color bar.
5. Screen 2: render cards from mock data; then wire the GPT-realtime chat one-liners.
6. Screen 3: static/precomputed report.
7. Swap mocks → live Cloudflare API + live WebSocket once Devan's ready.
8. **Rehearse the wrapper flow** (no typing) ≥3×.

---

## 5. Things that matter for YOU (don't get burned)

- **Build against mocks from hour 1.** Don't block on Devan's headset/API — agree the schema,
  mock it, integrate last.
- **Auto-scale the waveform Y-axis.** Raw theta/beta may look flat; scale so spikes pop on a
  projector. This is the single most-watched element on stage.
- **Screen 1 > Screen 2 > Screen 3** in priority. If time runs out, the chat (Screen 2's LLM
  one-liners) is the first thing to cut — the waveform + video must be flawless.
- **No typing on stage** — pre-load every input. Decide demo clip order in advance.
- **You demo the screens** on stage (Yuva narrates + judge interaction + sponsor-video beat, Devan
  walks the product). Know your click path cold. **You also deliver the Fiber closing beat (§7).**
- **`.gitignore` your keys** (`.env.local`: OpenAI **and** Fiber) — never commit them.

## 6. Open questions for Devan

- [ ] EEG WebSocket: port, sample rate, are `video_id`/`video_t_ms` set per sample?
- [ ] Can he give me a **recorded EEG `.jsonl`** + a `videos.json` mock today?
- [x] ~~`color_profile`~~ — DECIDED: client-side, keyed by `video_id` (Devan's payload omits it).
- [ ] Decode semantics for the chat system prompt — what does a theta/beta spike "mean"?

## 7. Fiber API / GTM closing beat (yours — bonus)

A ~15s closing beat you deliver: *"who do we sell this to? We used Fiber to pull the Heads of Growth
at UGC brands — that's our outbound list."* **Not a product feature** — one call, pulled offline,
shown on a slide. (Why not "recruit the creator": clips are founder-fronted, editors aren't in a
B2B DB. GTM is the only honest fit — see PRD §3.)

- **Endpoint:** `peopleSearch` (or `textToProfileSearch`) on `api.fiber.ai`; auth via `x-api-key` header.
- **Do it offline**, save the result to a JSON, render it on the slide. No live call needed on stage.
- **On stage:** flash the actual call for ~2s as proof you really used the sponsor.
- **Key:** `FIBER_API_KEY` in `.env.local` — never commit.
- **Cut first if the pitch runs long.**

```bash
# one-off, offline — confirm exact field names at api.fiber.ai/ai-docs/peopleSearch.md
curl -X POST https://api.fiber.ai/v1/peopleSearch \
  -H "x-api-key: $FIBER_API_KEY" -H "Content-Type: application/json" \
  -d '{"query":"Head of Growth at UGC / consumer marketing brands","limit":5}'
```
- [ ] Demo-day data: live capture vs pre-recorded? (affects whether I wire the live WS or replay)
