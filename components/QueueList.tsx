"use client";

import { useEffect, useState } from "react";

type QueuedSong = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
};

export default function QueueList({ refreshTrigger }: { refreshTrigger: number }) {
  const [queue, setQueue] = useState<QueuedSong[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchQueue() {
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
    }
    fetchQueue();
  }, [refreshTrigger]);

  if (loading) return <div className="mt-4">Kuyruk yükleniyor...</div>;

  return (
    <div className="mt-8">
      <h3 className="text-xl font-bold mb-4">Sıradaki Şarkılar</h3>
      {queue.length === 0 ? (
        <p className="text-gray-500">Kuyrukta şarkı yok. Hemen bir tane ekle!</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {queue.map((song, idx) => (
            <li key={song.id} className="flex justify-between items-center p-3 border rounded bg-white dark:bg-gray-800">
              <div>
                <span className="font-bold text-gray-500 mr-3">{idx + 1}.</span>
                <span className="font-semibold">{song.title}</span>
                <span className="text-gray-600 dark:text-gray-400 ml-2">— {song.artist}</span>
              </div>
              <div className="text-sm text-gray-500">
                {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, "0")}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
