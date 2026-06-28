"use client";
// Screen 1 — Live scroll (the money shot). See prd-holly.md §2.
import { useEffect, useMemo, useRef, useState } from "react";
import { getVideos } from "@/lib/api";
import { subscribeEeg, subscribePredictedEeg } from "@/lib/ws";
import { getPredictedCurve, type PredictedCurve } from "@/lib/predict";
import type { Video, EegSample } from "@/lib/types";
import Waveform from "@/components/Waveform";
import CharacteristicsPanel from "@/components/CharacteristicsPanel";
import ClipChat from "@/components/ClipChat";
import { demoInterest } from "@/lib/demo";

function fmt(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

function posterFor(video?: Video) {
  return video?.url === "/clips/video.mp4" ? "/clips/video-poster.jpg" : undefined;
}

export default function LivePage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [current, setCurrent] = useState(0);
  const [curve, setCurve] = useState<PredictedCurve | null>(null);
  const [samples, setSamples] = useState<EegSample[]>([]);
  const [started, setStarted] = useState(false); // flips on first play (sticky, for the UI reveal)
  const [playing, setPlaying] = useState(false); // true only while the clip is actually playing
  const [playbackMs, setPlaybackMs] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<Video | null>(null); // an analyzed upload overrides the catalog clip
  const videoRef = useRef<HTMLVideoElement>(null);

  // load the catalog, then prefer the first clip the M2 model can predict so the
  // demo reliably shows the model's brainwave (others fall back to the synth stream)
  useEffect(() => {
    getVideos().then(async (vs) => {
      setVideos(vs);
      for (let i = 0; i < vs.length; i++) {
        const c = await getPredictedCurve(vs[i].video_id);
        if (c) {
          setCurrent(i);
          setCurve(c);
          return;
        }
      }
    });
  }, []);

  // the waveform streams once the clip is playing. predict_score is the M2
  // model's content->EEG prediction for THIS clip, sampled at the live playback
  // time; if the clip wasn't predicted we fall back to the synth stream.
  const video = uploadedVideo ?? videos[current];

  // reset the drawn waveform only when the clip itself changes (not on pause/end)
  useEffect(() => {
    setSamples([]);
  }, [video?.video_id]);

  // sample the EEG only WHILE the clip is playing — pausing or reaching the end
  // stops it and freezes the line in place.
  useEffect(() => {
    if (!playing) return;
    const onSample = (s: EegSample) => setSamples((prev) => [...prev.slice(-4000), s]);
    const unsub = curve
      ? subscribePredictedEeg(curve, () => (videoRef.current?.currentTime ?? 0) * 1000, onSample)
      : subscribeEeg(onSample);
    return unsub;
  }, [playing, curve]);
  const latest = samples[samples.length - 1];
  const title = video?.characteristics.transcript_summary.split("—")[0].trim();
  const curveStats = useMemo(() => {
    if (!curve?.interest.length) return null;
    const peak = Math.max(...curve.interest);
    const avg = curve.interest.reduce((sum, v) => sum + v, 0) / curve.interest.length;
    return { peak, avg };
  }, [curve]);
  const demoScore = video ? demoInterest[video.video_id] : undefined;
  const displayStats = curveStats ?? (demoScore != null ? { peak: demoScore, avg: Math.max(0.1, demoScore - 0.16) } : null);
  const displayPeakT = curve?.peak_t ?? (video ? 2.2 : null);
  // real mp4 vs mock → show <video> only for real files (mocks point at example.com)
  const isReal = !!video?.url && !video.url.includes("example.com");

  return (
    <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-5">
<<<<<<< Updated upstream
      {/* 3 columns on wide screens; stacks vertically below xl */}
      <div className="flex flex-col gap-6 xl:grid xl:grid-cols-[270px_1px_minmax(0,1.4fr)_1px_minmax(0,1fr)] xl:items-stretch">
=======
      <div className="flex items-center justify-between border-b border-neutral-800/80 pb-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.24em] text-neutral-500">NeuroViral live decode</div>
          <div className="mt-1 text-xl font-semibold tracking-tight text-neutral-100">Clip in, predicted brainwave out</div>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-400">
          <span className="rounded-full border border-[#2f8fd6]/45 bg-[#2f8fd6]/10 px-2.5 py-1 text-[#9fe9ff]">model ready</span>
          <span className="rounded-full border border-neutral-700 px-2.5 py-1">EEG overlay armed</span>
        </div>
      </div>

      {/* 3 columns: video | insight tabs (middle) | now-playing + characteristics (right) */}
      <div className="grid grid-cols-[270px_1px_minmax(0,1.4fr)_1px_minmax(0,1fr)] items-stretch gap-6">
>>>>>>> Stashed changes
        {/* LEFT — video stage (fits a 9:16 reel or 16:9 clip via object-contain) */}
        <div className="flex h-[460px] items-center justify-center">
          {isReal ? (
            <video
              ref={videoRef}
              src={video!.url}
              poster={posterFor(video)}
              className="h-full w-auto max-w-[270px] rounded-2xl border border-neutral-800 bg-black object-contain"
              playsInline controls preload="metadata"
              controlsList="nodownload"
              onLoadedMetadata={() => setPlaybackMs((videoRef.current?.currentTime ?? 0) * 1000)}
              onTimeUpdate={() => setPlaybackMs((videoRef.current?.currentTime ?? 0) * 1000)}
              onSeeked={() => setPlaybackMs((videoRef.current?.currentTime ?? 0) * 1000)}
              onPlay={() => {
                setStarted(true);
                setPlaying(true);
                setPlaybackMs((videoRef.current?.currentTime ?? 0) * 1000);
              }}
              onPause={() => setPlaying(false)}
              onEnded={() => setPlaying(false)}
            />
          ) : (
            <div className="relative flex h-full w-auto items-end overflow-hidden rounded-2xl border border-neutral-800 bg-gradient-to-b from-neutral-800 to-neutral-950"
                 style={{ aspectRatio: "9 / 16" }}>
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-4xl text-neutral-700">▶</div>
              <div className="relative w-full bg-gradient-to-t from-black/80 to-transparent p-3 text-xs text-neutral-300">
                {title ?? "loading…"}
              </div>
            </div>
          )}
        </div>

        <div className="hidden bg-neutral-800/80 xl:block" />

<<<<<<< Updated upstream
        {/* MIDDLE — insight tabs: browse clips / learned / related grid */}
        <div className="pr-2 xl:h-[460px] xl:overflow-y-auto">
=======
        {/* MIDDLE — live chat: the analyst narrates what the model learned, then you can ask back */}
        <div className="h-[460px] pr-2">
>>>>>>> Stashed changes
          {started ? (
            <ClipChat
              video={video}
              peakT={displayPeakT}
              onAnalyzed={(v, c) => {
                setUploadedVideo(v);
                setCurve(c);
              }}
            />
          ) : (
            <PrePlayPanel video={video} peakT={displayPeakT} curveStats={displayStats} />
          )}
        </div>

        <div className="hidden bg-neutral-800/80 xl:block" />

        {/* RIGHT — now playing + characteristics */}
        <div className="space-y-3 pr-2 xl:h-[460px] xl:overflow-y-auto">
          <div>
            <div className="text-xs uppercase tracking-wide text-neutral-500">now playing</div>
            <div className="mt-1 text-lg font-semibold leading-tight">{title ?? "—"}</div>
            <div className="text-sm text-neutral-500">
              {video?.metadata.creator} · {fmt(playbackMs)} / {video ? fmt(video.metadata.duration_ms) : "0:00"}
            </div>
          </div>

          {started ? (
            <div className="reveal" style={{ animationDelay: "60ms" }}>
              {video && <CharacteristicsPanel video={video} videoRef={videoRef} />}
            </div>
          ) : (
            <>
              <p className="text-sm leading-relaxed text-neutral-400">{video?.characteristics.transcript_summary}</p>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4 text-sm text-neutral-300">
                <div className="mb-2 text-xs uppercase tracking-wide text-neutral-500">demo readout</div>
                <div className="space-y-1.5">
                  <p>Predicted peak: <span className="text-[#9fe9ff]">{displayPeakT != null ? fmt(displayPeakT * 1000) : "ready"}</span></p>
                  <p>Hook assets: captions, fast cuts, direct office-humor setup.</p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* waveform — grid always visible (shows the feature); line streams in on play */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-neutral-500">interest · theta/beta · live</span>
          <span className="text-sm tabular-nums text-[#9fe9ff]">{latest ? latest.interest_score.toFixed(2) : "—"}</span>
        </div>
        <Waveform samples={samples} durationMs={video?.metadata.duration_ms} live={started} />
      </div>
    </div>
  );
}

function PrePlayPanel({
  video,
  peakT,
  curveStats,
}: {
  video?: Video;
  peakT?: number | null;
  curveStats: { peak: number; avg: number } | null;
}) {
  const c = video?.characteristics;
  const peakLabel = peakT != null ? fmt(peakT * 1000) : "ready";
  const peakScore = curveStats ? Math.round(curveStats.peak * 100) : 0;
  const avgScore = curveStats ? Math.round(curveStats.avg * 100) : 0;

  return (
    <div className="flex h-full flex-col justify-between rounded-2xl border border-neutral-800 bg-neutral-950/45 p-4">
      <div>
        <div className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">model pass</div>
        <div className="mt-2 text-2xl font-semibold leading-tight text-neutral-100">
          {video ? "Interest curve is already predicted for this reel." : "Loading model pass..."}
        </div>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-neutral-400">
          The stage moment is the overlay: the predicted curve is waiting, then the live/replayed signal draws on top as the clip runs.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2.5">
        <Metric label="peak" value={peakLabel} />
        <Metric label="predicted" value={curveStats ? `${peakScore}%` : "--"} />
        <Metric label="baseline" value={curveStats ? `${avgScore}%` : "--"} />
      </div>

      <div className="space-y-2">
        <div className="text-xs uppercase tracking-wide text-neutral-500">what the model sees</div>
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="rounded-full border border-neutral-700 px-2.5 py-1 text-neutral-300">{c?.cut_count ?? "--"} cuts</span>
          <span className="rounded-full border border-neutral-700 px-2.5 py-1 text-neutral-300">{c?.subtitles ? "captions on" : "no captions"}</span>
          <span className="rounded-full border border-neutral-700 px-2.5 py-1 text-neutral-300">{c?.audio ?? "audio"}</span>
        </div>
        <div className="rounded-xl border border-[#2f8fd6]/30 bg-[#2f8fd6]/10 px-3 py-2 text-sm text-[#cfeeff]">
          Play the reel to draw the signal and open the analyst decode.
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-neutral-800 bg-black/35 p-3">
      <div className="text-[11px] uppercase tracking-wide text-neutral-500">{label}</div>
      <div className="mt-1 text-lg font-semibold tabular-nums text-[#9fe9ff]">{value}</div>
    </div>
  );
}
