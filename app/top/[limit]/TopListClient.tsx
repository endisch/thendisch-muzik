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
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Music className="w-12 h-12 text-zinc-800 mb-6" />
        <h3 className="text-xl font-bold text-white mb-2">Henüz Kimse Yok</h3>
        <p className="text-zinc-500 max-w-sm">Bu listede henüz hiçbir parça bulunmuyor.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {songs.map((song, idx) => (
        <li key={song.id} className="group flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-3xl bg-black/40 hover:bg-black/80 transition-all duration-500 border border-white/[0.03] hover:border-[#D4AF37]/30 relative overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

          {/* Rank */}
          <div className="text-4xl md:text-5xl font-black text-zinc-800 group-hover:text-[#D4AF37] w-12 text-center transition-colors duration-500 shrink-0">
            {idx + 1}
          </div>
          
          {/* Cover */}
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg relative z-10 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-shadow duration-500">
            {song.coverUrl ? (
              <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            ) : (
              <Music className="w-8 h-8 text-zinc-700" />
            )}
            
            {/* Oynatma Butonu Overlay */}
            <button 
              onClick={() => togglePlay(song.id, song.playbackUrl)}
              className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm"
            >
              {playingId === song.id ? (
                <Pause className="w-8 h-8 text-[#D4AF37]" fill="currentColor" />
              ) : (
                <Play className="w-8 h-8 text-white ml-1" fill="currentColor" />
              )}
            </button>
          </div>

          {/* Info */}
          <div className="flex-1 relative z-10 min-w-0">
            <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-[#D4AF37] transition-colors">{song.title}</h3>
            <p className="text-zinc-500 truncate">{song.artist}</p>
          </div>
          
          {/* Oylama ve Oy Sayısı */}
          <div className="flex items-center gap-4 shrink-0 relative z-10">
            <button
              onClick={() => handleVote(song.id)}
              disabled={isVoting === song.id}
              className="flex items-center gap-2 bg-white/5 hover:bg-[#D4AF37]/20 border border-white/10 hover:border-[#D4AF37]/50 text-white hover:text-[#D4AF37] px-4 py-2 rounded-xl transition-all duration-300 disabled:opacity-50"
            >
              <Trophy className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-widest">{isVoting === song.id ? "..." : "Oy Ver"}</span>
            </button>
            <div className="flex flex-col items-center justify-center bg-black/50 rounded-2xl px-6 py-4 border border-white/5 w-24">
              <span className="text-3xl font-black text-white group-hover:text-[#D4AF37] transition-colors leading-none">{song.monthlyVotes}</span>
              <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-2">Oy</span>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
