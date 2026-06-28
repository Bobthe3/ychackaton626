# NeuroViral

> **Stop spraying and praying.** Wear an EEG, watch short-form videos, and let your own brain
> tell you which ones will go viral — *before* you spend on ads. YC Growth Hackathon.

## Repo layout (Holly & Devan never edit the same file → clean merges)

```
contracts/    SHARED interface (§6 schema) + mocks. Lock once; changing it = ping the other.
frontend/     HOLLY — Next.js 3-screen app (live/log/report) + components + lib + color script.
backend/      DEVAN — Python: EEG WebSocket server, precompute, Cloudflare API, model.
```

**Merge discipline:** Holly only edits `frontend/`, Devan only edits `backend/`, both agree on
`contracts/` once. Work on separate branches (`holly-frontend`, `devan-backend`) → PR into `main`.

## Quick start
- Frontend: [`frontend/README.md`](./frontend/README.md) — runs on mocks with zero backend.
- Backend: [`backend/README.md`](./backend/README.md).
- Interface: [`contracts/README.md`](./contracts/README.md).

## Docs
- [`PRD.md`](./PRD.md) — full product spec (concept, demo, UI, schema, tech stack, repo layout)
- [`prd-holly.md`](./prd-holly.md) — Holly's focused build doc
- [`pitch.md`](./pitch.md) — pitch flow & talking points
- [`transcript.md`](./transcript.md) · [`transcript-summary.md`](./transcript-summary.md)

**Team:** Holly (front-end / 3 screens) · Devan (model + backend) · Yuva (pitch / founder).
