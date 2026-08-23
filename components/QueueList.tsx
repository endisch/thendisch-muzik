"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants, AnimatePresence } from "framer-motion";
import { ChevronUp, ArrowUp, ArrowDown, Minus, Music, X, Trophy } from "lucide-react";

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
        up ? "text-[#D4AF37]" : "text-zinc-500"
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
        alert(error.error || "Oy verirken bir hata oluştu");
      }
    } catch (error) {
      alert("Oy verirken bir hata oluştu");
    } finally {
      setIsVoting(false);
    }
  };

  if (loading) return <div className="mt-8 text-center text-zinc-500 animate-pulse font-medium">Kuyruk yükleniyor...</div>;

  return (
    <>
      <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-3xl relative z-10">
        <div className="flex items-center justify-between px-6 pt-6 mb-4">
          <h3 className="font-bold text-white text-lg">Sırada</h3>
          <span className="font-mono text-[10px] uppercase tracking-[0.15em] text-[#D4AF37]">
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
                onClick={() => setSelectedSong(song)}
                className="group flex items-center gap-3 rounded-xl px-4 py-3 transition-colors duration-300 hover:bg-white/5 cursor-pointer"
              >
                <div className="flex w-6 shrink-0 flex-col items-center">
                  <span className="font-mono text-xs text-zinc-600 group-hover:text-[#D4AF37] transition-colors">{idx + 1}</span>
                  <TrendBadge value={0} />
                </div>
                
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-zinc-800 flex items-center justify-center border border-white/5 group-hover:border-[#D4AF37]/50 transition-colors">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <Music className="w-4 h-4 text-zinc-600" />
                  )}
                </div>
                
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">{song.title}</p>
                  <p className="truncate text-xs text-zinc-500">{song.artist}</p>
                </div>
                
                <span className="shrink-0 font-mono text-xs tabular-nums text-zinc-600 mr-2">
                  {Math.floor(song.durationSec / 60)}:{(song.durationSec % 60).toString().padStart(2, "0")}
                </span>
                
                <div className="flex flex-col items-center justify-center bg-black/40 px-3 py-1.5 rounded-lg border border-white/5 group-hover:bg-[#D4AF37]/10 group-hover:border-[#D4AF37]/30 transition-all">
                  <span className="font-mono text-xs tabular-nums font-bold text-white group-hover:text-[#D4AF37]">{song.votesCount}</span>
                  <span className="text-[8px] uppercase tracking-widest text-zinc-500">Oy</span>
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
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
              onClick={() => setSelectedSong(null)}
            />
            
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-[#121318] border border-white/10 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
            >
              {/* Close Button */}
              <button 
                onClick={() => setSelectedSong(null)}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center bg-black/50 hover:bg-white/10 rounded-full text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Cover Header */}
              <div className="relative h-64 w-full bg-zinc-900 border-b border-white/5">
                {selectedSong.coverUrl ? (
                  <>
                    <img src={selectedSong.coverUrl} alt="Cover" className="w-full h-full object-cover opacity-60" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#121318] to-transparent" />
                  </>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-zinc-800 to-black">
                    <Music className="w-20 h-20 text-zinc-700" />
                  </div>
                )}
                
                {/* Mini Cover Overlay */}
                <div className="absolute -bottom-8 left-6 w-24 h-24 rounded-2xl border-4 border-[#121318] shadow-2xl overflow-hidden bg-black">
                  {selectedSong.coverUrl ? (
                    <img src={selectedSong.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-8 h-8 text-zinc-700" />
                    </div>
                  )}
                </div>
              </div>

              {/* Info Body */}
              <div className="pt-12 pb-6 px-6 flex flex-col gap-6">
                <div>
                  <h2 className="text-2xl font-black text-white leading-tight mb-1">{selectedSong.title}</h2>
                  <p className="text-zinc-400 font-medium">{selectedSong.artist}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Şu Anki Oyu</p>
                    <p className="text-3xl font-black text-[#D4AF37]">{selectedSong.votesCount}</p>
                  </div>
                  <div className="flex-1 bg-black/50 border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center">
                    <p className="text-[10px] uppercase tracking-widest text-zinc-500 mb-1">Süre</p>
                    <p className="text-3xl font-black text-white">
                      {Math.floor(selectedSong.durationSec / 60)}:{(selectedSong.durationSec % 60).toString().padStart(2, "0")}
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => handleVote(selectedSong.id)}
                  disabled={isVoting}
                  className="w-full py-4 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] text-black font-black uppercase tracking-widest text-sm transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 shadow-[0_0_30px_rgba(212,175,55,0.3)]"
                >
                  {isVoting ? "Bekleyin..." : (
                    <>
                      <Trophy className="w-5 h-5" /> Oy Ver & Sıraya Yükselt
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
