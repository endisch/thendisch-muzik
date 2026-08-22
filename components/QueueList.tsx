"use client";

import { useEffect, useState } from "react";

type QueuedSong = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  votesCount: number;
  coverUrl?: string | null;
};

export default function QueueList({ refreshTrigger }: { refreshTrigger: number }) {
  const [queue, setQueue] = useState<QueuedSong[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/songs");
      const data = await res.json();
      if (data.queue) {
        setQueue(data.queue);
      }
    } catch (e) {
      console.error("Kuyruk çekilemedi", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
  }, [refreshTrigger]);

  const handleVote = async (songId: string) => {
    try {
      const res = await fetch("/api/songs/vote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ songId }),
      });
      if (res.ok) {
        fetchQueue();
      } else {
        const error = await res.json();
        alert(error.error || "Oy verirken bir hata oluştu");
      }
    } catch (error) {
      alert("Oy verirken bir hata oluştu");
    }
  };

  if (loading) return <div className="mt-8 text-center text-zinc-500 animate-pulse font-medium">Kuyruk yükleniyor...</div>;

  return (
    <div className="mt-4 bg-zinc-950/50 backdrop-blur-3xl rounded-[2rem] p-6 border border-white/5 shadow-2xl">
      <div className="flex items-center justify-between mb-8 px-2">
        <h3 className="text-2xl font-black text-white tracking-tight">Sıradaki <span className="text-emerald-500">Şarkılar</span></h3>
        <div className="text-sm font-bold text-zinc-500 bg-zinc-900 px-4 py-1.5 rounded-full">{queue.length} Parça</div>
      </div>
      
      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
          <svg className="w-16 h-16 mb-4 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>
          <p className="font-medium">Kuyrukta şarkı yok.</p>
        </div>
      ) : (
        <ul className="flex flex-col gap-1">
          {queue.map((song, idx) => (
            <li key={song.id} className="flex justify-between items-center p-3 rounded-2xl hover:bg-zinc-900/80 transition-all group">
              <div className="flex items-center gap-4">
                <span className="font-bold text-lg text-zinc-700 group-hover:text-emerald-500 transition-colors w-6 text-center">{idx + 1}</span>
                
                {/* Kapak Görseli Thumbnail */}
                <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg group-hover:shadow-emerald-500/10 transition-shadow">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-6 h-6 text-zinc-700" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
                  )}
                </div>

                <div className="flex flex-col">
                  <span className="font-bold text-gray-200 text-lg group-hover:text-white transition-colors">{song.title}</span>
                  <span className="text-sm text-zinc-500 font-medium">{song.artist}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6 pr-2">
                <div className="text-sm font-semibold text-zinc-600">
                  {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, "0")}
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="text-sm font-black text-zinc-500 w-8 text-right">{song.votesCount}</span>
                  <button 
                    onClick={() => handleVote(song.id)}
                    className="p-2.5 rounded-full bg-zinc-900/50 hover:bg-emerald-500 text-zinc-500 hover:text-black transition-all focus:outline-none shadow-sm hover:shadow-emerald-500/50"
                    title="Oy Ver"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
