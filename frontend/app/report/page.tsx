// Screen 3 — Session report. Precomputed/static for the demo (the "scaled" story).
import { getVideos } from "@/lib/api";

export default async function ReportPage() {
  const videos = await getVideos();
  // Demo: fake an interest score per clip so the ranking looks authoritative.
  const ranked = videos
    .map((v, i) => ({ v, score: [0.81, 0.68, 0.74][i] ?? 0.5 }))
    .sort((a, b) => b.score - a.score);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-lg font-bold">
        Session Report · 3 viewers · {videos.length} clips · Tech UGC
      </h1>

      <section>
        <h2 className="mb-2 text-sm uppercase text-neutral-500">Top performers</h2>
        <ol className="space-y-1">
          {ranked.map(({ v, score }, i) => (
            <li key={v.video_id} className="flex justify-between text-sm">
              <span>{i + 1}. {v.characteristics.transcript_summary.slice(0, 40)}… {v.metadata.creator}</span>
              <span>{score.toFixed(2)}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className="grid grid-cols-2 gap-6 text-sm">
        <section>
          <h2 className="mb-2 text-sm uppercase text-neutral-500">What wins</h2>
          <ul className="list-disc pl-5">
            <li>hook in first 2s</li>
            <li>6–9 cuts</li>
            <li>bold on-screen text</li>
            <li>warm color palette</li>
          </ul>
        </section>
        <section>
          <h2 className="mb-2 text-sm uppercase text-neutral-500">Who wins</h2>
          <ul className="list-disc pl-5">
            <li>{ranked[0]?.v.metadata.creator} (avg 0.77)</li>
            <li>best format: fast talking-head + captions</li>
          </ul>
        </section>
      </div>

      <p className="text-base font-semibold">→ Stop spraying and praying. CPM ↓ CAC ↓</p>
    </div>
  );
}
