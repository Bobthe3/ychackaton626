# cloudflare/ — video + characteristics API (Devan)

Serves the 50 Tech-UGC clips + their precomputed characteristics to Holly's front-end.

- `GET /api/videos` → array of `Video` (see [`../../contracts/video.schema.json`](../../contracts/video.schema.json)).
  **Omit `color_profile`** — Holly extracts it client-side.
- MP4s live on **R2**; the Worker returns their public URLs in `url`.

## Build
```bash
# Worker scaffold (Devan):
npm create cloudflare@latest -- api
# wrangler.toml binds R2; route /api/videos returns videos.json built by precompute/.
```

Until this is live, Holly builds against `../../contracts/mocks/videos.json`.
