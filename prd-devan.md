# PRD — Devan · FlowState Testing (was "NeuroViral")

> **Updated 2026-06-27.** This supersedes the original team PRD. The project pivoted hard:
> from a staged "live EEG waveform" demo wrapper → a **real short-form research app** that
> captures rich interaction analytics and aligns EEG **post-hoc** by timestamps.
> Original team PRD (now stale): [Bobthe3/ychackaton626 · PRD.md](https://github.com/Bobthe3/ychackaton626/blob/main/PRD.md)

**Your role:** still model + backend — but you've also built the **whole app** (Expo frontend + local server + data pipeline). The original "Holly = frontend / Devan = backend" split has collapsed; see [§7 For Holly](#7-for-holly--what-changed-decide--communicate).

---

## 1. What changed vs the original PRD

| Dimension | Original PRD (NeuroViral) | Now (FlowState Testing) |
| --- | --- | --- |
| **Product** | 3 staged demo screens (live scroll / session log / report) | Real research app: access code → feed → complete, capturing analytics |
| **Brand** | NeuroViral | **FlowState Testing** (`FlowState-BCI` org) |
| **Frontend** | Next.js + TS + Tailwind + shadcn (Holly) | **Expo** (React Native + web), `expo-router`, `expo-video` (Devan built it) |
| **Backend** | Cloudflare Workers + D1 + R2 | **Local Node server** — Hono + SQLite (`better-sqlite3`) + on-disk video |
| **EEG** | Live OpenBCI/BrainFlow → theta/beta → **WebSocket** waveform | **Post-hoc join**: events carry `eegSyncId` + timestamps + `exposureId`; EEG recorded separately, aligned offline via CSV export |
| **Model** | Fine-tune / simulate video → waveform | Dropped (for now). Offline **video feature extraction** instead (palette/cuts/OCR/transcript) |
| **Chat decode** | OpenAI GPT-realtime "why did it win" | Not built. Analysis is offline metrics + CSV, not an LLM chat |
| **Deploy target** | Vercel + local Python box | **TestFlight** via EAS (iOS), web for fast iteration |
| **Schema contract** | §6 video payload + EEG WS sample | New: analytics event schema + 2 EEG-join export tables (see [§5](#5-the-data-contract-actual-schemas)) |

> ⚠️ **Decided 2026-06-27:** the team **still wants the flashy live-waveform / session-log /
> report screens for stage impact** — layered on/with the FlowState app. But the app no longer
> streams EEG live. Bridging that gap is the headline open item (see [§7](#7-for-holly--what-changed-decide--communicate)).

---

## 2. What's DONE (Devan) ✅

**App (Expo, `app/` + `components/` + `lib/`)**
- Flow: **access code (`index.tsx`) → feed (`feed.tsx`) → complete (`complete.tsx`)**.
  - Note: consent + demographics from the SPEC are **collapsed/stubbed** — `index.tsx` auto-submits defaults and jumps to the feed. The README's "5-screen flow ✅" is aspirational; current reality is 3 screens.
- **Paged looping feed** — `expo-video`, `viewabilityConfig` active-item, preload neighbors, loop events.
- **Action rail** — 👍 👎 🔖 ⋯ (`ActionRail.tsx`), metadata sheet (`OptionsSheet.tsx`).
- **Silent session timer** — background-tracked, never rendered; ends on timeout/manual/background.
- **Analytics logger** (`lib/events.ts`) — buffered + batched (5s / 5-event threshold), AsyncStorage-persisted, idempotent UUIDs, mock-mode console logging.
- **Runs fully in mock mode** with no backend (codes `DEMO`/`FLOW30`/`FLOW05`/`QUICK2`, bundled clips).

**Server (`server/`, Hono + SQLite)**
- Routes: `/api/code/validate`, `/api/session/start`, `/api/demographics`, `/api/playlist` (shuffled), `/api/events` (batch), `/api/session/end`, `/api/admin/export`.
- SQLite store with a D1-compatible surface (`db.ts`) — clean swap-back path to Cloudflare if needed.
- **Admin dashboard** at `/admin` (basic auth) + **CSV export** of raw and derived tables.
- **Derived metrics** (`metrics.ts`): by-content-type, by-video, retention curve, per-video-participant, **`per_exposure_participant`**, **`eeg_join_events`**.

**Data pipeline (`scripts/`, Python + Node)**
- `videos:select` — pick top-10/creator + 20 random from the IG scrape manifest, download.
- `videos:import` — symlink selected MP4s into the server catalog; adds codes `EEG30`/`EEG10`/`EEG05`; **withholds public performance labels** from the feed.
- `videos:analyze` — offline features per clip: **color palette, scene/cut detection, OCR overlay text, optional Whisper transcript** → `features.json` + `analysis-summary.csv` + palette PNGs.
- `gen-test-videos.py` — bundled placeholder countdown clips for mock mode.

**Build/deploy**
- `eas.json` + `app.json` configured; `build:ios:testflight` / `submit:ios:testflight` scripts ready (needs Apple Developer Program).

> Repo state: **almost everything is uncommitted** (git log = just "Add README"). First housekeeping: commit the working tree on a branch.

---

## 3. The EEG approach now (the important pivot)

There is **no live EEG stream**. Instead the app makes every session **joinable to a separately
recorded EEG track**:

- Each session mints an **`eegSyncId`** (stable join key) alongside `sessionId`.
- Every event carries `clientEpochMs`, `clientTimezoneOffsetMin`, `sessionElapsedMs`,
  `sessionStartedAtIso`, `activeExposureId`, `activeVideoElapsedMs`, `feedPosition`, `videoId`.
- Each **exposure** (participant × one video view) gets a unique `exposureId` with start/end offsets.
- Post-session you export and join the EEG recording (recorded on its own clock) to the events by
  `eegSyncId` + wall-clock epoch, then slice per `exposureId`.

**Two export tables for EEG work** (`/api/admin/export?table=…`):
- `eeg_join_events` — flat per-event stream: `eeg_sync_id, exposure_id, video_id, slug, content_type, event_type, client_epoch_ms, session_elapsed_ms, position_ms, dwell_ms, watch_ms, pct_watched, loops, payload`.
- `per_exposure_participant` — one row per exposure: `eeg_sync_id, exposure_id, video_id, slug, content_type, exposure_start_s, exposure_end_s, exposure_end_epoch_ms, dwell_ms, watch_ms, pct_watched, max_position_ms, loops, final_thumb, saved`.

This is **research-grade and demo-safe** (nothing to break live on stage), but it does **not by
itself produce a live-looking waveform** — that's the gap for the demo screens ([§7](#7-for-holly--what-changed-decide--communicate)).

---

## 4. Architecture now

```
Expo app (iOS / web)                       Local Node server (localhost:8787)
  app/  index → feed → complete              Hono + better-sqlite3
  components/ VideoFeedItem · ActionRail       /api/code/validate · session/start
  lib/  session · events · api · catalog       /api/playlist (shuffled, seed)
        ↓ batched events (HTTP)                /api/events (batch ingest)
        EXPO_PUBLIC_API_BASE ─────────────►    /api/session/end
                                               /admin  + /api/admin/export (CSV)
                                               server/data/flowstate.sqlite

EEG headset ──(recorded separately, own clock)──► join offline by eegSyncId + epoch
Python pipeline: select → download → import (catalog) → analyze (palette/cuts/OCR/transcript)
```

**Merge discipline:** branch your uncommitted work (`devan-app` or similar) → PR into `main`.
Decide file-ownership boundaries with Holly *before* she touches the repo ([§7](#7-for-holly--what-changed-decide--communicate)).

---

## 5. The data contract (actual schemas)

These replace the original §6 contract. **Lock with Holly before she builds against them.**

**Video / playlist item** (`lib/types.ts` `Video`; `/api/playlist`):
```ts
{ id, slug, title, source: string|number, durationSeconds, contentType }
```

**Session** (`SessionRecord`): `{ id, participantId, accessCode, condition, playlistSeed, eegSyncId, startedAt, endsAt }`

**Analytics event** (`AnalyticsEvent`): `{ id, sessionId, participantId, videoId, eventType, feedPosition, clientTs, payload }`
with `payload` always carrying the EEG-join fields from [§3](#3-the-eeg-approach-now-the-important-pivot).

**Event types:** `session_start/end`, `video_impression`, `video_play_start`, `video_watch_progress`, `video_loop`, `video_exposure_end`, `scroll_away`, `thumbs_up(_removed)`, `thumbs_down(_removed)`, `save/unsave`, `options_open`, `pause/resume/seek`, `mute_toggle`, `feed_recycled`, `feedback_prompt/response`, `app_background/foreground`.

> There is **no `contracts/` folder and no JSON-schema files** anymore — the contract lives in
> `lib/types.ts` + `server/schema.sql`. If Holly builds a separate app, extract these into a
> shared package or a copied types file.

---

## 6. What's LEFT for Devan (TODO)

- [ ] **Commit the working tree** on a branch + push (everything is currently untracked).
- [ ] **Reconcile README/SPEC with reality** — README claims Cloudflare *and* local server, and "5-screen flow built" when it's 3. Pick one source of truth.
- [ ] **EEG capture-side**: confirm the actual headset recording tool + clock, and verify the join works end-to-end on one real recording (the `eegSyncId` + epoch join is untested against a real EEG file).
- [ ] **Lock the final stimulus set** (single Tech-UGC sub-niche) and run `videos:analyze` on all.
- [ ] **Decide the live-demo-screen data source** with Holly ([§7](#7-for-holly--what-changed-decide--communicate)) and build the replay/export feed it needs.
- [ ] **(If chat/score still wanted)** supply decode semantics + a virality/interest score derived from analytics (+EEG) for the report screen.
- [ ] TestFlight: Apple Developer Program + `eas build`/`submit` dry run.

---

## 7. For Holly — what changed, decide & communicate

> **First: confirm Holly's current scope** (this wasn't settled). The original split (she owns
> frontend) is obsolete since the Expo app is built. Most likely she now owns the **live-demo /
> presentation screens** — this section assumes that. Confirm before she writes code.

**Tell her (deltas that break her old assumptions):**
1. **Stack changed: Next.js → Expo.** Any Next.js work from the old PRD doesn't plug in directly. Decide: does she build the demo screens **as web routes in this Expo app**, or a **separate small web app** that reads the server's API/exports?
2. **Backend changed: Cloudflare → local Node server** at `http://localhost:8787`. On stage everything runs **local on the demo machine**. Her screens read the same server (`/api/playlist`, `/admin` exports) — no Cloudflare URLs.
3. **EEG is no longer a live WebSocket.** The original "live waveform from a socket" doesn't exist. Since we still want the live-looking screens, we must drive them by **replaying a recorded session** (events + an aligned EEG track) in *apparent* real-time — exactly the "wrapper / pre-recorded" safe default. **Devan to provide a replay feed/export; Holly renders the waveform from it.**
4. **Schema moved.** No `contracts/*.json`. The real shapes are in `lib/types.ts` + the two EEG-join export tables ([§5](#5-the-data-contract-actual-schemas)). We'll extract a shared types file if she's in a separate app.
5. **Brand is FlowState Testing**, not NeuroViral — agree which name is on stage.
6. **OpenAI chat decode + virality score are not built.** If the report/"why did video 1 win" screen still needs them, that's net-new: Devan supplies the score + decode semantics, Holly wires the LLM.

**Decisions to make together (blockers for her):**
- [ ] Holly's scope: demo/presentation screens only? (confirm)
- [ ] Demo screens in **this Expo repo (web routes)** vs **separate app**? → sets file ownership + how she gets data.
- [ ] Live-demo data source: **replay recorded session** (recommended, safe) vs attempt a true live feed.
- [ ] Keep the **chat + virality score** in the demo, or cut it to offline metrics/report only?
- [ ] Which **brand name** on stage.

---

## 8. Open questions / TBDs

- [ ] Holly's role + repo arrangement (above).
- [ ] Real EEG recording tool + verified end-to-end join on one session.
- [ ] Final stimulus list locked (single Tech-UGC sub-niche).
- [ ] Live-waveform screens: replay vs live; who builds them.
- [ ] Demo runs against **local server on the demo machine** — confirm machine + network plan.
- [ ] Apple Developer Program enrollment (only hard $ cost) — needed for TestFlight.

---

## 9. Risks

| Risk | Mitigation |
| --- | --- |
| **Live-demo screens have no live data source** (the pivot's main gap) | Drive them by replaying a recorded session in apparent real-time; build the replay export early |
| Everything uncommitted → loss / merge chaos with Holly | Commit + branch now; agree file ownership before she touches the repo |
| EEG join untested against a real recording | Do one real end-to-end record+join dry run before the hackathon |
| README/SPEC contradict the code (Cloudflare vs local, 3 vs 5 screens) | Pick one source of truth; update both |
| TestFlight blocked on Apple enrollment | Demo on **web** (fast path) + local server; treat iOS build as bonus |
| Headset jitters live | Nothing streams live now — pre-recorded replay is the default; lowest-risk part of the demo |
