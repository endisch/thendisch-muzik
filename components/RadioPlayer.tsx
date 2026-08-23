"use client";

import { useEffect, useState, useRef } from "react";
import { Play, Pause, Disc3, Volume2, VolumeX, Volume1, Trophy } from "lucide-react";
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
      <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-white/[0.05] via-transparent to-black/80 pointer-events-none" />
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-transparent via-white/[0.02] to-transparent pointer-events-none" />
      
      {/* Merkez Etiket */}
      <motion.div
        animate={{ rotate: playing ? 360 : 0 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="relative flex h-24 w-24 sm:h-32 sm:w-32 items-center justify-center rounded-full bg-[#1A1C23] border-4 border-[#0B0C10] shadow-inner overflow-hidden"
      >
        {coverUrl ? (
          <img src={coverUrl} alt="Cover" className="w-full h-full object-cover opacity-80" />
        ) : (
          <Disc3 className="h-8 w-8 text-[#D4AF37]/50" />
        )}
        <div className="absolute h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-[#050505] border border-white/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] z-10" />
      </motion.div>
    </div>
  );
}

function LyricsView({ activeIndex, lines, rawLyrics }: { activeIndex: number; lines: LrcLine[]; rawLyrics?: string | null }) {
  if (lines.length === 0) {
    if (rawLyrics && rawLyrics.trim().length > 0) {
      // LRC formatında değil ama düz metin (veya SRT) olarak sözler var
      return (
        <div className="relative mt-8 h-48 overflow-y-auto no-scrollbar [mask-image:linear-gradient(to_bottom,transparent,black_20%,black_80%,transparent)]">
          <div className="flex flex-col items-center py-12 px-4 gap-4">
            {rawLyrics.split("\n").map((line, i) => (
              <p key={i} className="text-center font-serif text-lg text-zinc-400 w-full max-w-md">
                {line}
              </p>
            ))}
          </div>
        </div>
      );
    }

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
        alert(error.error || "Oy verirken bir hata oluştu");
      } else {
        alert("Oyunuz başarıyla kaydedildi!");
      }
    } catch (error) {
      alert("Oy verirken bir hata oluştu");
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
      <div className="w-full max-w-2xl bg-gradient-to-b from-[#121318]/80 to-[#0B0C10] border-t border-b sm:border border-white/[0.03] sm:rounded-[2.5rem] p-8 sm:p-14 shadow-2xl backdrop-blur-3xl relative">
        <div className="absolute top-8 left-8 flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${now?.playing ? 'animate-ping bg-[#D4AF37]' : 'bg-zinc-600'}`} />
            <span className={`relative inline-flex h-1.5 w-1.5 rounded-full ${now?.playing ? 'bg-[#D4AF37]' : 'bg-zinc-600'}`} />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">CANLI YAYIN</span>
        </div>

        {!now?.playing ? (
          <div className="flex h-64 flex-col items-center justify-center text-zinc-500">
            <Disc3 className="mb-4 h-8 w-8 animate-spin opacity-20 duration-[3000ms]" />
            <p className="font-mono text-xs uppercase tracking-widest">Kuyruk Boş</p>
          </div>
        ) : (
          <>
            <Vinyl playing={isPlayingLocally} coverUrl={now.coverUrl} />
            
            <div className="mt-12 text-center flex flex-col items-center">
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mb-2 truncate max-w-full">
                {now.title}
              </h2>
              <p className="text-sm sm:text-base text-zinc-400 font-medium mb-4">
                {now.artist}
              </p>
              
              <button 
                onClick={() => handleVote(now.songId)}
                disabled={isVoting}
                className="flex items-center gap-2 px-5 py-2.5 bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 rounded-full text-zinc-300 hover:text-[#D4AF37] transition-all disabled:opacity-50"
              >
                <Trophy className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest">{isVoting ? "Bekleyin..." : "Bu Şarkıya Oy Ver"}</span>
              </button>
            </div>

            <div className="mt-10 relative flex items-center justify-center w-full max-w-sm mx-auto h-16">
              
              {/* Sol: Ses Kontrolü (Daima görünür, Mobil uyumlu) */}
              <div className="absolute left-0 flex items-center gap-3">
                <button onClick={toggleMute} className="text-zinc-500 hover:text-[#D4AF37] transition-colors" aria-label="Sesi Kapat/Aç">
                  {volume === 0 ? <VolumeX className="h-5 w-5" /> : volume < 0.5 ? <Volume1 className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
                </button>
                <input 
                  type="range" 
                  min="0" max="1" step="0.01" 
                  value={volume}
                  onChange={handleVolumeChange}
                  className="w-16 sm:w-24 h-1 bg-white/10 rounded-full appearance-none cursor-pointer accent-[#D4AF37] hover:bg-white/20 transition-all [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#D4AF37] [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(212,175,55,0.5)]"
                  aria-label="Ses Seviyesi"
                />
              </div>

              {/* Orta: Play/Pause Butonu */}
              <button
                onClick={togglePlay}
                className="group flex h-16 w-16 items-center justify-center rounded-full border border-[#D4AF37]/50 text-[#D4AF37] transition-all duration-500 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] active:scale-95 hover:shadow-[0_0_30px_rgba(212,175,55,0.2)] z-10"
                aria-label={isPlayingLocally ? "Duraklat" : "Oynat"}
              >
                {isPlayingLocally ? (
                  <Pause className="h-5 w-5" strokeWidth={2} />
                ) : (
                  <Play className="h-5 w-5 translate-x-[2px]" strokeWidth={2} />
                )}
              </button>
              
              {/* Sağ: İlerleme Yüzdesi */}
              <div className="absolute right-0 font-mono text-sm tabular-nums text-zinc-500 font-medium">
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

            <LyricsView activeIndex={activeLine} lines={lines} rawLyrics={now.lyricsLrc} />
          </>
        )}
      </div>
      <audio ref={audioRef} />
    </div>
  );
}
