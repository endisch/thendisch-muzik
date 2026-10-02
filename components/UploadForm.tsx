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
    if (!file || !title || !artist) return alert("Ses dosyasını, şarkı adını ve sanatçıyı ekle.");
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
        aria-expanded={isOpen}
        className="group relative flex items-center justify-between w-full rounded-none bg-[#12161b] border border-white/[0.08] p-5 transition-colors hover:border-[#ff543b]/60"
      >
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-none bg-[#ff543b]/10 text-[#ff6c55] transition-colors">
            <UploadCloud className="h-5 w-5" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold tracking-wide text-[#f7f8fa]">Yeni parça yükle</h3>
            <p className="text-sm text-[#adb5c0] font-medium mt-0.5">MP3 veya WAV dosyanı paylaş</p>
          </div>
        </div>
        <div className={`rounded-none border border-white/10 p-2 text-[#adb5c0] transition-transform ${isOpen ? "rotate-180 bg-white/5" : "group-hover:bg-[#ff543b] group-hover:text-[#090b0e] group-hover:border-[#ff543b]"}`}>
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
            <div className="rounded-none border border-white/[0.08] bg-[#12161b] p-6 sm:p-8 flex flex-col gap-6 relative">

              <button onClick={() => setIsOpen(false)} className="self-end px-3 py-2 border border-white/[0.12] text-[#adb5c0] hover:text-[#f7f8fa] text-sm font-semibold">Kapat</button>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block font-mono text-sm tracking-[0.04em] text-[#adb5c0]">Şarkı adı</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Örn. Gece Yarısı Sinyali"
                    className="w-full rounded-none border border-white/[0.08] bg-[#090b0e] px-4 py-3 text-base text-[#f7f8fa] placeholder:text-[#adb5c0] outline-none transition-all focus:border-[#ff543b]/40 focus:shadow-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-sm tracking-[0.04em] text-[#adb5c0]">Sanatçı</label>
                  <input
                    type="text"
                    value={artist}
                    onChange={(e) => setArtist(e.target.value)}
                    placeholder="Örn. Thendisch"
                    className="w-full rounded-none border border-white/[0.08] bg-[#090b0e] px-4 py-3 text-base text-[#f7f8fa] placeholder:text-[#adb5c0] outline-none transition-all focus:border-[#ff543b]/40 focus:shadow-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block font-mono text-sm tracking-[0.04em] text-[#adb5c0]">Ses dosyası · MP3 / WAV</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-none border border-dashed border-white/[0.12] bg-[#090b0e] px-4 py-6 text-center transition-colors hover:border-[#ff543b]/40 hover:bg-[#ff543b]/5">
                    <UploadCloud className="h-6 w-6 text-[#ff6c55]" />
                    <span className="text-sm text-[#adb5c0] font-medium">{file ? file.name : "Ses dosyasını seç"}</span>
                    {durationSec && <span className="text-sm text-[#ff6c55] font-mono font-bold bg-[#ff543b]/10 px-2 py-1 rounded-none">{Math.floor(durationSec)} sn</span>}
                    <input type="file" accept="audio/*" onChange={handleFileChange} className="hidden" required />
                  </label>
                </div>
                <div>
                  <label className="mb-2 block font-mono text-sm tracking-[0.04em] text-[#adb5c0]">Kapak görseli</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-none border border-dashed border-white/[0.12] bg-[#090b0e] px-4 py-6 text-center transition-colors hover:border-zinc-500/30 hover:bg-white/[0.02]">
                    <ImageIcon className="h-6 w-6 text-[#adb5c0]" />
                    <span className="text-sm text-[#adb5c0] font-medium">{coverFile ? coverFile.name : "Görsel seç (isteğe bağlı)"}</span>
                    <input type="file" accept="image/*" onChange={handleCoverChange} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 relative">
                {/* Kategori Dropdown */}
                <div className="relative">
                  <label className="mb-2 block font-mono text-sm tracking-[0.04em] text-[#adb5c0]">Kategoriler</label>
                  <div
                    onClick={() => setIsCatOpen(!isCatOpen)}
                    className="w-full rounded-none border border-white/[0.08] bg-[#090b0e] px-4 py-3.5 text-base text-[#f7f8fa] outline-none cursor-pointer hover:border-[#ff543b]/40 transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{selectedCategories.length > 0 ? selectedCategories.join(", ") : "Kategori seç"}</span>
                    <ChevronDown className={`w-4 h-4 text-[#adb5c0] transition-transform ${isCatOpen ? "rotate-180" : ""}`} />
                  </div>
                  <AnimatePresence>
                    {isCatOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full mt-2 bg-[#12161b] border border-white/[0.1] rounded-none shadow-none overflow-hidden z-50 max-h-48 overflow-y-auto no-scrollbar"
                      >
                        {CATEGORIES.map(cat => (
                          <label key={cat} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] cursor-pointer border-b border-white/[0.02] last:border-0">
                            <input
                              type="checkbox"
                              checked={selectedCategories.includes(cat)}
                              onChange={() => handleCategoryToggle(cat)}
                              className="w-4 h-4 rounded-none border-white/15 text-[#ff6c55] focus:ring-[#ff543b] bg-[#090b0e] accent-[#ff543b]"
                            />
                            <span className={`text-base ${selectedCategories.includes(cat) ? 'text-[#ff6c55] font-bold' : 'text-[#f7f8fa]'}`}>{cat}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Tür Dropdown */}
                <div className="relative">
                  <label className="mb-2 block font-mono text-sm tracking-[0.04em] text-[#adb5c0]">Türler</label>
                  <div
                    onClick={() => setIsGenOpen(!isGenOpen)}
                    className="w-full rounded-none border border-white/[0.08] bg-[#090b0e] px-4 py-3.5 text-base text-[#f7f8fa] outline-none cursor-pointer hover:border-[#ff543b]/40 transition-all flex items-center justify-between"
                  >
                    <span className="truncate">{selectedGenres.length > 0 ? selectedGenres.join(", ") : "Tür seç"}</span>
                    <ChevronDown className={`w-4 h-4 text-[#adb5c0] transition-transform ${isGenOpen ? "rotate-180" : ""}`} />
                  </div>
                  <AnimatePresence>
                    {isGenOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute top-full left-0 w-full mt-2 bg-[#12161b] border border-white/[0.1] rounded-none shadow-none overflow-hidden z-50 max-h-48 overflow-y-auto no-scrollbar"
                      >
                        {GENRES.map(gen => (
                          <label key={gen} className="flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] cursor-pointer border-b border-white/[0.02] last:border-0">
                            <input
                              type="checkbox"
                              checked={selectedGenres.includes(gen)}
                              onChange={() => handleGenreToggle(gen)}
                              className="w-4 h-4 rounded-none border-white/15 text-[#ff6c55] focus:ring-[#ff543b] bg-[#090b0e] accent-[#ff543b]"
                            />
                            <span className={`text-base ${selectedGenres.includes(gen) ? 'text-[#ff6c55] font-bold' : 'text-[#f7f8fa]'}`}>{gen}</span>
                          </label>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="mb-2 block font-mono text-sm tracking-[0.04em] text-[#adb5c0]">Şarkı sözleri · LRC (isteğe bağlı)</label>
                  <textarea
                    value={lyricsLrc}
                    onChange={(e) => setLyricsLrc(e.target.value)}
                    placeholder="[00:12.50] İlk satır..."
                    className="w-full rounded-none border border-white/[0.08] bg-[#090b0e] px-4 py-3 text-base text-[#f7f8fa] placeholder:text-[#adb5c0] outline-none transition-all focus:border-[#ff543b]/40 focus:shadow-none h-24 resize-none font-mono"
                  />
                </div>
                <div>
                  <label className="mb-2 block font-mono text-sm tracking-[0.04em] text-[#adb5c0]">YouTube klip bağlantısı (isteğe bağlı)</label>
                  <input
                    type="url"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
                    className="w-full rounded-none border border-white/[0.08] bg-[#090b0e] px-4 py-3.5 text-base text-[#f7f8fa] placeholder:text-[#adb5c0] outline-none transition-all focus:border-[#ff543b]/40 focus:shadow-none"
                  />
                </div>
              </div>

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full rounded-none bg-[#ff543b] py-4 text-base font-semibold text-[#090b0e] transition-all duration-300 hover:shadow-none disabled:opacity-50 disabled:hover:shadow-none tracking-wider mt-4"
              >
                {loading ? "Yükleniyor..." : "Yükle ve kuyruğa ekle"}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
