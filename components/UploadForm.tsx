"use client";

import { useState } from "react";
import { CATEGORIES, GENRES } from "@/lib/constants";

export default function UploadForm({ onUploadSuccess }: { onUploadSuccess: () => void }) {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [durationSec, setDurationSec] = useState<number | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [lyricsLrc, setLyricsLrc] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [coverFile, setCoverFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);

    // Extract duration
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

  const [isOpen, setIsOpen] = useState(false);

  const handleUploadSuccess = () => {
    setIsOpen(false);
    onUploadSuccess();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !durationSec || !title || !artist) {
      setError("Lütfen gerekli tüm alanları (dosya dahil) doldurun.");
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
          title,
          artist,
          fileKey: key,
          coverKey,
          durationSec,
          categories: selectedCategories,
          genres: selectedGenres,
          lyricsLrc: lyricsLrc || undefined,
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
      handleUploadSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-zinc-900 border border-white/5 rounded-2xl overflow-hidden shadow-2xl transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-6 bg-zinc-900/50 hover:bg-zinc-800/50 transition-colors focus:outline-none"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4"/></svg>
          </div>
          <span className="text-xl font-bold text-white">Yeni Şarkı Yükle</span>
        </div>
        <svg className={`w-6 h-6 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/></svg>
      </button>

      {isOpen && (
        <div className="p-6 border-t border-white/5">
          {error && <div className="text-red-400 bg-red-400/10 p-3 rounded-lg mb-4 text-sm font-medium">{error}</div>}
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-semibold text-gray-300">Başlık</label>
                <input 
                  type="text" 
                  value={title} 
                  onChange={(e) => setTitle(e.target.value)} 
                  className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-white outline-none" 
                  required 
                />
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm font-semibold text-gray-300">Sanatçı</label>
                <input 
                  type="text" 
                  value={artist} 
                  onChange={(e) => setArtist(e.target.value)} 
                  className="w-full bg-black border border-white/10 p-3 rounded-xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all text-white outline-none" 
                  required 
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <label className="block mb-2 text-sm font-semibold text-gray-300">Ses Dosyası (.mp3)</label>
                <input 
                  type="file" 
                  accept="audio/*" 
                  onChange={handleFileChange} 
                  className="w-full bg-black border border-white/10 p-3 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-emerald-500/20 file:text-emerald-400 hover:file:bg-emerald-500/30 text-gray-400 transition-all" 
                  required 
                />
                {durationSec && <span className="text-xs text-emerald-500 mt-2 block font-medium">Süre: {Math.round(durationSec)} sn</span>}
              </div>
              <div className="flex-1">
                <label className="block mb-2 text-sm font-semibold text-gray-300">Kapak Görseli</label>
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handleCoverChange} 
                  className="w-full bg-black border border-white/10 p-3 rounded-xl file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-zinc-800 file:text-gray-300 hover:file:bg-zinc-700 text-gray-400 transition-all" 
                />
                <span className="text-xs text-gray-500 mt-2 block">İsteğe bağlı (Kare)</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block mb-2 text-sm font-semibold text-gray-300">Kategoriler</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-white/10 rounded-xl bg-black no-scrollbar">
                  {CATEGORIES.map(cat => (
                    <label key={cat} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full cursor-pointer transition-colors ${selectedCategories.includes(cat) ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'}`}>
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
                <label className="block mb-2 text-sm font-semibold text-gray-300">Türler</label>
                <div className="flex flex-wrap gap-2 max-h-40 overflow-y-auto p-3 border border-white/10 rounded-xl bg-black no-scrollbar">
                  {GENRES.map(gen => (
                    <label key={gen} className={`flex items-center gap-2 text-sm px-3 py-1.5 rounded-full cursor-pointer transition-colors ${selectedGenres.includes(gen) ? 'bg-emerald-500 text-black font-bold' : 'bg-zinc-800 text-gray-400 hover:bg-zinc-700'}`}>
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

            <div>
              <label className="block mb-2 text-sm font-semibold text-gray-300">Şarkı Sözleri (LRC - Opsiyonel)</label>
              <textarea 
                value={lyricsLrc} 
                onChange={(e) => setLyricsLrc(e.target.value)} 
                className="w-full bg-black border border-white/10 p-4 rounded-xl h-24 font-mono text-sm text-gray-300 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all outline-none resize-none no-scrollbar"
                placeholder="[00:12.50] İlk satır..."
              />
            </div>

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-emerald-500 text-black font-black py-4 px-6 rounded-xl hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_30px_rgba(16,185,129,0.5)] mt-2"
            >
              {loading ? "Yükleniyor..." : "Yükle ve Kuyruğa Ekle"}
            </button>

          </form>
        </div>
      )}
    </div>
  );
}
