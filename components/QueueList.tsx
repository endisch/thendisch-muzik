"use client";

import { useEffect, useState } from "react";

type QueuedSong = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  votesCount: number;
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

  if (loading) return <div className="mt-8 text-center text-gray-400 animate-pulse">Kuyruk yükleniyor...</div>;

  return (
    <div className="mt-8 bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 shadow-xl">
      <h3 className="text-2xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Sıradaki Şarkılar</h3>
      {queue.length === 0 ? (
        <p className="text-gray-400 text-center italic py-4">Kuyrukta şarkı yok. Hemen bir tane ekle ve dinletmeye başla!</p>
      ) : (
        <ul className="flex flex-col gap-3">
          {queue.map((song, idx) => (
            <li key={song.id} className="flex justify-between items-center p-4 rounded-xl bg-gray-800/50 hover:bg-gray-800 transition-all border border-gray-700 hover:border-gray-600 group">
              <div className="flex items-center gap-4">
                <span className="font-black text-xl text-gray-600 group-hover:text-gray-400 transition-colors w-6 text-center">{idx + 1}</span>
                <div className="flex flex-col">
                  <span className="font-bold text-white text-lg">{song.title}</span>
                  <span className="text-sm text-gray-400">{song.artist}</span>
                </div>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="text-sm font-medium text-gray-500 bg-gray-900/50 px-3 py-1 rounded-full">
                  {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, "0")}
                </div>
                
                <div className="flex flex-col items-center gap-1">
                  <button 
                    onClick={() => handleVote(song.id)}
                    className="p-2 rounded-full hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 transition-all focus:outline-none"
                    title="Oy Ver"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 15l7-7 7 7" />
                    </svg>
                  </button>
                  <span className="text-xs font-bold text-blue-400">{song.votesCount} Oy</span>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
