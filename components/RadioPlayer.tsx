"use client";

import { useEffect, useRef, useState } from "react";
import { parseLrc, currentLineIndex, LrcLine } from "@/lib/lrc";
import { useReducedMotion, motion } from "framer-motion";
import { Volume2, Play, Pause } from "lucide-react";

type NowPlaying = {
  playing: boolean;
  songId?: string;
  title?: string;
  artist?: string;
  coverUrl?: string | null;
  lyricsLrc?: string | null;
  durationSec?: number;
  elapsedSec?: number;
  playbackUrl?: string;
};

/* ================= Dönen plak + dairesel ilerleme halkası ================= */
function Vinyl({ playing, progress, coverUrl }: { playing: boolean; progress: number; coverUrl?: string | null }) {
  const reduceMotion = useReducedMotion();
  const r = 47;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative mx-auto flex h-64 w-64 items-center justify-center sm:h-80 sm:w-80">
      <div className="absolute inset-0 rounded-full bg-emerald-500/10 blur-[70px]" />

      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1.5" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#10b981"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - (progress / 100) * c}
          className="transition-[stroke-dashoffset] duration-500 ease-linear"
          style={{ filter: "drop-shadow(0 0 4px rgba(16,185,129,0.6))" }}
        />
      </svg>

      <div
        className="relative h-[86%] w-[86%] rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_30px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden"
        style={{
          background: "conic-gradient(from 0deg, #18181b, #09090b 8%, #18181b 16%, #09090b 24%, #18181b 32%, #09090b 40%, #18181b 48%, #09090b 56%, #18181b 64%, #09090b 72%, #18181b 80%, #09090b 88%, #18181b 96%, #09090b)",
          animation: playing && !reduceMotion ? "spin 14s linear infinite" : undefined,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80 mix-blend-overlay">
           {/* Plak olukları detayı */}
           <div className="w-full h-full rounded-full border-[20px] border-black/30"></div>
        </div>

        {coverUrl && (
          <img src={coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-60 mix-blend-luminosity" />
        )}

        <div className="absolute inset-[34%] rounded-full bg-gradient-to-br from-emerald-500/40 via-zinc-800 to-black shadow-inner z-10 overflow-hidden">
          {coverUrl && <img src={coverUrl} alt="Center Label" className="absolute inset-0 w-full h-full object-cover" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/30">
            <div className="h-3 w-3 rounded-full bg-black ring-1 ring-white/20 shadow-inner" />
          </div>
        </div>
      </div>

      <div
        className="absolute right-1 top-1 h-24 w-1.5 origin-top-right rounded-full bg-zinc-700 shadow-lg transition-transform duration-700 ease-out sm:h-28"
        style={{ transform: playing ? "rotate(24deg)" : "rotate(4deg)" }}
      >
        <div className="absolute -left-1 -top-1 h-3 w-3 rounded-full bg-zinc-600" />
        <div className="absolute -bottom-1 -left-0.5 h-2.5 w-2.5 rounded-sm bg-emerald-500" />
      </div>
      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

function LyricsView({ activeIndex, lines }: { activeIndex: number; lines: LrcLine[] }) {
  if (lines.length === 0) {
    return (
      <div className="relative mt-2 h-56 flex items-center justify-center text-zinc-600 italic">
        Sözler mevcut değil
      </div>
    );
  }

  return (
    <div className="relative mt-2 h-56 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)]">
      <motion.div
        animate={{ y: -activeIndex * 44 + 88 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        {lines.map((line, i) => {
          const active = i === activeIndex;
          return (
            <p
              key={i}
              className={`h-11 text-center leading-[44px] transition-all duration-500 ${
                active
                  ? "scale-110 font-bold text-emerald-500 [text-shadow:0_0_22px_rgba(16,185,129,0.5)]"
                  : "scale-95 text-zinc-600"
              }`}
            >
              {line.text}
            </p>
          );
        })}
      </motion.div>
    </div>
  );
}

export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [now, setNow] = useState<NowPlaying | null>(null);
  const [lines, setLines] = useState<LrcLine[]>([]);
  const [activeLine, setActiveLine] = useState(-1);
  const reportedRef = useRef<string | null>(null);
  const [isPlayingLocally, setIsPlayingLocally] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch("/api/now-playing");
        const data: NowPlaying = await res.json();
        if (cancelled) return;

        setNow((prev) => {
          if (data.songId && data.songId !== prev?.songId && audioRef.current) {
            audioRef.current.src = data.playbackUrl ?? "";
            audioRef.current.currentTime = data.elapsedSec ?? 0;
            audioRef.current.play().then(() => setIsPlayingLocally(true)).catch(() => setIsPlayingLocally(false));
            setLines(data.lyricsLrc ? parseLrc(data.lyricsLrc) : []);
            reportedRef.current = null;
          }
          return data;
        });

        if (
          data.playing &&
          data.elapsedSec &&
          data.durationSec &&
          data.elapsedSec / data.durationSec >= 0.8 &&
          reportedRef.current !== data.songId
        ) {
          reportedRef.current = data.songId!;
          fetch("/api/play-history", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ songId: data.songId }),
          }).catch(() => {});
        }
      } catch(e) {}
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    const el = audioRef.current;
    const onTimeUpdate = () => {
      if (lines.length > 0) {
        setActiveLine(currentLineIndex(lines, el.currentTime));
      }
      if (el.duration) {
        setProgress(Math.floor((el.currentTime / el.duration) * 100));
      }
    };
    el.addEventListener("timeupdate", onTimeUpdate);
    el.addEventListener("play", () => setIsPlayingLocally(true));
    el.addEventListener("pause", () => setIsPlayingLocally(false));
    return () => {
      el.removeEventListener("timeupdate", onTimeUpdate);
      el.removeEventListener("play", () => setIsPlayingLocally(true));
      el.removeEventListener("pause", () => setIsPlayingLocally(false));
    };
  }, [lines]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlayingLocally) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
    }
  };

  return (
    <div className="rounded-[2rem] border border-white/[0.06] bg-zinc-900/40 p-8 backdrop-blur-3xl sm:p-10">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-500">
            {now?.playing ? "Canlı Yayın" : "Yayın Yok"}
          </span>
        </div>
      </div>

      <Vinyl playing={isPlayingLocally} progress={progress} coverUrl={now?.coverUrl} />

      <div className="mt-8 text-center min-h-[4rem]">
        {now?.playing ? (
          <>
            <h2 className="text-3xl font-black tracking-tight text-white truncate max-w-full">{now.title}</h2>
            <p className="mt-1 text-base font-medium text-emerald-500 truncate max-w-full">{now.artist}</p>
          </>
        ) : (
           <p className="mt-4 text-zinc-500 italic">Radyo sessiz...</p>
        )}
      </div>

      {/* Transport */}
      <div className="mt-7 flex items-center justify-center gap-5">
        <Volume2 className="h-4 w-4 text-zinc-600" />
        <button
          onClick={togglePlay}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-black transition-all duration-300 hover:scale-105 hover:shadow-[0_0_35px_2px_rgba(16,185,129,0.4)] active:scale-95"
          aria-label={isPlayingLocally ? "Duraklat" : "Oynat"}
        >
          {isPlayingLocally ? (
            <Pause className="h-5 w-5" fill="black" />
          ) : (
            <Play className="h-5 w-5 translate-x-0.5" fill="black" />
          )}
        </button>
        <span className="font-mono text-[10px] tabular-nums text-zinc-600">
          %{progress}
        </span>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <span className="h-px flex-1 bg-white/[0.06]" />
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          Sözler
        </span>
        <span className="h-px flex-1 bg-white/[0.06]" />
      </div>

      <LyricsView activeIndex={activeLine} lines={lines} />
      <audio ref={audioRef} />
    </div>
  );
}
