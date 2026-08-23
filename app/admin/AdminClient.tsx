"use client";

import { useState } from "react";
import { Check, X, Music } from "lucide-react";
import { useRouter } from "next/navigation";

type ArtistApp = {
  id: string;
  name: string | null;
  email: string;
  instagramUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  createdAt: Date;
};

export default function AdminClient({ initialArtists }: { initialArtists: ArtistApp[] }) {
  const [artists, setArtists] = useState<ArtistApp[]>(initialArtists);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const router = useRouter();

  const handleAction = async (userId: string, action: "VERIFY" | "REJECT") => {
    setLoadingId(userId);
    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action })
      });
      
      if (res.ok) {
        setArtists(artists.filter(a => a.id !== userId));
        router.refresh();
      } else {
        const d = await res.json();
        alert(d.error || "Bir hata oluştu");
      }
    } catch (error) {
      alert("Bir hata oluştu");
    } finally {
      setLoadingId(null);
    }
  };

  if (artists.length === 0) {
    return (
      <div className="bg-zinc-900/40 border border-white/5 rounded-3xl p-12 text-center flex flex-col items-center justify-center">
        <Check className="w-16 h-16 text-emerald-500/50 mb-4" />
        <h3 className="text-xl font-bold text-white mb-2">Bekleyen Başvuru Yok</h3>
        <p className="text-zinc-500">Tüm sanatçı başvurularını incelediniz. Harika iş!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-xl font-bold text-white flex items-center gap-3">
        Bekleyen Sanatçı Başvuruları
        <span className="bg-emerald-500/20 text-emerald-500 text-xs px-2.5 py-1 rounded-full font-mono">{artists.length}</span>
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {artists.map((artist) => (
          <div key={artist.id} className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 relative overflow-hidden group hover:border-emerald-500/20 transition-all">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/50 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
            
            <div className="flex items-start justify-between mb-4">
              <div>
                <h4 className="font-bold text-lg text-white">{artist.name || "İsimsiz"}</h4>
                <p className="text-xs text-zinc-500 font-mono">{artist.email}</p>
              </div>
              <span className="text-[10px] text-zinc-600 font-mono bg-black/50 px-2 py-1 rounded-lg">
                {new Date(artist.createdAt).toLocaleDateString("tr-TR")}
              </span>
            </div>

            <div className="space-y-3 mb-6">
              {artist.instagramUrl && (
                <a href={artist.instagramUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors bg-black/40 p-2.5 rounded-xl border border-white/[0.03] hover:border-white/10">
                  <svg className="w-4 h-4 text-pink-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span className="truncate">{artist.instagramUrl.replace("https://", "")}</span>
                </a>
              )}
              {artist.spotifyUrl && (
                <a href={artist.spotifyUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors bg-black/40 p-2.5 rounded-xl border border-white/[0.03] hover:border-white/10">
                  <Music className="w-4 h-4 text-emerald-500" />
                  <span className="truncate">{artist.spotifyUrl.replace("https://", "")}</span>
                </a>
              )}
              {artist.youtubeUrl && (
                <a href={artist.youtubeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors bg-black/40 p-2.5 rounded-xl border border-white/[0.03] hover:border-white/10">
                  <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path>
                    <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon>
                  </svg>
                  <span className="truncate">{artist.youtubeUrl.replace("https://", "")}</span>
                </a>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => handleAction(artist.id, "REJECT")}
                disabled={loadingId === artist.id}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-red-500/10 text-red-500 font-bold hover:bg-red-500/20 transition-colors text-sm disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                Reddet
              </button>
              <button 
                onClick={() => handleAction(artist.id, "VERIFY")}
                disabled={loadingId === artist.id}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-500 text-black font-black hover:bg-emerald-400 transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)] text-sm disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                Doğrula
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
