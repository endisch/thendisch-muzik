"use client";

import { useEffect, useRef, useState } from "react";
import { parseLrc, currentLineIndex, LrcLine } from "@/lib/lrc";

type NowPlaying = {
  playing: boolean;
  songId?: string;
  title?: string;
  artist?: string;
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

  // Şu an çalan şarkıyı periyodik olarak sunucudan çeker ve senkronize eder
  useEffect(() => {
    let cancelled = false;

    async function poll() {
      const res = await fetch("/api/now-playing");
      const data: NowPlaying = await res.json();
      if (cancelled) return;

      setNow((prev) => {
        // Şarkı değiştiyse player'ı yeni kaynağa ve doğru saniyeye ayarla
        if (data.songId && data.songId !== prev?.songId && audioRef.current) {
          audioRef.current.src = data.playbackUrl ?? "";
          audioRef.current.currentTime = data.elapsedSec ?? 0;
          audioRef.current.play().catch(() => {});
          setLines(data.lyricsLrc ? parseLrc(data.lyricsLrc) : []);
          reportedRef.current = null;
        }
        return data;
      });

      // %80 dinlendiyse dinleme hakkını sunucuya bildir (bir kez)
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
    const interval = setInterval(poll, 5000); // 5 sn'de bir senkron kontrolü
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  // Şarkı sözlerini oynatma anına göre vurgula
  useEffect(() => {
    if (!audioRef.current || lines.length === 0) return;
    const el = audioRef.current;
    const onTimeUpdate = () => {
      setActiveLine(currentLineIndex(lines, el.currentTime));
    };
    el.addEventListener("timeupdate", onTimeUpdate);
    return () => el.removeEventListener("timeupdate", onTimeUpdate);
  }, [lines]);

  return (
    <div className="radio-player">
      <audio ref={audioRef} />
      {now?.playing ? (
        <>
          <h2>{now.title}</h2>
          <p>{now.artist}</p>
        </>
      ) : (
        <p>Kuyrukta şarkı bekleniyor...</p>
      )}

      <div className="lyrics">
        {lines.map((line, i) => (
          <p key={i} className={i === activeLine ? "active" : ""}>
            {line.text}
          </p>
        ))}
      </div>
    </div>
  );
}
