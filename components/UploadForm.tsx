"use client";

import { useState } from "react";
import { UploadCloud, ImageIcon, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CATEGORIES = ["Akustik", "Alternatif", "Arabesk", "Elektronik", "Hip-Hop / Rap", "Pop", "Rock", "R&B", "Klasik", "Caz / Blues"];
const GENRES = ["Türkçe Pop", "Türk Sanat Müziği", "Türk Halk Müziği", "Türkü", "Anadolu Rock", "Özgün Müzik", "Trap", "Drill", "Deep House", "Slow"];

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [lyricsLrc, setLyricsLrc] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const [isCatOpen, setIsCatOpen] = useState(false);
  const [isGenOpen, setIsGenOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const f = e.target.files[0];
      setFile(f);
      
      const audio = new Audio(URL.createObjectURL(f));
      audio.onloadedmetadata = () => {
        setDurationSec(audio.duration);
      };
    }
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setCoverFile(e.target.files[0]);
    }
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
    if (!file || !title || !artist) return alert("Dosya, isim ve sanatçı zorunlu!");
    setLoading(true);

    try {
      // get audio s3 url
      const uRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type })
      });
      
      const uData = await uRes.json();
      if (!uRes.ok) throw new Error(uData.error || "Şarkı yükleme bağlantısı oluşturulamadı.");
      
      const { uploadUrl, key } = uData;
      await fetch(uploadUrl, { method: "PUT", body: file, headers: { "Content-Type": file.type } });

      let cKey = undefined;
      if (coverFile) {
        const coverURes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: coverFile.name, contentType: coverFile.type })
        });
        const coverData = await coverURes.json();
        if (!coverURes.ok) throw new Error(coverData.error || "Kapak yükleme bağlantısı oluşturulamadı.");
        
        cKey = coverData.key;
        await fetch(coverData.uploadUrl, { method: "PUT", body: coverFile, headers: { "Content-Type": coverFile.type } });
      }

      const res = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist,
          fileKey: key,
          durationSec: durationSec ? Math.max(1, Math.floor(durationSec)) : 1, // Must be positive for Zod
          categories: selectedCategories,
          genres: selectedGenres,
          lyricsLrc,
          coverKey: cKey,
          youtubeUrl
        })
      });

      const data = await res.json();
      
      if (res.ok) {
        setIsOpen(false);
        setFile(null);
        setCoverFile(null);
        setTitle("");
        setArtist("");
        setSelectedCategories([]);
        setSelectedGenres([]);
        setLyricsLrc("");
        setYoutubeUrl("");
        onUploadSuccess();
      } else {
        throw new Error(data.error || "Şarkı kaydedilemedi.");
      }
    } catch (e: any) {
      alert(e.message || "Hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="group relative flex items-center justify-between w-full rounded-2xl bg-gradient-to-r from-zinc-900/80 to-black/80 border border-white/[0.05] p-5 shadow-2xl transition-all hover:border-[#D4AF37]/50"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4AF37]/10 text-[#D4AF37] transition-transform group-hover:scale-110">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black uppercase tracking-widest text-white">Yeni Şarkı Yükle</h3>
            <p className="text-xs text-zinc-500 font-medium mt-0.5">MP3 / WAV formatında eserini ekle</p>
          </div>
        </div>
        <div className={`rounded-full border border-white/10 p-2 text-zinc-500 transition-transform ${isOpen ? "rotate-180 bg-white/5" : "group-hover:bg-[#D4AF37] group-hover:text-black group-hover:border-[#D4AF37]"}`}>
          <ChevronDown className="h-4 w-4" />
        </div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-visible mt-4 relative z-50"
          >
            <div className="rounded-3xl border border-white/[0.05] bg-gradient-to-b from-zinc-900/60 to-[#050505]/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl flex flex-col gap-6 relative">
              
              <button onClick={() => setIsOpen(false)} className="absolute top-6 right-6 text-zinc-500 hover:text-white text-xs font-bold uppercase tracking-widest">Kapat</button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Şarkı Adı</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn. Gece Yarısı Sinyali"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all focus:border-[#D4AF37]/40 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Sanatçı</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Örn. Thendisch"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all focus:border-[#D4AF37]/40 focus:shadow-[0_0_0_3px_rgba(212,175,55,0.1)]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Ses Dosyası (.mp3 / .wav)</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-white/[0.12] bg-black/30 px-4 py-6 text-center transition-colors hover:border-[#D4AF37]/40 hover:bg-[#D4AF37]/5">
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
