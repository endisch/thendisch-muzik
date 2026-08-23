"use client";

import { useState } from "react";
import { Music2, CheckCircle2, ShieldAlert, Clock, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  uploadCredits: number;
  role: string;
  isVerifiedArtist: boolean;
  artistApplication: boolean;
  instagramUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  createdAt: Date;
};

export default function ProfileClient({ user }: { user: UserData }) {
  const [instagram, setInstagram] = useState(user.instagramUrl || "");
  const [spotify, setSpotify] = useState(user.spotifyUrl || "");
  const [youtube, setYoutube] = useState(user.youtubeUrl || "");
  
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const router = useRouter();

  const handleApplyArtist = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("/api/profile/apply-artist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagram, spotify, youtube })
      });
      
      const data = await res.json();
      if (res.ok) {
        setMessage("Başvurunuz başarıyla alındı! Yöneticilerimiz en kısa sürede inceleyecektir.");
        router.refresh();
      } else {
        setMessage(data.error || "Başvuru sırasında hata oluştu.");
      }
    } catch (err) {
      setMessage("Sunucu hatası.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Profil Kartı */}
      <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Dekoratif Yansıma */}
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          {user.isVerifiedArtist ? <CheckCircle2 className="w-64 h-64 text-[#D4AF37]" /> : <UserDecoration />}
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="w-32 h-32 rounded-full border-4 border-[#D4AF37]/30 flex items-center justify-center bg-zinc-900 overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)] shrink-0">
            {user.image ? (
              <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl font-black text-[#D4AF37]">{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl font-black text-white flex flex-col md:flex-row items-center gap-3 mb-2">
              {user.name}
              {user.isVerifiedArtist && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" /> VIP Sanatçı
                </span>
              )}
              {user.role === "ADMIN" && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs uppercase tracking-widest font-bold">
                  <ShieldAlert className="w-3.5 h-3.5" /> Yönetici
                </span>
              )}
            </h2>
            <p className="text-zinc-400 font-mono text-sm mb-6">{user.email}</p>
            
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <div className="bg-black/50 border border-white/5 rounded-2xl px-6 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Şarkı Yükleme Kredisi</p>
                <p className="text-3xl font-black text-[#D4AF37]">{user.uploadCredits}</p>
              </div>
              <div className="bg-black/50 border border-white/5 rounded-2xl px-6 py-4">
                <p className="text-[10px] uppercase tracking-[0.2em] text-zinc-500 mb-1">Üyelik Tarihi</p>
                <p className="text-lg font-bold text-white">{new Date(user.createdAt).toLocaleDateString("tr-TR")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sanatçı Başvurusu Bölümü */}
      {!user.isVerifiedArtist && (
        <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]">
              <Music2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-white">VIP Sanatçı Başvurusu</h3>
              <p className="text-zinc-400 text-sm mt-1">Eserlerinizi Thendisch radyosunda yayınlamak için sanatçı hesabı edinin.</p>
            </div>
          </div>

          {user.artistApplication ? (
            <div className="bg-[#D4AF37]/5 border border-[#D4AF37]/20 rounded-2xl p-6 flex flex-col items-center text-center">
              <Clock className="w-12 h-12 text-[#D4AF37] mb-4" />
              <h4 className="text-lg font-bold text-[#D4AF37] mb-2">Başvurunuz İncelemede</h4>
              <p className="text-zinc-400 text-sm max-w-md">Yöneticilerimiz sosyal medya hesaplarınızı inceliyor. Onaylandığında e-posta ile bilgilendirileceksiniz ve VIP Sanatçı rozetinize kavuşacaksınız.</p>
            </div>
          ) : (
            <form onSubmit={handleApplyArtist} className="flex flex-col gap-5 mt-8">
              {message && (
                <div className="p-4 rounded-xl bg-white/5 border border-white/10 text-center font-medium text-zinc-300">
                  {message}
                </div>
              )}
              
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Instagram Profil Linki</label>
                <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} placeholder="https://instagram.com/..." className="w-full bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" required />
              </div>
              
              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Spotify Sanatçı Linki</label>
                <input type="url" value={spotify} onChange={(e) => setSpotify(e.target.value)} placeholder="https://open.spotify.com/artist/..." className="w-full bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" required />
              </div>

              <div>
                <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">YouTube Kanal Linki</label>
                <input type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)} placeholder="https://youtube.com/..." className="w-full bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" required />
              </div>

              <button type="submit" disabled={loading} className="w-full mt-4 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 tracking-widest uppercase flex justify-center items-center gap-2">
                {loading ? "Gönderiliyor..." : "Başvuruyu Gönder"} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}

function UserDecoration() {
  return (
    <svg width="256" height="256" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-800">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}
