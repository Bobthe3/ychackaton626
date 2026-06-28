# FlowState Testing — Product & Technical Spec

> **App display name:** FlowState Testing
> **Repo:** new standalone repo under the `FlowState-BCI` org (local dir slug `feed-study`)
> **Status:** Spec / wireframe draft — decisions finalized, ready to scaffold
> **Owner:** Devan
> **Last updated:** 2026-06-19

An internal FlowState research app that observes **retention and engagement across
different kinds of short-form media**. It presents a Reels-style looping video feed
gated behind an access code + consent + demographics, runs a timed session, and
captures rich interaction analytics for post-hoc analysis (CSV export).

---

## 1. Decisions locked

| Pillar | Decision | Why |
|---|---|---|
| Deliverable (this pass) | Spec + wireframes | Greenlight, then scaffold |
| Stack | **Expo** (React Native + `react-native-web`) | One React codebase → iOS (TestFlight via EAS), Android, Web |
| Compliance | **Demo-grade privacy** | Minimal PII, consent + encryption now; defer formal BAAs until real PHI |
| Video hosting | **Cloudflare R2** | 10 GB free storage + **free egress** (the cost that bites for looping video) |
| Analytics + forms | **Cloudflare D1** (SQLite) | 5 GB free; single-vendor; SQL → CSV export |
| API | **Cloudflare Workers** | 100k req/day free; validates codes, ingests events |

Everything sits in **one Cloudflare account at $0**. Only hard cost is the **Apple
Developer Program ($99/yr)** required for TestFlight.

---

## 2. User flow

```
Access code  →  Consent  →  Demographics  →  ── Feed (timed session) ──  →  Session complete
  (validate)    (18+,      (HIPAA-conscious,    autoplay/loop video,         (locks feed,
                 research    research data)       👍 👎 🔖 ⋯ , swipe          shows summary)
                 disclosure)                      vertical paging)
```

- A valid **access code** starts a session of N minutes (default 30, set per code).
- Every participant sees the **full content pool in randomized order** (shuffled per
  session). Randomization controls for order effects; **`content_type` is the comparison
  dimension** — which *kind* of media retains best.
- The session timer runs **silently in the background** — no visible countdown, so the
  clock can't bias engagement. When it hits 0 (or the user backgrounds past a grace
  window), the feed locks and the session ends.

---

## 3. Wireframes

### 3.1 Access code
```
┌─────────────────────────────┐
│                             │
│         ◆ FlowState         │
│           Testing           │
│                             │
│    Enter your access code   │
│    ┌───────────────────┐    │
│    │  _ _ _ _ _ _      │    │
│    └───────────────────┘    │
│                             │
│    ┌───────────────────┐    │
│    │      Continue     │    │
│    └───────────────────┘    │
│                             │
│   Invalid code? Contact…    │
└─────────────────────────────┘
```

### 3.2 Consent (research disclosure)
```
┌─────────────────────────────┐
│  ← Consent                  │
│                             │
│  Research Participation     │
│                             │
│  You're taking part in a    │
│  FlowState study on how     │
│  people engage with short   │
│  video. We record in-app    │
│  interactions (watch time,  │
│  taps, ratings). No camera, │
│  mic, or contacts accessed. │
│                             │
│  [ Privacy details ▸ ]      │
│                             │
│  ☐ I am 18+ and consent     │
│                             │
│  ┌───────────────────┐      │
│  │     I Agree       │      │
│  └───────────────────┘      │
│  ┌───────────────────┐      │
│  │     Decline       │      │
│  └───────────────────┘      │
└─────────────────────────────┘
```

### 3.3 Demographics (HIPAA-conscious — research data, minimal identifiers)
```
┌─────────────────────────────┐
│  ← About you      (1 of 1)  │
│                             │
│  Age range                  │
│  ( ) 18–24   ( ) 25–34      │
│  ( ) 35–44   ( ) 45–54      │
│  ( ) 55+                    │
│                             │
│  Sex assigned at birth      │
│  ( ) Female  ( ) Male       │
│  ( ) Intersex ( ) Prefer NA │
│                             │
│  Gender identity            │
│  [ dropdown ▾ ]             │
│                             │
│  Daily short-video use      │
│  ( ) <30m  ( ) 30m–1h       │
│  ( ) 1–3h  ( ) 3h+          │
│                             │
│  ┌───────────────────┐      │
│  │   Start session   │      │
│  └───────────────────┘      │
└─────────────────────────────┘
```

### 3.4 Feed (main viewer)
```
┌─────────────────────────────┐
│ ●         Feed        🔇    │  ← mute (right)
│                             │
│                             │
│                             │
│          [ VIDEO ]          │
│        autoplay · loop      │
│                          ┌──┤
│                          │👍│  thumbs up   (state-toggling)
│                          │  │
│                          │👎│  thumbs down
│                          │  │
│                          │🔖│  save
│                          │  │
│                          │ ⋯│  options
│                          └──┤
│  @clip_03 · counting v2     │  ← caption / content label - optional 
│  ▁▁▁▂▃▅▇  progress          │
└─────────────────────────────┘
   swipe ↑ next   ·   swipe ↓ prev
   tap = pause/play
```

### 3.5 Session complete

```
┌─────────────────────────────┐
│                             │
│            ✓                │
│                             │
│      Session complete       │
│                             │
│   Thanks for participating. │
│   Your responses have been  │
│   recorded.                 │
│                             │
│   Videos viewed:       24   │
│   Time in feed:    30m 00s  │
│                             │
│    ┌───────────────────┐    │
│    │      Close        │    │
│    └───────────────────┘    │
└─────────────────────────────┘
```

### 3.6 Options (⋯) — video metadata sheet

Tapping ⋯ opens a bottom sheet with more detail about the current clip — **metadata
only**, no actions that leave the feed:

```
┌─────────────────────────────┐
│            ──⋯──            │
│                             │
│  Counting v2                │
│                             │
│  Type        counting       │
│  Length      0:32           │
│  Clip ID     clip_03        │
│  Position    #7 in feed     │
│                             │
│    ┌───────────────────┐    │
│    │      Close        │    │
│    └───────────────────┘    │
└─────────────────────────────┘
```

---

## 4. The feed viewer (native-feeling behavior)

Built as a **vertically-paged list**, one video per full screen, snap scrolling.

- **List:** `FlatList` with `pagingEnabled` + `snapToInterval = screenHeight`
  (or `@shopify/flash-list` for smoother recycling at scale).
- **Player:** `expo-video` (`useVideoPlayer`), the current recommended API
  (replaces the deprecated `expo-av` `Video`).
- **Active-item logic:** `viewabilityConfig` (`itemVisiblePercentThreshold: 80`)
  determines the single active index → it plays + loops; all others pause + reset to 0.
- **Preloading:** keep players for `[active-1, active, active+1]` mounted so the
  next swipe is instant. Render window via `windowSize` / `maxToRenderPerBatch`.
- **Looping:** `player.loop = true`; each loop boundary fires a `video_loop` event.
- **Gestures:** swipe = page; single tap = pause/play; the right rail handles
  👍 👎 🔖 ⋯ (mutually-exclusive thumbs, toggleable).
- **Feed order:** the pool is **shuffled per session** — the Worker returns a randomized
  order plus a `playlist_seed`; the realized order is also recoverable from
  `video_impression.feed_position`.
- **Silent timer:** the session countdown is tracked but **never rendered** — no on-screen
  clock to bias watch behavior.

**Reference pattern to adapt:** the canonical Expo "vertical video feed / Reels clone"
is `FlatList(pagingEnabled) + viewabilityConfig + expo-video`. Several open-source
TikTok/Reels clones implement exactly this — I'll vet specific repos for license +
freshness during the build phase rather than commit to one here.

---

## 5. Analytics — the core of the study

Every interaction is an **event** with a client-generated UUID (idempotency), a client
timestamp, and a server-assigned timestamp. Events are **buffered locally** and flushed
in **batches** (every ~10s, on every scroll, and on background) so a dropped network
never loses data.

### 5.1 Event catalog

| Event | Fires when | Key payload |
|---|---|---|
| `session_start` / `session_end` | session lifecycle | duration, end_reason |
| `video_impression` | item becomes the active/visible card | video_id, feed_position |
| `video_play_start` | first frame renders / playback begins | startup_ms (time-to-first-frame) |
| `video_watch_progress` | heartbeat while active | position_ms, cumulative_watch_ms |
| `video_loop` | a loop completes (replay) | loop_count |
| `scroll_away` | user swipes off the card | **dwell_ms**, watch_ms, pct_watched, loops |
| `thumbs_up` / `thumbs_up_removed` | rating toggled | — |
| `thumbs_down` / `thumbs_down_removed` | rating toggled | — |
| `save` / `unsave` | save toggled | — |
| `options_open` | ⋯ metadata sheet opened | video_id |
| `pause` / `resume` / `seek` | playback control | position_ms |
| `mute_toggle` | sound on/off | muted |
| `app_background` / `app_foreground` | engagement interruption | — |

> **"Click-off time"** = `dwell_ms` on `scroll_away` (how long they stayed before
> leaving). **"Viewing time"** = cumulative `watch_ms` (counts loops/replays).

### 5.2 Derived metrics (what you analyze)

- **Per (participant × video):** total watch time, dwell time, completion %,
  loop/replay count, time-to-first-interaction, final rating, saved?
- **Per session:** videos viewed, avg dwell, scroll velocity, **retention curve**
  (position in feed vs. time → where engagement drops), session completion %.
- **Per content condition:** compare watch time / dwell / save-rate / 👍:👎 ratio
  **across media types** — the headline research output.

---

## 6. Data model (Cloudflare D1 / SQLite)

```sql
-- Access codes: gate entry, set session length + study arm
CREATE TABLE access_codes (
  code                TEXT PRIMARY KEY,
  label               TEXT,
  condition           TEXT,                 -- reserved for future A/B arms; default = full pool
  session_minutes     INTEGER NOT NULL DEFAULT 30,
  max_uses            INTEGER,              -- NULL = unlimited
  uses_count          INTEGER NOT NULL DEFAULT 0,
  active              INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL,
  expires_at          TEXT
);

-- One row per app open with a valid code
CREATE TABLE participants (
  id                  TEXT PRIMARY KEY,     -- client UUID
  access_code         TEXT REFERENCES access_codes(code),
  platform            TEXT,                 -- ios | android | web
  app_version         TEXT,
  created_at          TEXT NOT NULL
);

-- Demographics (research data; no direct identifiers stored)
CREATE TABLE demographics (
  participant_id      TEXT PRIMARY KEY REFERENCES participants(id),
  age_band            TEXT,
  sex_at_birth        TEXT,
  gender_identity     TEXT,
  daily_shortform_use TEXT,
  consent_18plus      INTEGER NOT NULL,
  consented_at        TEXT NOT NULL,
  submitted_at        TEXT NOT NULL
);

-- Timed viewing session
CREATE TABLE sessions (
  id                  TEXT PRIMARY KEY,     -- client UUID
  participant_id      TEXT REFERENCES participants(id),
  access_code         TEXT,
  condition           TEXT,                 -- nullable; default = full pool
  playlist_seed       TEXT,                 -- RNG seed → reproduces the shuffled order
  started_at          TEXT NOT NULL,
  ends_at             TEXT NOT NULL,        -- started + session_minutes
  ended_at            TEXT,
  end_reason          TEXT                  -- timeout | manual | background
);

-- Video catalog (served from R2)
CREATE TABLE videos (
  id                  TEXT PRIMARY KEY,
  slug                TEXT UNIQUE,
  title               TEXT,
  url                 TEXT NOT NULL,        -- R2 / CDN URL
  duration_seconds    REAL,
  content_type        TEXT,                 -- the "kind of media" dimension
  condition           TEXT,                 -- which arm(s) include it
  sort_order          INTEGER             -- optional anchor; default feed is shuffled per session
);

-- Append-only event log (the analytics firehose)
CREATE TABLE events (
  id                  TEXT PRIMARY KEY,     -- client UUID (idempotency)
  session_id          TEXT REFERENCES sessions(id),
  participant_id      TEXT,
  video_id            TEXT,
  event_type          TEXT NOT NULL,
  feed_position       INTEGER,
  client_ts           TEXT NOT NULL,
  server_ts           TEXT NOT NULL,
  payload             TEXT                  -- JSON blob (dwell_ms, watch_ms, …)
);
CREATE INDEX idx_events_session ON events(session_id);
CREATE INDEX idx_events_video   ON events(video_id);
```

**CSV export:** `wrangler d1 export` or a protected Worker route that runs a
`SELECT … JOIN` and streams CSV.

---

## 7. API (Cloudflare Workers)

| Route | Method | Purpose |
|---|---|---|
| `/api/code/validate` | POST | Validate code, return `{ ok, session_minutes, condition }` |
| `/api/session/start` | POST | Create participant + session, return session_id + `ends_at` |
| `/api/demographics` | POST | Store consent + demographics |
| `/api/playlist` | GET | Return the full pool **shuffled** for this session; records `playlist_seed` |
| `/api/events` | POST | Batch-ingest events (array) |
| `/api/session/end` | POST | Close session with end_reason |
| `/api/admin/export` | GET | (protected) CSV export |

All over HTTPS; Worker validates the access code on session start; events authorized
by an opaque session token issued at start.

---

## 8. Privacy posture (demo-grade)

- **No camera / mic / contacts / location** — only in-app interaction telemetry.
- **Minimal identifiers** — participant is a UUID + access code; no name/email stored.
- **In transit:** HTTPS everywhere. **At rest:** Cloudflare-managed encryption.
- **Consent gate** before any data is collected; explicit 18+ check.
- **Deferred for real PHI:** signed BAAs (Cloudflare, Apple), audit logging, RBAC,
  data-retention policy. Flagged here so the upgrade path is known, not forgotten.

---

## 9. Content plan

- **Pilot content:** simple "counting 1→4" clips in **3 variations** (different pacing /
  style) as distinct `content_type`s, 30s–2min, encoded as web-friendly **MP4 (H.264)**,
  uploaded to R2. Loop seamlessly.
- **Real content:** added later by dropping files in R2 + a row in `videos`. The
  `content_type` and `condition` columns are what make cross-media comparison work.

---

## 10. Build roadmap → TestFlight

1. **Scaffold** Expo + `expo-router`; the 5 screens + navigation.
2. **Feed** — paged `FlatList` + `expo-video`, bundled dummy clips, active-item logic, preloading.
3. **Action rail** — 👍 👎 🔖 ⋯ wired to a local event logger.
4. **Cloudflare** — create R2 bucket + upload test clips; Worker + D1 schema + seed an access code.
5. **Wire app → Worker** — code validation, session start, playlist fetch, batched event flush, form submit.
6. **Gating + session** — consent, demographics, countdown timer, end states, background handling.
7. **EAS Build → TestFlight** — needs Apple Developer Program ($99/yr) + App Store Connect app record; `eas build -p ios` → `eas submit`.
8. **QA** on web (fast iteration) + iOS device via TestFlight.

**Prerequisites to line up:** Cloudflare account, Apple Developer Program enrollment,
Expo/EAS account.

---

## 11. Resolved decisions

- **App display name:** FlowState Testing.
- **Repo:** new standalone repo under the `FlowState-BCI` org (not inside `website`).
- **Demographics fields:** as drafted in §3.3 — approved.
- **Options (⋯) menu:** shows additional **video metadata** only, no leave-feed actions — see §3.6.
- **Feed order:** **randomized from the start** — one content pool, shuffled per session;
  `content_type` is the post-hoc comparison dimension.
- **Session timer:** tracked silently, **not shown** to participants.
