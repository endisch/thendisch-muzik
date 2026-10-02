"use client";

import { useState, useRef, useEffect } from "react";
import { Music, Play, Pause, Trophy } from "lucide-react";

type TopSong = {
  id: string;
  title: string;
  artist: string;
  coverUrl: string | null;
  playbackUrl: string;
  monthlyVotes: number;
};

export default function TopListClient({ initialSongs }: { initialSongs: TopSong[] }) {
  const [songs, setSongs] = useState(initialSongs);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isVoting, setIsVoting] = useState<string | null>(null);

  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
    }
    const audio = audioRef.current;

    const handleEnded = () => setPlayingId(null);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.pause();
    };
  }, []);

  const togglePlay = (songId: string, playbackUrl: string) => {
    if (!audioRef.current) return;

    if (playingId === songId) {
      audioRef.current.pause();
      setPlayingId(null);
    } else {
      audioRef.current.src = playbackUrl;
      audioRef.current.play().catch(e => console.error("Oynatma hatası:", e));
      setPlayingId(songId);
    }
  };

  const handleVote = async (songId: string) => {
    setIsVoting(songId);
    try {
      const res = await fetch("/api/songs/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      if (res.ok) {
        setSongs(prev => prev.map(s => s.id === songId ? { ...s, monthlyVotes: s.monthlyVotes + 1 } : s));
      } else {
        const error = await res.json();
        alert(error.error || "Oy verirken bir hata oluştu");
      }
    } catch (error) {
      alert("Oy verirken bir hata oluştu");
    } finally {
      setIsVoting(null);
    }
  };

  if (songs.length === 0) {
    return (
      <div className="chart-empty">
        <Music className="h-8 w-8 text-[#adb5c0]" />
        <h3>Henüz parça yok</h3>
        <p>Yeni parçalar eklendikçe burada görünecek.</p>
      </div>
    );
  }

  return (
    <ul className="chart-song-list">
      {songs.map((song, idx) => (
        <li key={song.id} className="chart-song group">

          {/* Rank */}
          <div className="chart-song-rank">
            {idx + 1}
          </div>

          {/* Cover */}
          <div className="chart-song-cover">
            {song.coverUrl ? (
              <img src={song.coverUrl} alt="Parça kapağı" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-8 h-8 text-[#adb5c0]" />
            )}

            {/* Oynatma Butonu Overlay */}
            <button
              onClick={() => togglePlay(song.id, song.playbackUrl)}
              aria-label={playingId === song.id ? `${song.title} parçasını duraklat` : `${song.title} parçasını çal`}
              className="chart-song-play"
            >
              {playingId === song.id ? (
                <Pause className="w-8 h-8 text-[#ff6c55]" fill="currentColor" />
              ) : (
                <Play className="w-8 h-8 text-[#f7f8fa] ml-1" fill="currentColor" />
              )}
            </button>
          </div>

          {/* Info */}
          <div className="chart-song-info">
            <h3>{song.title}</h3>
            <p>{song.artist}</p>
          </div>

          {/* Oylama ve Oy Sayısı */}
          <div className="chart-song-voting">
            <button
              onClick={() => handleVote(song.id)}
              disabled={isVoting === song.id}
              className="chart-vote-button"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wide">{isVoting === song.id ? "..." : "Oy ver"}</span>
            </button>
            <div className="chart-vote-count">
              <span>{song.monthlyVotes}</span>
              <span>Oy</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
