"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Pause, Disc3, Volume2, VolumeX, Volume1, Trophy } from "lucide-react";
import { motion } from "framer-motion";
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
    <div className="relative mx-auto mt-8 flex aspect-square w-full max-w-[320px] items-center justify-center rounded-full bg-[#090b0e] shadow-sm border border-white/[0.08]">
      {/* Plak yivleri (grooves) */}
      <div className="absolute inset-2 rounded-full border border-white/[0.03] pointer-events-none" />
      <div className="absolute inset-6 rounded-full border border-white/[0.02] pointer-events-none" />
      <div className="absolute inset-10 rounded-full border border-white/[0.04] pointer-events-none" />
      <div className="absolute inset-16 rounded-full border border-white/[0.02] pointer-events-none" />
      <div className="absolute inset-24 rounded-full border border-white/[0.03] pointer-events-none" />

      {/* Merkez Etiket */}
      <motion.div
        animate={{ rotate: playing ? 360 : 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-[#090b0e] border-4 border-[#090b0e] shadow-inner overflow-hidden"
      >
        {coverUrl ? (
          <img src={coverUrl} alt="Parça kapağı" className="w-full h-full object-cover opacity-80" />
        ) : (
          <Disc3 className="h-8 w-8 text-[#ff6c55]/50" />
        )}
        <div className="absolute h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-[#090b0e] border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] z-10" />
      </motion.div>
    </div>
  );
}

function LyricsView({ activeIndex, lines, rawLyrics }: { activeIndex: number; lines: LrcLine[]; rawLyrics?: string | null }) {
  if (lines.length === 0) {
    if (rawLyrics && rawLyrics.trim().length > 0) {
      // Olası herhangi bir köşeli parantezli zaman etiketini temizle (örn. [00:15:20] veya [00:15.22])
      const cleanedLyrics = rawLyrics.replace(/\[[^\]]*\]/g, "");

      return (
        <div className="relative mt-8 h-48 overflow-y-auto no-scrollbar [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
          <div className="flex flex-col items-center py-12 px-4 gap-4">
            {cleanedLyrics.split("\n").map((line, i) => (
              <p key={i} className="text-center font-display text-lg text-[#b8bec8] w-full max-w-md">
                {line.trim()}
              </p>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="relative mt-8 h-40 flex flex-col items-center justify-center text-[#adb5c0]">
        <Disc3 className="w-6 h-6 mb-2 opacity-20" />
        <span className="px-4 text-center text-sm leading-6">Bu parçanın sözleri henüz eklenmedi</span>
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
              className={`h-12 text-center leading-[48px] transition-all duration-700 w-full max-w-md px-4 truncate font-display text-lg ${
                active
                  ? "font-semibold text-[#ff6c55]"
                  : past
                    ? "scale-95 text-[#adb5c0] opacity-50"
                    : "scale-95 text-[#adb5c0]"
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
  const [volume, setVolume] = useState(1);
  const [isVoting, setIsVoting] = useState(false);

  const handleVote = async (songId?: string) => {
    if (!songId) return;
    setIsVoting(true);
    try {
      const res = await fetch("/api/songs/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Oyun kaydedilemedi. Lütfen tekrar dene.");
      } else {
        alert("Oyun kaydedildi.");
      }
    } catch (error) {
      alert("Oyun kaydedilemedi. Lütfen tekrar dene.");
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch("/api/now-playing", { cache: "no-store" });
        const data = await res.json();
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
          data.elapsedSec >= data.durationSec - 2
        ) {
          if (reportedRef.current !== data.songId) {
            reportedRef.current = data.songId;
            fetch("/api/songs/finish", { method: "POST" }).catch(() => {});
          }
        }
      } catch (e) {}
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

    // Uygulanan Ses Seviyesi
    el.volume = volume;

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
  }, [lines, volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlayingLocally) audioRef.current.pause();
      else audioRef.current.play();
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
  };

  const toggleMute = () => {
    if (volume > 0) setVolume(0);
    else setVolume(1);
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-2xl rounded-none border border-[#2a3038] bg-[#12161b] p-5 sm:p-10">
        <div className="absolute top-5 left-5 sm:top-7 sm:left-7 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full rounded-none opacity-75 ${now?.playing ? 'animate-ping bg-[#ff543b]' : 'bg-zinc-600'}`} />
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-none ${now?.playing ? 'bg-[#ff543b]' : 'bg-zinc-600'}`} />
          </span>
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-[#adb5c0]">CANLI YAYIN</span>
        </div>

        {!now?.playing ? (
          <div className="flex h-64 flex-col items-center justify-center text-[#adb5c0]">
            <Disc3 className="mb-4 h-8 w-8 animate-spin opacity-20 duration-[3000ms]" />
            <p className="font-mono text-xs uppercase tracking-widest">Yeni parçalar bekleniyor</p>
          </div>
        ) : (
          <>
            <Vinyl playing={isPlayingLocally} coverUrl={now.coverUrl} />

            <div className="mt-8 text-center flex flex-col items-center">
              <h2 className="text-2xl sm:text-4xl font-semibold text-[#f7f8fa] tracking-tight mb-2 truncate max-w-full">
                {now.title}
              </h2>
              <p className="text-sm sm:text-base text-[#b8bec8] font-medium mb-4">
                {now.artist}
              </p>

              <button
                onClick={() => handleVote(now.songId)}
                disabled={isVoting}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-[#ff543b]/20 border border-white/10 hover:border-[#ff543b]/50 rounded-none text-[#dde2e9] hover:text-[#ff6c55] transition-all disabled:opacity-50"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-xs font-semibold uppercase tracking-widest">{isVoting ? "Kaydediliyor…" : "Bu şarkıya oy ver"}</span>
              </button>
            </div>

            <div className="mx-auto mt-8 grid h-16 w-full max-w-sm grid-cols-[minmax(0,1fr)_64px_minmax(0,1fr)] items-center gap-3">

              {/* Sol: Ses Kontrolü (Daima görünür, Mobil uyumlu) */}
              <div className="flex min-w-0 items-center gap-2">
                <button onClick={toggleMute} className="shrink-0 text-[#adb5c0] hover:text-[#ff6c55] transition-colors" aria-label="Sesi kapat veya aç">
                  {volume === 0 ? <VolumeX className="h-5 w-5" /> : volume < 0.5 ? <Volume1 className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input
                  type="range"
                  min="0" max="1" step="0.01"
                  value={volume}
                  onChange={handleVolumeChange}
                  className="h-1 w-full min-w-0 max-w-24 bg-white/10 rounded-none appearance-none cursor-pointer accent-[#ff543b] hover:bg-white/20 transition-all [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-none [&::-webkit-slider-thumb]:bg-[#ff543b] [&::-webkit-slider-thumb]:shadow-sm"
                  aria-label="Ses seviyesi"
                />
              </div>

              {/* Orta: Play/Pause Butonu */}
              <button
                onClick={togglePlay}
                className="group flex h-16 w-16 items-center justify-center rounded-none border border-[#ff543b]/50 text-[#ff6c55] transition-all duration-500 hover:bg-[#ff543b]/10 hover:border-[#ff543b] active:scale-95 hover:shadow-sm z-10"
                aria-label={isPlayingLocally ? "Duraklat" : "Dinlemeye başla"}
              >
                {isPlayingLocally ? (
                  <Pause className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <Play className="h-5 w-5 translate-x-[2px]" strokeWidth={2} />
                )}
              </button>

              {/* Sağ: İlerleme Yüzdesi */}
              <div className="justify-self-end font-mono text-sm tabular-nums text-[#adb5c0] font-medium">
                {progress}%
              </div>
            </div>

            <div className="mt-10 flex items-center gap-4 opacity-50">
              <span className="h-px flex-1 bg-white/10" />
              <span className="font-mono text-xs uppercase tracking-[0.12em] text-[#adb5c0]">
                Thendisch Studio
              </span>
              <span className="h-px flex-1 bg-white/10" />
            </div>

            <LyricsView activeIndex={activeLine} lines={lines} rawLyrics={now.lyricsLrc} />
          </>
        )}
      </div>
      <audio ref={audioRef} />
    </div>
  );
}
