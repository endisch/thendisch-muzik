"use client";

import { useState } from "react";
import { CATEGORIES, GENRES } from "@/lib/constants";
import { motion, AnimatePresence } from "framer-motion";
import { Music2, X, UploadCloud, Image as ImageIcon } from "lucide-react";

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [lyricsLrc, setLyricsLrc] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    const url = URL.createObjectURL(selected);
    const audio = new Audio(url);
    audio.addEventListener("loadedmetadata", () => {
      setDurationSec(audio.duration);
      URL.revokeObjectURL(url);
    });
  };

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) setCoverFile(selected);
  };

  const handleCategoryToggle = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  };

  const handleGenreToggle = (gen: string) => {
    setSelectedGenres((prev) =>
      prev.includes(gen) ? prev.filter((g) => g !== gen) : [...prev, gen]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !durationSec || !title || !artist) {
      setError("Lütfen gerekli tüm alanları doldurun.");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!urlRes.ok) throw new Error("Upload URL alınamadı");
      const { uploadUrl, key } = await urlRes.json();

      let coverKey = undefined;
      if (coverFile) {
        const coverUrlRes = await fetch("/api/upload-url", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ filename: coverFile.name, contentType: coverFile.type }),
        });
        if (!coverUrlRes.ok) throw new Error("Kapak Upload URL alınamadı");
        const coverData = await coverUrlRes.json();
        const coverUploadRes = await fetch(coverData.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": coverFile.type },
          body: coverFile,
        });
        if (!coverUploadRes.ok) throw new Error("Kapak yüklenirken hata oluştu");
        coverKey = coverData.key;
      }

      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Dosya yüklenirken hata oluştu");

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
      if (!songRes.ok) {
        const d = await songRes.json();
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
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/[0.06] bg-zinc-900/40 backdrop-blur-3xl transition-all">
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex w-full items-center justify-between px-6 py-5 text-left focus:outline-none"
      >
        <span className="flex items-center gap-2 font-bold text-white text-lg">
          <Music2 className="h-5 w-5 text-emerald-500" />
          Yeni Şarkı Yükle
        </span>
        <motion.span animate={{ rotate: isOpen ? 90 : 0 }} transition={{ duration: 0.25 }}>
          <X className={`h-5 w-5 ${isOpen ? 'text-white' : 'text-zinc-500'}`} />
        </motion.span>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <div className="space-y-5 px-6 pb-6">
              {error && <div className="text-red-400 bg-red-400/10 p-3 rounded-lg text-sm font-medium">{error}</div>}
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Şarkı Adı</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn. Gece Yarısı Sinyali"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
                    required
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Sanatçı</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Örn. CEMİLECEM"
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-white placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Ses Dosyası (.mp3)</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-black/30 px-4 py-4 text-center transition-colors hover:border-emerald-500/30">
                    <UploadCloud className="h-5 w-5 text-emerald-500/70" />
                    <span className="text-xs text-zinc-400">{file ? file.name : "Ses dosyasını seç"}</span>
                    {durationSec && <span className="text-[10px] text-emerald-500 font-mono">{Math.floor(durationSec)} sn</span>}
                    <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" required />
                  </label>
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Kapak Görseli</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/[0.12] bg-black/30 px-4 py-4 text-center transition-colors hover:border-zinc-500/30">
                    <ImageIcon className="h-5 w-5 text-zinc-500/70" />
                    <span className="text-xs text-zinc-400">{coverFile ? coverFile.name : "Opsiyonel görsel seç"}</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Kategoriler</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border border-white/[0.08] rounded-xl bg-black/40 no-scrollbar">
                    {CATEGORIES.map(cat => (
                      <label key={cat} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-white/5 ${selectedCategories.includes(cat) ? 'bg-emerald-500/20 text-emerald-400 font-bold border-emerald-500/50' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
                        <input 
                          type="checkbox" 
                          checked={selectedCategories.includes(cat)} 
                          onChange={() => handleCategoryToggle(cat)} 
                          className="hidden"
                        />
                        {cat}
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Türler</label>
                  <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-3 border border-white/[0.08] rounded-xl bg-black/40 no-scrollbar">
                    {GENRES.map(gen => (
                      <label key={gen} className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-full cursor-pointer transition-colors border border-white/5 ${selectedGenres.includes(gen) ? 'bg-emerald-500/20 text-emerald-400 font-bold border-emerald-500/50' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800'}`}>
                        <input 
                          type="checkbox" 
                          checked={selectedGenres.includes(gen)} 
                          onChange={() => handleGenreToggle(gen)}
                          className="hidden" 
                        />
                        {gen}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">Şarkı Sözleri (LRC - Opsiyonel)</label>
                  <textarea
                    value={lyricsLrc}
                    onChange={(e) => setLyricsLrc(e.target.value)}
                    placeholder="[00:12.50] İlk satır..."
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)] h-20 resize-none font-mono"
                  />
                </div>
                <div>
                  <label className="mb-1.5 block font-mono text-[10px] uppercase tracking-[0.15em] text-zinc-500">YouTube Klip Linki (Opsiyonel)</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-xl border border-white/[0.08] bg-black/40 px-4 py-3 text-sm text-zinc-300 placeholder:text-zinc-600 outline-none transition-all focus:border-emerald-500/40 focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-xl bg-emerald-500 py-3.5 text-sm font-black text-black transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_0_30px_2px_rgba(16,185,129,0.35)] active:scale-[0.99] disabled:opacity-50 disabled:hover:scale-100 disabled:hover:shadow-none"
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
