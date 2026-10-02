"use client";

import { useState } from "react";
import { X, Save, Music } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SongEditModal({
  song,
  onClose
}: {
  song: any,
  onClose: () => void
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: song.title,
    artist: song.artist,
    youtubeUrl: song.youtubeUrl || "",
    lyricsLrc: song.lyricsLrc || ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`/api/songs/${song.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        onClose();
        router.refresh();
      } else {
        alert("Güncelleme başarısız oldu.");
      }
    } catch (err) {
      console.error(err);
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
      <div className="bg-[#12161b] border border-white/10 rounded-none w-full max-w-2xl max-h-[90vh] flex flex-col shadow-none">
        <div className="flex items-center justify-between p-5 border-b border-white/5">
          <h3 className="font-bold text-[#f7f8fa] flex items-center gap-2">
            <Music className="w-5 h-5 text-[#ff6c55]" />
            Parçayı düzenle
          </h3>
          <button onClick={onClose} aria-label="Parça düzenlemeyi kapat" className="p-3 text-[#adb5c0] hover:text-[#f7f8fa] transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <form id="song-edit-form" onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-bold text-[#adb5c0] tracking-wide mb-2">Şarkı adı</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-none px-4 py-3 text-[#f7f8fa] focus:outline-none focus:border-[#ff543b] transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-[#adb5c0] tracking-wide mb-2">Sanatçı</label>
                <input
                  type="text"
                  required
                  value={formData.artist}
                  onChange={(e) => setFormData({...formData, artist: e.target.value})}
                  className="w-full bg-black border border-white/10 rounded-none px-4 py-3 text-[#f7f8fa] focus:outline-none focus:border-[#ff543b] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#adb5c0] tracking-wide mb-2">YouTube video bağlantısı (isteğe bağlı)</label>
              <input
                type="url"
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({...formData, youtubeUrl: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-none px-4 py-3 text-[#f7f8fa] focus:outline-none focus:border-[#ff543b] transition-colors"
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-[#adb5c0] mb-2 flex flex-wrap items-center justify-between gap-2">
                <span>Zamanlı şarkı sözleri (LRC)</span>
                <span className="text-[#adb5c0] font-normal normal-case tracking-normal">Örn: [00:15.22] Sözler...</span>
              </label>
              <textarea
                value={formData.lyricsLrc}
                onChange={(e) => setFormData({...formData, lyricsLrc: e.target.value})}
                className="w-full bg-black border border-white/10 rounded-none px-4 py-3 text-[#f7f8fa] focus:outline-none focus:border-[#ff543b] transition-colors h-48 font-mono text-base"
                placeholder="[00:00.00] \n[00:15.00] Şarkı başlıyor...\n[00:20.50] Devam ediyor..."
              />
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-white/[0.12] bg-black/20 flex justify-end">
          <button
            type="submit"
            form="song-edit-form"
            disabled={loading}
            className="bg-[#ff543b] hover:bg-[#ff6c55] text-[#090b0e] px-6 py-2.5 rounded-none font-bold flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            {loading ? "Kaydediliyor..." : "Değişiklikleri kaydet"}
          </button>
        </div>
      </div>
    </div>
  );
}
