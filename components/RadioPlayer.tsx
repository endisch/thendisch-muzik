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
    <div className="bg-gray-900/80 backdrop-blur-2xl p-8 rounded-3xl shadow-2xl border border-gray-800 flex flex-col items-center overflow-hidden relative">
      
      {/* Arka Plan Glow Efekti */}
      {now?.coverUrl && isPlayingLocally && (
        <div className="absolute inset-0 z-0 opacity-20 blur-3xl transition-all duration-1000">
          <img src={now.coverUrl} className="w-full h-full object-cover scale-150" alt="" />
        </div>
      )}

      <div className="relative z-10 flex flex-col items-center w-full">
        {/* Dönen Plak Kapak Tasarımı */}
        <div className="relative mb-8 mt-4 group cursor-pointer" onClick={togglePlay}>
          <div className={`w-64 h-64 md:w-80 md:h-80 rounded-full bg-black border-[8px] border-gray-800 shadow-2xl overflow-hidden flex items-center justify-center relative transition-transform duration-700 ${isPlayingLocally ? 'animate-[spin_10s_linear_infinite] scale-100' : 'scale-95'}`}>
            {now?.coverUrl ? (
              <img src={now.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-90" />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-blue-900 to-gray-900 flex items-center justify-center opacity-90">
                <svg className="w-24 h-24 text-gray-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
              </div>
            )}
            
            {/* Plak Ortası */}
            <div className="absolute w-12 h-12 bg-gray-900 rounded-full border-2 border-gray-800 z-20 flex items-center justify-center">
               <div className="w-3 h-3 bg-gray-500 rounded-full"></div>
            </div>
            
            {/* Oynat/Duraklat İkonu Hover'da */}
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-30">
               {isPlayingLocally ? (
                 <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               ) : (
                 <svg className="w-16 h-16 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
               )}
            </div>
          </div>
        </div>

        <audio ref={audioRef} />
        
        {now?.playing ? (
          <div className="text-center mb-6">
            <h2 className="text-2xl font-black text-white mb-1 truncate max-w-[280px] md:max-w-[320px]">{now.title}</h2>
            <p className="text-gray-400 font-medium truncate max-w-[280px] md:max-w-[320px]">{now.artist}</p>
          </div>
        ) : (
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold text-gray-500 mb-1">Radyo Bekliyor</h2>
            <p className="text-gray-600 text-sm">Şarkı ekleyin ve kuyruğu başlatın</p>
          </div>
        )}

        {/* Şarkı Sözleri */}
        <div className="w-full bg-black/40 rounded-xl p-4 h-32 overflow-y-auto relative mask-image-b text-center no-scrollbar">
          {lines.length > 0 ? (
            <div className="flex flex-col gap-4 py-8">
              {lines.map((line, i) => (
                <p 
                  key={i} 
                  className={`transition-all duration-300 text-lg md:text-xl font-medium ${
                    i === activeLine 
                      ? "text-blue-400 scale-110 drop-shadow-[0_0_10px_rgba(59,130,246,0.8)]" 
                      : i < activeLine ? "text-gray-600" : "text-gray-400"
                  }`}
                >
                  {line.text}
                </p>
              ))}
            </div>
          ) : now?.playing ? (
            <div className="flex items-center justify-center h-full text-gray-600 italic">
              Bu şarkı için söz bulunmuyor
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
