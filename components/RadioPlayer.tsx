"use client";

import { useEffect, useRef, useState } from "react";
import { parseLrc, currentLineIndex, LrcLine } from "@/lib/lrc";

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

export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [now, setNow] = useState<NowPlaying | null>(null);
  const [lines, setLines] = useState<LrcLine[]>([]);
  const [activeLine, setActiveLine] = useState(-1);
  const reportedRef = useRef<string | null>(null);
  const [isPlayingLocally, setIsPlayingLocally] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
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
    }

    poll();
    const interval = setInterval(poll, 5000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    if (!audioRef.current || lines.length === 0) return;
    const el = audioRef.current;
    const onTimeUpdate = () => {
      setActiveLine(currentLineIndex(lines, el.currentTime));
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
    <div className="bg-zinc-950 p-8 rounded-[2.5rem] shadow-2xl border border-white/5 flex flex-col items-center overflow-hidden relative">
      
      {/* Arka Plan Glow Efekti (Daha sofistike) */}
      {now?.coverUrl && isPlayingLocally && (
        <div className="absolute inset-0 z-0 opacity-10 blur-[100px] transition-all duration-[3000ms]">
          <img src={now.coverUrl} className="w-full h-full object-cover scale-150" alt="" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Dönen Plak Kapak Tasarımı */}
        <div className="relative mb-10 mt-2 group cursor-pointer" onClick={togglePlay}>
          <div className={`w-72 h-72 md:w-96 md:h-96 rounded-full bg-black border-[12px] border-zinc-900 shadow-2xl overflow-hidden flex items-center justify-center relative transition-transform duration-700 ${isPlayingLocally ? 'animate-[spin_12s_linear_infinite] scale-100' : 'scale-95'}`}>
            {now?.coverUrl ? (
              <img src={now.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-90" />
            ) : (
              <div className="w-full h-full bg-zinc-900 flex items-center justify-center">
                <svg className="w-24 h-24 text-zinc-800" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
              </div>
            )}
            
            {/* Plak Ortası */}
            <div className="absolute w-16 h-16 bg-zinc-950 rounded-full border-4 border-zinc-900 z-20 flex items-center justify-center">
               <div className="w-4 h-4 bg-zinc-700 rounded-full"></div>
            </div>
            
            {/* Oynat/Duraklat İkonu Hover'da */}
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 backdrop-blur-sm">
               {isPlayingLocally ? (
                 <svg className="w-20 h-20 text-emerald-500 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               ) : (
                 <svg className="w-20 h-20 text-emerald-500 drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               )}
            </div>
          </div>
        </div>

        <audio ref={audioRef} />
        
        {now?.playing ? (
          <div className="text-center mb-10 w-full px-4">
            <h2 className="text-3xl font-black text-white mb-2 truncate drop-shadow-md">{now.title}</h2>
            <p className="text-lg text-emerald-500/80 font-medium truncate">{now.artist}</p>
          </div>
        ) : (
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-zinc-600 mb-2">Radyo Sessiz</h2>
            <p className="text-zinc-500 text-sm">Listeye yeni bir parça ekleyin.</p>
          </div>
        )}

        {/* Şarkı Sözleri */}
        <div className="w-full rounded-2xl h-48 overflow-y-auto relative mask-image-b text-center no-scrollbar">
          {lines.length > 0 ? (
            <div className="flex flex-col gap-6 py-12">
              {lines.map((line, i) => (
                <p 
                  key={i} 
                  className={`transition-all duration-500 text-xl md:text-2xl font-bold tracking-tight ${
                    i === activeLine 
                      ? "text-emerald-400 scale-110 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]" 
                      : i < activeLine ? "text-zinc-700" : "text-zinc-600"
                  }`}
                >
                  {line.text}
                </p>
              ))}
            </div>
          ) : now?.playing ? (
            <div className="flex items-center justify-center h-full text-zinc-700 italic font-medium">
              Sözler mevcut değil
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
