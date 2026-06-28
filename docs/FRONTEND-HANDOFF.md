# Frontend Handoff — Brainwave UI + Video Feed

> **Audience:** the frontend team picking up the live-demo / presentation screens.
> **Goal:** give you everything needed to (1) render the **brainwave (interest) UI** and
> (2) understand **how videos get pulled in** (the "Cloudflare" path) — without reading the
> whole codebase.
>
> Two things to know up front:
> 1. **The frontend never talks to Cloudflare directly.** It fetches a playlist, gets a
>    `url` per video, and plays it. Whether that URL resolves to the local dev server or a
>    Cloudflare R2/CDN bucket is a *backend* swap that does **not** change your code.
> 2. **The live brainwave waveform UI does not exist yet — it is greenfield (your build).**
>    What exists is the *data contract* you bind to. The EEG **capture internals** (device,
>    electrode method) are intentionally **not in this repo**; see
>    [§B.5](#b5-where-the-capture-internals-live) for how to get them.

---

## Part A — The video feed (the "Cloudflare" pipeline)

### A.1 The one diagram

```
Instagram / TikTok           scripts/ (Node + Python, run by backend, not the app)
  source URLs   ──►  download-selected-videos.mjs (yt-dlp)
                       │   files: selected-downloads/<creator>/<id>.mp4
                       ▼
                     import-selected-videos-to-feed.py
                       │   flat copy: server/data/stimulus-videos/<id>.mp4
                       │   INSERT row into SQLite `videos` (r2_key = "<id>.mp4")
                       ▼
   ┌─────────────────────────────────────────────────────────────────────┐
   │  API server (Hono + SQLite)                                           │
   │    GET /api/playlist?seed=…   →  [{ id, slug, title, url, source,     │
   │                                     durationSeconds, contentType }]   │
   │    GET /video/:key            →  streams the MP4 (HTTP Range support)  │
   └─────────────────────────────────────────────────────────────────────┘
                       │   url = `${serverOrigin}/video/${r2_key}`
                       ▼
   lib/api.ts  getPlaylist()  ──►  app/feed.tsx  <FlatList> ──►
   components/VideoFeedItem.tsx  useVideoPlayer(video.source)  (expo-video)
```

**The frontend's whole job in this picture is the bottom two rows.** You call
`api.getPlaylist(seed)`, you get back `Video[]`, you feed `video.source` (a URL string)
into `expo-video`. Done.

### A.2 Where "Cloudflare" actually is

This project started on **Cloudflare** (Workers + D1 + R2) and was ported to a **local
Node server** for the hackathon. The Cloudflare design is the *production target*; the
local server is a drop-in stand-in. **Neither affects the frontend contract.**

| Concern | Original / production (Cloudflare) | Current (local dev) |
|---|---|---|
| Video storage | **Cloudflare R2** bucket (free egress — the cost that bites for looping video) | local disk: `server/data/stimulus-videos/` (or `assets/videos/`) |
| Video URL | R2 / CDN URL stored in `videos.url` | `${serverOrigin}/video/<key>` streamed by the server |
| DB | Cloudflare **D1** | SQLite file (`server/data/flowstate.sqlite`) |
| API | Cloudflare **Workers** | Hono on Node (`@hono/node-server`) |

Legacy breadcrumbs you'll see in code (all harmless): the `videos` column is still named
**`r2_key`** (it now holds a local filename), and `server/src/db.ts` keeps a
"**D1-compatible surface**" so the backend can swap back to Cloudflare cleanly.
See `server/src/app.ts:1-8`, `server/schema.sql` (videos table), `server/seed.sql`.

**What changes for you the day this moves to Cloudflare R2:** nothing in the player. The
`url` field in the playlist response simply starts with `https://<bucket>.r2.dev/…` (or a
CDN domain) instead of `http://localhost:8787/video/…`. Same JSON shape, same `expo-video`
call. Build against the contract, not the host.

### A.3 The contract you bind to

**`GET /api/playlist?seed=<seed>`** → returns a JSON array. Each item (`lib/types.ts`
`Video`, served by `server/src/app.ts:118-131`):

```ts
{
  id: string,
  slug: string,
  title: string,
  url: string,            // server-side field — the playable URL
  source: string | number,// CLIENT field you use: URL string (real) or require() (mock)
  durationSeconds: number,
  contentType: string     // "instagram_reel" | "tiktok_video" | "counting_a" | … (the comparison dimension)
}
```

- **The field you render is `video.source`.** `lib/api.ts:89-99` maps the server's `url`
  onto `source` for you (`source: r.source ?? r.url`).
- The server **shuffles deterministically by `seed`** — pass the session's
  `playlistSeed` and you reproduce the same order. (`shuffleWithSeed`, FNV-1a → Mulberry32.)
- Player: **`expo-video`** (not `expo-av`). See `components/VideoFeedItem.tsx:8-30`:
  ```tsx
  import { useVideoPlayer, VideoView } from 'expo-video';
  const player = useVideoPlayer(video.source, (p) => { p.loop = true; p.muted = muted; });
  // <VideoView player={player} contentFit="cover" nativeControls={false} />
  ```
- The streaming route `GET /video/:key` supports **HTTP Range** requests, so scrubbing /
  seeking work (`server/src/app.ts` ~172-223).

### A.4 Running it locally

```bash
# 1. App (Expo)
npm install
npm run web        # fastest iteration

# 2. (Optional) the API server — without it, the app runs in MOCK mode
npm run server:install
npm run server     # defaults to http://localhost:8787
```

- **Point the app at the server** with `EXPO_PUBLIC_API_BASE` in `.env.local`
  (e.g. `http://localhost:8787`; on a physical device use your machine's LAN IP).
  `.env.example` documents it.
- **Mock mode (default, no backend):** leave `EXPO_PUBLIC_API_BASE` unset. The app
  self-serves bundled countdown clips from `assets/videos/` via `lib/catalog.ts`
  (`MOCK_CATALOG`), access codes `DEMO` / `FLOW30` / `FLOW05` / `QUICK2`, events logged to
  console. **You can build and test the whole feed UI with zero backend.**
- **The EEG content study** runs the server on a custom port/dir
  (`VIDEOS_DIR=… PORT=8788`) pointing at the stimulus set — confirm the exact
  `EXPO_PUBLIC_API_BASE` with backend before a study session, since it differs from the
  8787 default.

---

## Part B — The brainwave (interest) UI

### B.1 What exists vs. what's greenfield

| Piece | Status |
|---|---|
| Per-session **sync plumbing** — `eegSyncId`, high-res timestamps on every event | ✅ built (`lib/session.tsx`, `lib/events.ts`, `lib/clock.ts`) |
| Server **export tables** for offline EEG join (`eeg_join_events`, `per_exposure_participant`) | ✅ built (`server/src/metrics.ts`) |
| Live **interest stream** served on `localhost` by the capture tool | ✅ built (local-only, see §B.5) |
| **Waveform UI component** (render interest over time) | 🌱 **greenfield — your build** |
| **Demo screens** (live scroll + session log + report) | 🌱 **greenfield — your build** |
| **Replay driver** (drive the demo from a recorded session) | 🌱 **greenfield — your build** |

> **Important context (the pivot):** the app no longer streams EEG live into the research
> flow. EEG is recorded **separately** and joined to the app's events **offline** by
> `eegSyncId` + wall-clock epoch. For the **stage demo**, the recommended approach is to
> **replay a recorded session in apparent real-time** (lowest risk — nothing live to break).
> See `prd-devan.md` §3 & §7.

### B.2 Two ways to feed the waveform UI

You have two data sources. Pick per screen:

**(1) Live stream — for a real-time-looking demo.** The local capture tool exposes a
**Server-Sent Events** endpoint. Subscribe with `EventSource` and render each `tick`:

```
GET  http://localhost:8090/stream      (text/event-stream, ~10 Hz)
```

Each SSE message is JSON:

```jsonc
{
  "connected": true,
  "eeg_sync_id": "…",            // matches the app session's eegSyncId
  "recording_path": "…",
  "samples_written": 12345,
  "started_at_unix_ms": 0,
  "tick": {
    "ts": 0,                      // unix ms of the latest sample
    "interest": 0.0,              // ► PRIMARY: smoothed interest, 0.0–1.0  (render this)
    "quality": {                  // per-channel signal quality, each 0.0–1.0 (good for a "signal OK?" badge)
      "ch1": 0.0, "ch2": 0.0, "ch3": 0.0, "ch4": 0.0
    },
    "ratio": 0.0,                 // raw debug fields — derivation is documented locally (§B.5),
    "theta": 0.0,                 //   not needed to render the UI. Treat as opaque numbers if shown.
    "beta":  0.0
  }
}
```

Companion endpoints on the same `:8090` server: `GET /health` (one-shot snapshot of the
same state), `GET /download` (the raw recording CSV), `GET /download-meta` (its sidecar).

> **Bind to `tick.interest` (0–1).** That's the headline trace. `quality.*` is for a
> "leads connected?" indicator. `ratio/theta/beta` are raw readouts — show them only if you
> want a nerdy secondary panel; their meaning/derivation lives in the local notes (§B.5).
> The interest value here is a **provisional/demo readout** — the research-grade interest
> comes from the offline join below.

**(2) Offline join output — the research-grade / replay source.** After a session, the EEG
recording is joined to the app events offline, producing a clean **per-exposure** and
**per-window** interest series. This is what a *replay* demo should play back, and what the
"report" screen should chart:

- **Per-window** (the waveform): `interest_0_1` sampled at a fixed cadence with
  `exposure_id, t, coverage, quality` — i.e. an interest curve you can scrub alongside the
  video timeline.
- **Per-exposure** (one row per video view): `interest_0_1` plus
  `theta_power, beta_power, theta_beta_ratio, eeg_coverage_frac, n_windows,
  mean_channel_quality, dwell_ms, watch_ms, pct_watched`.

These come from the offline join script (local-only, §B.5) and from the server's export
tables (§B.4).

### B.3 The sync plumbing already in the app

You don't have to build this — just know it's there and how to line a waveform up with a
video:

- **`eegSyncId`** is minted once per session (`lib/session.tsx`, `randomUUID()`), stored on
  the `SessionRecord`, and sent on `session_start`. It's the join key to a recording.
- **Every analytics event** carries (in its `payload`, via `lib/events.ts`):
  `clientEpochMs` (wall-clock ms), `clientMonoMs` / `sessionElapsedMonoMs` (high-res
  monotonic), `sessionElapsedMs`, `sessionStartedAtIso`, `eegSyncId`,
  `activeExposureId` (the current video-view id), `activeVideoElapsedMs` (playback position).
- **`lib/clock.ts`** provides a sub-millisecond monotonic timeline (`TIME_ORIGIN` +
  `monoNow()`) so the app clock and the EEG clock can be aligned post-hoc.
- Each **exposure** (one participant × one video view) has a unique `exposureId` — that's
  the unit you slice the interest curve by.

So to overlay a waveform on a given video in a replay: take the exposure's
`interest_0_1[t]` series and align `t=0` to that exposure's start.

### B.4 Server export tables (for the report / replay data)

`GET /api/admin/export?table=<name>` (admin-auth) — defined in `server/src/metrics.ts`:

- **`per_exposure_participant`** — one row per video view: `eeg_sync_id, exposure_id,
  session_id, participant_id, video_id, slug, content_type, feed_position,
  exposure_start_epoch_ms, exposure_end_epoch_ms, dwell_ms, watch_ms, pct_watched,
  max_position_ms, loops, final_thumb, saved`.
- **`eeg_join_events`** — flat per-event firehose: `eeg_sync_id, exposure_id, video_id,
  slug, content_type, event_type, client_epoch_ms, session_elapsed_ms, position_ms,
  dwell_ms, watch_ms, pct_watched, loops, payload`.

(`README.md` "EEG content study workflow" shows the `curl` export commands.)

### B.5 Where the capture internals live

The **EEG device, electrode method, and the live-stream server's source** are kept in the
git-ignored `hardware/` folder and are **not pushed to this repo** (deliberate — see
`hardware/README.md`). For the brainwave UI you do **not** need them; you bind to the
contract in §B.2.

If you want the full capture picture (how to start the live stream locally, the device
specifics, the signal derivation, and how to run a replay), ask the backend/hardware owner
for **`hardware/FRONTEND-EEG-NOTES.md`** (local-only companion to this doc). It's shared
out-of-band, not via GitHub.

### B.6 What to actually build (suggested)

1. **`useInterestStream()` hook** — wraps `EventSource('http://<host>:8090/stream')`,
   exposes `{ connected, interest, quality, history[] }`; keeps a rolling buffer of recent
   `tick.interest` values for the trace.
2. **`<InterestWaveform>`** — Canvas or SVG line of `interest` (0–1) over time, with a
   "signal OK" badge driven by `quality.*`. (The local capture tool's `index.html` is a
   working vanilla-JS Canvas reference — ask for it via §B.5.)
3. **Replay driver** — instead of (or behind the same interface as) the live hook, read a
   recorded session's per-window `interest_0_1` series and emit it in apparent real-time,
   synced to video playback position. **This is the recommended demo path.**
4. **Demo screens** — live scroll view, session log, and the "why did this win" report
   (charts the per-exposure interest + engagement). Confirm scope/ownership first (below).

---

## Open decisions (confirm before building)

From `prd-devan.md` §7 — settle these with the team first:

- [ ] Demo screens **inside this Expo app (web routes)** vs. a **separate web app**?
      (Sets where this code lives and how it reads data.)
- [ ] Live-demo data source: **replay a recorded session** (recommended, safe) vs. attempt
      a true live `/stream` feed on stage.
- [ ] Is the "report / virality score" screen in scope? (The score model is separate — see
      `docs/model/`.)
- [ ] Confirm the study-session `EXPO_PUBLIC_API_BASE` (port differs from the 8787 default).

---

## File map (quick reference)

| Need | File |
|---|---|
| Video type / contract | `lib/types.ts` (`Video`, `SessionRecord`, `AnalyticsEvent`) |
| Fetch playlist (mock fallback) | `lib/api.ts:89-99` |
| Playlist + video-stream routes | `server/src/app.ts:118-131` (playlist), ~172-223 (`/video/:key`) |
| DB schema (`videos.r2_key`) | `server/schema.sql`, `server/seed.sql` |
| Video player | `components/VideoFeedItem.tsx` |
| Feed list / paging / B2B interleave | `app/feed.tsx` |
| Mock catalog | `lib/catalog.ts` |
| Session + `eegSyncId` | `lib/session.tsx` |
| Event logger (EEG-sync fields) | `lib/events.ts` |
| High-res clock | `lib/clock.ts` |
| EEG export tables | `server/src/metrics.ts` |
| EEG capture internals (live waveform source) | **local-only** — `hardware/FRONTEND-EEG-NOTES.md` (§B.5) |
