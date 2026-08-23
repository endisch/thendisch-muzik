"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Pause, Disc3, Volume2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { parseLrc, LrcLine, currentLineIndex } from "@/lib/lrc";

type NowPlaying = {
  songId?: string;
  title?: string;
  artist?: string;
  coverUrl?: string;
  playbackUrl?: string;
  lyricsLrc?: string | null;
  playing: boolean;
  elapsedSec?: number;
  durationSec?: number;
};

function Vinyl({ playing, coverUrl }: { playing: boolean; coverUrl?: string }) {
  return (
    <div className="relative mx-auto mt-6 flex h-64 w-64 sm:h-80 sm:w-80 items-center justify-center rounded-full bg-[#050505] shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-white/[0.05]">
      {/* Plak yivleri (grooves) */}
      <div className="absolute inset-2 rounded-full border border-white/[0.03] pointer-events-none" />
      <div className="absolute inset-6 rounded-full border border-white/[0.02] pointer-events-none" />
      <div className="absolute inset-10 rounded-full border border-white/[0.04] pointer-events-none" />
      <div className="absolute inset-16 rounded-full border border-white/[0.02] pointer-events-none" />
      <div className="absolute inset-24 rounded-full border border-white/[0.03] pointer-events-none" />
      
      {/* Yansıma */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Ortadaki Label (Kapak) */}
      <div 
        className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full border-4 border-black bg-zinc-900 shadow-inner overflow-hidden z-10"
        style={{ animation: playing ? "spin 4s linear infinite" : "none" }}
      >
        {coverUrl ? (
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#D4AF37]/20 to-black" />
        )}
        {/* Plak Deliği */}
        <div className="absolute h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-black border border-white/10 shadow-inner z-20" />
      </div>

      {/* Tonearm (İğne Kolu) */}
      <div 
        className="absolute -right-8 top-10 h-40 w-16 origin-top-right transition-transform duration-1000 ease-[cubic-bezier(0.4,0,0.2,1)] z-20"
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

        <Vinyl playing={isPlayingLocally} coverUrl={now?.coverUrl} />

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
            className="group flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/50 text-[#D4AF37] transition-all duration-500 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] active:scale-95 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            aria-label={isPlayingLocally ? "Duraklat" : "Oynat"}
          >
            {isPlayingLocally ? (
              <Pause className="h-5 w-5" strokeWidth={2} />
            ) : (
              <Play className="h-5 w-5 translate-x-[2px]" strokeWidth={2} />
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
