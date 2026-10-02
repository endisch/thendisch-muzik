"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants, AnimatePresence } from "framer-motion";
import { ArrowUp, ArrowDown, Minus, Music, X, Trophy } from "lucide-react";

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
      <span className="flex items-center gap-0.5 font-mono text-xs text-[#adb5c0]">
        <Minus className="h-2.5 w-2.5" />
      </span>
    );
  const up = value > 0;
  return (
    <span
      className={`flex items-center gap-0.5 font-mono text-xs tabular-nums ${
        up ? "text-[#ff6c55]" : "text-[#adb5c0]"
      }`}
    >
      {up ? <ArrowUp className="h-2.5 w-2.5" /> : <ArrowDown className="h-2.5 w-2.5" />}
      {Math.abs(value)}
    </span>
  );
}

export default function QueueList({ refreshTrigger = 0 }: { refreshTrigger?: number }) {
  const [queue, setQueue] = useState<QueuedSong[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSong, setSelectedSong] = useState<QueuedSong | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const reduceMotion = useReducedMotion();

  const fetchQueue = async () => {
    try {
      const res = await fetch("/api/songs");
      const data = await res.json();
      if (data.queue) {
        setQueue(data.queue);

        // Eğer modal açıksa içindeki datayı da güncelle
        if (selectedSong) {
          const updated = data.queue.find((s: QueuedSong) => s.id === selectedSong.id);
          if (updated) setSelectedSong(updated);
        }
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

  const handleVote = async (songId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setIsVoting(true);
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
        alert(error.error || "Oyun kaydedilemedi. Lütfen tekrar dene.");
      }
    } catch (error) {
      alert("Oyun kaydedilemedi. Lütfen tekrar dene.");
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) return <div className="mt-8 text-center text-[#adb5c0] animate-pulse font-medium">Dinleme sırası yükleniyor…</div>;

  return (
    <>
      <div className="rounded-none border border-[#2a3038] bg-[#12161b] relative z-10">
        <div className="flex items-center justify-between px-6 pt-6 mb-4">
          <h3 className="font-semibold text-[#f7f8fa] text-lg">Sırada</h3>
          <span className="font-mono text-xs uppercase tracking-[0.15em] text-[#ff6c55]">
            {queue.length} şarkı
          </span>
        </div>

        {queue.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[#adb5c0]">
            <p className="font-medium">Sırada henüz bir parça yok.</p>
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
                onClick={() => setSelectedSong(song)}
                className="group flex items-center gap-3 rounded-none px-3 py-4 sm:px-4 transition-colors duration-300 hover:bg-white/5 cursor-pointer"
              >
                <div className="flex w-6 shrink-0 flex-col items-center">
                  <span className="font-mono text-xs text-[#adb5c0] group-hover:text-[#ff6c55] transition-colors">{idx + 1}</span>
                  <TrendBadge value={0} />
                </div>

                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-none bg-[#1b222c] flex items-center justify-center border border-white/5 group-hover:border-[#ff543b]/50 transition-colors">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="Parça kapağı" className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-4 h-4 text-[#adb5c0]" />
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-semibold text-[#f7f8fa] group-hover:text-[#f7f8fa] transition-colors">{song.title}</p>
                  <p className="truncate text-xs text-[#adb5c0]">{song.artist}</p>
                </div>

                <span className="hidden shrink-0 font-mono text-xs tabular-nums text-[#adb5c0] sm:inline">
                  {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, "0")}
                </span>

                <div className="flex flex-col items-center justify-center bg-black/40 px-3 py-1.5 rounded-none border border-white/5 group-hover:bg-[#ff543b]/10 group-hover:border-[#ff543b]/30 transition-all">
                  <span className="font-mono text-xs tabular-nums font-semibold text-[#f7f8fa] group-hover:text-[#ff6c55]">{song.votesCount}</span>
                  <span className="text-xs uppercase tracking-widest text-[#adb5c0]">Oy</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* Şarkı Detay & Oylama Modalı */}
      <AnimatePresence>
        {selectedSong && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/80"
              onClick={() => setSelectedSong(null)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative flex max-h-[calc(100svh-32px)] w-full max-w-md flex-col overflow-y-auto rounded-none border border-white/10 bg-[#12161b] shadow-lg"
            >
              {/* Close Button */}
              <button
                onClick={() => setSelectedSong(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-white/10 rounded-none text-[#b8bec8] hover:text-[#f7f8fa] transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cover Header */}
              <div className="relative h-48 w-full shrink-0 bg-[#090b0e] border-b border-white/5 sm:h-64">
                {selectedSong.coverUrl ? (
                  <>
                    <img src={selectedSong.coverUrl} alt="Parça kapağı" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-black/40" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#12161b]">
                    <Music className="w-20 h-20 text-[#adb5c0]" />
                  </div>
                )}

                {/* Mini Cover Overlay */}
                <div className="absolute -bottom-8 left-6 w-24 h-24 rounded-none border-4 border-[#12161b] shadow-2xl overflow-hidden bg-black">
                  {selectedSong.coverUrl ? (
                    <img src={selectedSong.coverUrl} alt="Parça kapağı" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-[#adb5c0]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info Body */}
              <div className="pt-12 pb-6 px-6 flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-semibold text-[#f7f8fa] leading-tight mb-1">{selectedSong.title}</h2>
                  <p className="text-[#b8bec8] font-medium">{selectedSong.artist}</p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-black/50 border border-white/5 rounded-none p-4 flex flex-col items-center justify-center">
                    <p className="text-xs uppercase tracking-widest text-[#adb5c0] mb-1">Toplam oy</p>
                    <p className="text-3xl font-semibold text-[#ff6c55]">{selectedSong.votesCount}</p>
                  </div>
                  <div className="flex-1 bg-black/50 border border-white/5 rounded-none p-4 flex flex-col items-center justify-center">
                    <p className="text-xs uppercase tracking-widest text-[#adb5c0] mb-1">Süre</p>
                    <p className="text-3xl font-semibold text-[#f7f8fa]">
                      {Math.floor(selectedSong.durationSec / 60)}:{(selectedSong.durationSec % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleVote(selectedSong.id)}
                  disabled={isVoting}
                  className="w-full py-4 rounded-none bg-[#ff543b] text-[#090b0e] font-semibold uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                >
                  {isVoting ? "Kaydediliyor…" : (
                    <>
                      <Trophy className="w-5 h-5" /> Oy ver ve sırayı yükselt
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
