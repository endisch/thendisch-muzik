"use client";

import { useEffect, useRef, useState } from "react";
import { parseLrc, currentLineIndex, LrcLine } from "@/lib/lrc";
import { useReducedMotion, motion, AnimatePresence } from "framer-motion";
import { Volume2, Play, Pause, Disc3 } from "lucide-react";

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

function Vinyl({ playing, progress, coverUrl }: { playing: boolean; progress: number; coverUrl?: string | null }) {
  const reduceMotion = useReducedMotion();
  const r = 48;
  const c = 2 * Math.PI * r;

  return (
    <div className="relative mx-auto flex h-72 w-72 lg:h-96 lg:w-96 items-center justify-center">
      {/* Avant-Garde Glow */}
      <div className="absolute inset-0 rounded-full bg-[#D4AF37]/5 blur-[80px]" />

      <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90 scale-105">
        <circle cx="50" cy="50" r={r} fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" />
        <circle
          cx="50"
          cy="50"
          r={r}
          fill="none"
          stroke="#D4AF37"
          strokeWidth="0.75"
          strokeDasharray={c}
          strokeDashoffset={c - (progress / 100) * c}
          className="transition-[stroke-dashoffset] duration-500 ease-linear"
        />
      </svg>

      <div
        className="relative h-[90%] w-[90%] rounded-full shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_40px_80px_-20px_rgba(0,0,0,0.9)] overflow-hidden"
        style={{
          background: "conic-gradient(from 0deg, #111, #080808 10%, #111 20%, #080808 30%, #111 40%, #080808 50%, #111 60%, #080808 70%, #111 80%, #080808 90%, #111)",
          animation: playing && !reduceMotion ? "spin 12s linear infinite" : undefined,
        }}
      >
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-50 mix-blend-overlay">
           <div className="w-full h-full rounded-full border-[30px] border-black/40"></div>
        </div>

        {coverUrl && (
          <img src={coverUrl} alt="Cover" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity grayscale contrast-125" />
        )}

        <div className="absolute inset-[38%] rounded-full bg-gradient-to-br from-[#D4AF37]/30 via-[#111] to-black shadow-inner z-10 overflow-hidden border border-[#D4AF37]/20">
          {coverUrl && <img src={coverUrl} alt="Center Label" className="absolute inset-0 w-full h-full object-cover opacity-80" />}
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="h-4 w-4 rounded-full bg-[#080808] border border-[#D4AF37]/50 shadow-inner" />
          </div>
        </div>
      </div>

      {/* Tonearm */}
      <div
        className="absolute right-0 top-4 h-32 w-1.5 origin-top-right rounded-full bg-gradient-to-b from-zinc-700 to-zinc-900 shadow-2xl transition-transform duration-1000 ease-in-out lg:h-40 border border-white/10"
        style={{ transform: playing ? "rotate(22deg)" : "rotate(2deg)" }}
      >
        <div className="absolute -left-2 -top-2 h-5 w-5 rounded-full bg-zinc-800 border border-[#D4AF37]/30 shadow-lg" />
        <div className="absolute -bottom-2 -left-1 h-4 w-3.5 rounded-sm bg-[#D4AF37] shadow-[0_0_10px_rgba(212,175,55,0.4)]" />
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
      <div className="relative mt-8 h-40 flex flex-col items-center justify-center text-zinc-600">
        <Disc3 className="w-6 h-6 mb-2 opacity-20" />
        <span className="font-mono text-[10px] uppercase tracking-widest opacity-50">Sözler Bulunamadı</span>
      </div>
    );
  }

  return (
    <div className="relative mt-8 h-48 overflow-hidden [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
      <motion.div
        animate={{ y: -activeIndex * 48 + 72 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center"
      >
        {lines.map((line, i) => {
          const active = i === activeIndex;
          const past = i < activeIndex;
          return (
            <p
              key={i}
              className={`h-12 text-center leading-[48px] transition-all duration-700 w-full max-w-md px-4 truncate font-serif text-lg ${
                active
                  ? "scale-105 font-bold text-[#D4AF37] [text-shadow:0_0_15px_rgba(212,175,55,0.3)]"
                  : past 
                    ? "scale-95 text-zinc-500 opacity-50"
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
    const interval = setInterval(poll, 3000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current) return;
    const el = audioRef.current;
    const onTimeUpdate = () => {
      if (lines.length > 0) setActiveLine(currentLineIndex(lines, el.currentTime));
      if (el.duration) setProgress(Math.floor((el.currentTime / el.duration) * 100));
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
      if (isPlayingLocally) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#121318]/80 to-[#0B0C10] border-t border-b sm:border border-white/[0.03] sm:rounded-[2.5rem] p-8 sm:p-14 shadow-2xl backdrop-blur-3xl relative">
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${now?.playing ? 'animate-ping bg-[#D4AF37]' : 'bg-zinc-600'}`} />
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${now?.playing ? 'bg-[#D4AF37]' : 'bg-zinc-600'}`} />
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.3em] text-zinc-500">
            {now?.playing ? "On Air" : "Offline"}
          </span>
        </div>

        <Vinyl playing={isPlayingLocally} progress={progress} coverUrl={now?.coverUrl} />

        <div className="mt-12 text-center flex flex-col items-center min-h-[5rem]">
          <AnimatePresence mode="wait">
            <motion.div 
              key={now?.songId || "empty"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.5 }}
              className="w-full px-4"
            >
              {now?.playing ? (
                <>
                  <h2 className="text-4xl sm:text-5xl font-black tracking-tighter text-white truncate w-full">{now.title}</h2>
                  <p className="mt-3 text-sm sm:text-base font-mono uppercase tracking-[0.2em] text-[#D4AF37] truncate w-full">{now.artist}</p>
                </>
              ) : (
                <p className="text-zinc-500 font-serif italic text-xl">Sessizlik...</p>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Transport Controls */}
        <div className="mt-10 flex items-center justify-center gap-8">
          <Volume2 className="h-4 w-4 text-zinc-600" />
          <button
            onClick={togglePlay}
            className="flex h-16 w-16 items-center justify-center rounded-none bg-white text-black transition-all duration-500 hover:scale-95 hover:bg-[#D4AF37] active:scale-90"
            aria-label={isPlayingLocally ? "Duraklat" : "Oynat"}
          >
            {isPlayingLocally ? (
              <Pause className="h-5 w-5" fill="black" />
            ) : (
              <Play className="h-5 w-5 translate-x-0.5" fill="black" />
            )}
          </button>
          <div className="font-mono text-[10px] tabular-nums text-zinc-600 w-8 text-right">
            {progress}%
          </div>
        </div>

        <div className="mt-10 flex items-center gap-4 opacity-50">
          <span className="h-px flex-1 bg-gradient-to-r from-transparent to-white/10" />
          <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-zinc-500">
            Acoustics
          </span>
          <span className="h-px flex-1 bg-gradient-to-l from-transparent to-white/10" />
        </div>

        <LyricsView activeIndex={activeLine} lines={lines} />
      </div>
      <audio ref={audioRef} />
    </div>
  );
}
