"use client";

import { useState } from "react";
import { UploadCloud, ImageIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Akustik", "Alternatif", "Arabesk", "Elektronik", "Hip-Hop / Rap", "Pop", "Rock", "R&B", "Klasik", "Caz / Blues"];
const GENRES = ["Türkçe Pop", "Türk Sanat Müziği", "Türk Halk Müziği", "Türkü", "Anadolu Rock", "Özgün Müzik", "Trap", "Drill", "Deep House", "Slow"];

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [lyricsLrc, setLyricsLrc] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);

  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isGenOpen, setIsGenOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) {
      setFile(f);
      const audio = new Audio(URL.createObjectURL(f));
      audio.onloadedmetadata = () => {
        setDurationSec(audio.duration);
      };
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setCoverFile(f);
  };

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories(prev => 
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  const handleGenreToggle = (gen: string) => {
    setSelectedGenres(prev => 
      prev.includes(gen) ? prev.filter(g => g !== gen) : [...prev, gen]
    );
  };

  const handleSubmit = async () => {
    if (!file || !title || !artist || !durationSec) {
      setError("Lütfen şarkı adı, sanatçı ve ses dosyasını eksiksiz girin.");
      return;
    }
    
    // Max duration ~10 minutes
    if (durationSec > 600) {
      setError("Şarkı çok uzun. (Maksimum 10 dakika)");
      return;
    }

    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type || "audio/mpeg" }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      const { uploadUrl, key } = data;

      try {
        const uploadRes = await fetch(uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "audio/mpeg" },
          body: file,
        });
        if (!uploadRes.ok) throw new Error("Dosya yüklenemedi (R2 CORS veya izin hatası).");
      } catch (uploadError: any) {
        throw new Error("R2 Sunucusuna yükleme başarısız. Detay: " + uploadError.message);
      }

      let coverKey = null;
      if (coverFile) {
        const cRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: coverFile.name, contentType: coverFile.type }),
        });
        const cData = await cRes.json();
        if (cData.error) throw new Error(cData.error);
        const coverUploadUrl = cData.uploadUrl;
        coverKey = cData.key;

        try {
          const cUploadRes = await fetch(coverUploadUrl, {
            method: "PUT",
            headers: { "Content-Type": coverFile.type },
            body: coverFile,
          });
          if (!cUploadRes.ok) throw new Error("Kapak görseli yüklenemedi.");
        } catch (uploadError: any) {
          throw new Error("Kapak görseli yüklenemedi. Detay: " + uploadError.message);
        }
      }

      const songRes = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title, artist, fileKey: key, coverKey, durationSec,
          categories: selectedCategories, genres: selectedGenres,
          lyricsLrc: lyricsLrc || undefined,
          youtubeUrl: youtubeUrl || undefined,
        }),
      });
      const d = await songRes.json();
      if (!songRes.ok) {
        throw new Error(d.error || "Şarkı kaydedilemedi");
      }

      setFile(null);
      setCoverFile(null);
      setTitle("");
      setArtist("");
      setDurationSec(null);
      setSelectedCategories([]);
      setSelectedGenres([]);
      setLyricsLrc("");
      setYoutubeUrl("");
      setIsOpen(false);
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message || "Bir hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 sm:p-8 relative z-20">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xl font-bold text-white tracking-tight flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center">
            <UploadCloud className="w-4 h-4 text-[#D4AF37]" />
          </span>
          Yeni Şarkı Yükle
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm font-bold text-[#D4AF37] bg-[#D4AF37]/10 px-4 py-2 rounded-full hover:bg-[#D4AF37]/20 transition-colors"
        >
          {isOpen ? "Kapat" : "Başla"}
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-visible"
          >
            <div className="space-y-6 pt-6">
              {error && <div className="text-red-400 bg-red-400/10 p-4 rounded-xl text-sm font-medium border border-red-500/20">{error}</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Şarkı Adı</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn. Gece Yarısı Sinyali"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-[#D4AF37]/40 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Sanatçı</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Örn. Thendisch"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-[#D4AF37]/40 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Ses Dosyası (.mp3 / .wav)</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.12] bg-black/30 px-4 py-6 text-center transition-colors hover:border-[#D4AF37]/30 hover:bg-[#D4AF37]/5">
                    <UploadCloud className="h-6 w-6 text-[#D4AF37]/70" />
                    <span className="text-xs text-zinc-400 font-medium">{file ? file.name : "Ses dosyasını seç"}</span>
                    {durationSec && <span className="text-[10px] text-[#D4AF37] font-mono font-bold bg-[#D4AF37]/10 px-2 py-1 rounded-md">{Math.floor(durationSec)} sn</span>}
                    <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" required />
                  </label>
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Kapak Görseli</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.12] bg-black/30 px-4 py-6 text-center transition-colors hover:border-zinc-500/30 hover:bg-white/[0.02]">
                    <ImageIcon className="h-6 w-6 text-zinc-500/70" />
                    <span className="text-xs text-zinc-400 font-medium">{coverFile ? coverFile.name : "Opsiyonel görsel seç"}</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                {/* Kategori Dropdown */}
                <div className="relative">
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Kategoriler</label>
                  <div 
                    onClick={() => setIsCatOpen(!isCatOpen)}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3.5 text-sm text-white outline-none cursor-pointer hover:border-[#D4AF37]/40 transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{selectedCategories.length > 0 ? selectedCategories.join(", ") : "Kategori Seçin..."}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isCatOpen ? "rotate-180" : ""}`} />
                  </div>
                  <AnimatePresence>
                    {isCatOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full mt-2 bg-[#1A1C23] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50 max-h-48 overflow-y-auto no-scrollbar"
                      >
                        {CATEGORIES.map(cat => (
                          <label key={cat} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] cursor-pointer border-b border-white/[0.02] last:border-0">
                            <input 
                              type="checkbox" 
                              checked={selectedCategories.includes(cat)} 
                              onChange={() => handleCategoryToggle(cat)} 
                              className="w-4 h-4 rounded border-zinc-700 text-[#D4AF37] focus:ring-[#D4AF37] bg-black/50 accent-[#D4AF37]"
                            />
                            <span className={`text-sm ${selectedCategories.includes(cat) ? 'text-[#D4AF37] font-bold' : 'text-zinc-300'}`}>{cat}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tür Dropdown */}
                <div className="relative">
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Türler</label>
                  <div 
                    onClick={() => setIsGenOpen(!isGenOpen)}
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3.5 text-sm text-white outline-none cursor-pointer hover:border-[#D4AF37]/40 transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{selectedGenres.length > 0 ? selectedGenres.join(", ") : "Tür Seçin..."}</span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isGenOpen ? "rotate-180" : ""}`} />
                  </div>
                  <AnimatePresence>
                    {isGenOpen && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full mt-2 bg-[#1A1C23] border border-white/[0.1] rounded-xl shadow-2xl overflow-hidden z-50 max-h-48 overflow-y-auto no-scrollbar"
                      >
                        {GENRES.map(gen => (
                          <label key={gen} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] cursor-pointer border-b border-white/[0.02] last:border-0">
                            <input 
                              type="checkbox" 
                              checked={selectedGenres.includes(gen)} 
                              onChange={() => handleGenreToggle(gen)}
                              className="w-4 h-4 rounded border-zinc-700 text-[#D4AF37] focus:ring-[#D4AF37] bg-black/50 accent-[#D4AF37]" 
                            />
                            <span className={`text-sm ${selectedGenres.includes(gen) ? 'text-[#D4AF37] font-bold' : 'text-zinc-300'}`}>{gen}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Şarkı Sözleri (LRC - Opsiyonel)</label>
                  <textarea
                    value={lyricsLrc}
                    onChange={(e) => setLyricsLrc(e.target.value)}
                    placeholder="[00:12.50] İlk satır..."
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all focus:border-[#D4AF37]/40 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)] h-24 resize-none font-mono"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">YouTube Klip Linki (Opsiyonel)</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3.5 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all focus:border-[#D4AF37]/40 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#F3E5AB] py-4 text-sm font-black text-black transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_40px_rgba(212,175,55,0.3)] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none uppercase tracking-wider mt-4"
              >
                {loading ? "Yükleniyor..." : "Yükle ve Kuyruğa Ekle"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
