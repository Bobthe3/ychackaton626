import type { Video } from "./types";
import mockVideos from "../../contracts/mocks/videos.json";

const BASE = process.env.NEXT_PUBLIC_VIDEO_API_BASE;

/** Fetch the curated clips. Falls back to the shared mock until Devan's API is live. */
export async function getVideos(): Promise<Video[]> {
  if (!BASE) return mockVideos as Video[];
  try {
    const res = await fetch(`${BASE}/api/videos`, { cache: "no-store" });
    if (!res.ok) throw new Error(`videos api ${res.status}`);
    return (await res.json()) as Video[];
  } catch (e) {
    console.warn("[api] video API unavailable, using mock:", e);
    return mockVideos as Video[];
  }
}
