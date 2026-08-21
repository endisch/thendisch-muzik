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
      setError("Lütfen gerekli tüm alanları (dosya dahil) doldurun.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 1. Presigned URL al
      const urlRes = await fetch("/api/upload-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      if (!urlRes.ok) {
        const d = await urlRes.json();
        throw new Error(d.error || "Upload URL alınamadı");
      }
      const { uploadUrl, key } = await urlRes.json();

      // 2. R2'ye yükle
      const uploadRes = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });
      if (!uploadRes.ok) throw new Error("Dosya yüklenirken hata oluştu");

      // 3. Veritabanına kaydet
      const songRes = await fetch("/api/songs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          artist,
          fileKey: key,
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

      // Başarılı
      setFile(null);
      setTitle("");
      setArtist("");
      setDurationSec(null);
      setSelectedCategories([]);
      setSelectedGenres([]);
      setLyricsLrc("");
      onUploadSuccess();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 shadow-sm mt-4">
      <h3 className="text-xl font-bold mb-4">Şarkı Yükle</h3>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block mb-1 font-semibold">Başlık</label>
            <input 
              type="text" 
              value={title} 
              onChange={(e) => setTitle(e.target.value)} 
              className="w-full border p-2 rounded dark:bg-gray-700" 
              required 
            />
          </div>
          <div className="flex-1">
            <label className="block mb-1 font-semibold">Sanatçı</label>
            <input 
              type="text" 
              value={artist} 
              onChange={(e) => setArtist(e.target.value)} 
              className="w-full border p-2 rounded dark:bg-gray-700" 
              required 
            />
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Ses Dosyası</label>
          <input 
            type="file" 
            accept="audio/*" 
            onChange={handleFileChange} 
            className="w-full border p-2 rounded bg-white dark:bg-gray-700" 
            required 
          />
          {durationSec && <span className="text-xs text-gray-500 mt-1 block">Süre: {Math.round(durationSec)} sn</span>}
        </div>

        <div>
          <label className="block mb-1 font-semibold">Kategoriler</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded dark:bg-gray-700">
            {CATEGORIES.map(cat => (
              <label key={cat} className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox" 
                  checked={selectedCategories.includes(cat)} 
                  onChange={() => handleCategoryToggle(cat)} 
                />
                {cat}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Türler (Genres)</label>
          <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto p-2 border rounded dark:bg-gray-700">
            {GENRES.map(gen => (
              <label key={gen} className="flex items-center gap-1 text-sm">
                <input 
                  type="checkbox" 
                  checked={selectedGenres.includes(gen)} 
                  onChange={() => handleGenreToggle(gen)} 
                />
                {gen}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block mb-1 font-semibold">Şarkı Sözleri (LRC Formatı - Opsiyonel)</label>
          <textarea 
            value={lyricsLrc} 
            onChange={(e) => setLyricsLrc(e.target.value)} 
            className="w-full border p-2 rounded h-24 font-mono text-sm dark:bg-gray-700"
            placeholder="[00:12.50] İlk satır..."
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          className="bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "Yükleniyor..." : "Yükle ve Kuyruğa Ekle"}
        </button>

      </form>
    </div>
  );
}
