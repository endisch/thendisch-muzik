"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { ChevronUp, ArrowUp, ArrowDown, Minus } from "lucide-react";

type QueuedSong = {
  id: string;
  title: string;
  artist: string;
  durationSec: number;
  votesCount: number;
  coverUrl?: string | null;
};

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

function TrendBadge({ value }: { value: number }) {
  if (value === 0)
    return (
      <span className="flex items-center gap-0.5 font-mono text-[10px] text-zinc-600">
        <Minus className="h-2.5 w-2.5" />
      </span>
    );
  const up = value > 0;
  return (
    <span
      className={`flex items-center gap-0.5 font-mono text-[10px] tabular-nums ${
        up ? "text-emerald-500" : "text-zinc-500"
      }`}
    >
      {up ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(value)}
    </span>
  );
}

export default function QueueList({ refreshTrigger }: { refreshTrigger: number }) {
  const [queue, setQueue] = useState<QueuedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

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
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-3xl">
      <div className="flex items-center justify-between px-6 pt-6 mb-4">
        <h3 className="font-bold text-white text-lg">Sırada</h3>
        <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-emerald-500">
          {queue.length} şarkı
        </span>
      </div>
      
      {queue.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-zinc-500">
          <p className="font-medium">Kuyrukta şarkı yok.</p>
        </div>
      ) : (
        <motion.div
          initial={reduceMotion ? undefined : "hidden"}
          animate={reduceMotion ? undefined : "show"}
          variants={reduceMotion ? undefined : container}
          className="divide-y divide-white/[0.05] px-2 pb-2"
        >
          {queue.map((song, idx) => (
            <motion.div
              layout
              variants={reduceMotion ? undefined : rise}
              key={song.id}
              className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-300 hover:bg-zinc-800/50"
            >
              <div className="flex w-6 shrink-0 flex-col items-center">
                <span className="font-mono text-xs text-zinc-600">{idx + 1}</span>
                <TrendBadge value={0} />
              </div>
              
              <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-emerald-500/25 via-zinc-800 to-black">
                {song.coverUrl && <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />}
              </div>
              
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">{song.title}</p>
                <p className="truncate text-xs text-zinc-500">{song.artist}</p>
              </div>
              
              <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-600">
                {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, "0")}
              </span>
              
              <button
                onClick={() => handleVote(song.id)}
                className="flex shrink-0 flex-col items-center rounded-lg px-2.5 py-1.5 transition-all duration-300 text-zinc-500 hover:bg-emerald-500/10 hover:text-emerald-500 hover:shadow-[0_0_16px_0_rgba(16,185,129,0.25)]"
                aria-label="Oy ver"
              >
                <ChevronUp className="h-4 w-4" />
                <span className="font-mono text-[10px] tabular-nums">{song.votesCount}</span>
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
