"use client";

import { useState } from "react";
import { Music2, CheckCircle2, ShieldAlert, Clock, ArrowRight, Edit3, X } from "lucide-react";
import { useRouter } from "next/navigation";

type UserData = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  bio: string | null;
  uploadCredits: number;
  role: string;
  isVerifiedArtist: boolean;
  artistApplication: boolean;
  instagramUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  createdAt: Date;
  songsListened: number;
};

export default function ProfileClient({ user }: { user: UserData }) {
  const [instagram, setInstagram] = useState(user.instagramUrl || "");
  const [spotify, setSpotify] = useState(user.spotifyUrl || "");
  const [youtube, setYoutube] = useState(user.youtubeUrl || "");
  
  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(user.name || "");
  const [editImage, setEditImage] = useState(user.image || "");
  const [editBio, setEditBio] = useState(user.bio || "");
  
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

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          name: editName, 
          image: editImage, 
          bio: editBio,
          instagramUrl: instagram,
          spotifyUrl: spotify,
          youtubeUrl: youtube
        })
      });
      if (res.ok) {
        setIsEditing(false);
        router.refresh();
      } else {
        alert("Güncelleme başarısız.");
      }
    } catch (error) {
      alert("Hata oluştu.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#121318] border border-white/10 rounded-[2.5rem] w-full max-w-xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-[#1A1C23]">
              <h3 className="font-black text-white text-xl">Profili Düzenle</h3>
              <button onClick={() => setIsEditing(false)} className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-colors text-zinc-400">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Kullanıcı Adı</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Profil Fotoğrafı (URL)</label>
                  <input type="url" value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://..." className="w-full bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Hakkımda</label>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} placeholder="Müzik zevkinden, kendinden bahset..." className="w-full bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5 resize-none"></textarea>
                </div>

                <div className="border-t border-white/5 my-2"></div>
                <h4 className="text-sm font-bold text-[#D4AF37]">Sosyal Medya Bağlantıları</h4>
                
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Instagram Profil Linki</label>
                  <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">Spotify Linki</label>
                  <input type="url" value={spotify} onChange={(e) => setSpotify(e.target.value)} className="w-full bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" />
                </div>
                <div>
                  <label className="block text-[10px] font-mono uppercase tracking-widest text-zinc-500 mb-2">YouTube Kanal Linki</label>
                  <input type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)} className="w-full bg-black/50 text-white px-4 py-3.5 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#D4AF37] border border-white/5" />
                </div>

                <button type="submit" disabled={loading} className="w-full mt-4 bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-black py-4 rounded-xl transition-all disabled:opacity-50 tracking-widest uppercase">
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profil Kartı */}
      <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden group">
        
        {/* Dekoratif Yansıma */}
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          {user.isVerifiedArtist ? <CheckCircle2 className="w-64 h-64 text-[#D4AF37]" /> : <UserDecoration />}
        </div>
        
        <button 
          onClick={() => setIsEditing(true)}
          className="absolute top-8 right-8 z-20 flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] text-zinc-400 rounded-xl transition-all border border-white/5 font-bold text-sm"
        >
          <Edit3 className="w-4 h-4" /> Profili Düzenle
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10 mt-6 md:mt-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-[2rem] border-4 border-[#D4AF37]/30 flex items-center justify-center bg-zinc-900 overflow-hidden shadow-[0_0_30px_rgba(212,175,55,0.2)] shrink-0">
            {user.image ? (
              <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl md:text-7xl font-black text-[#D4AF37]">{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="text-center md:text-left flex-1">
            <h2 className="text-3xl md:text-4xl font-black text-white flex flex-col md:flex-row items-center gap-3 mb-2">
              {user.name}
              <div className="flex items-center gap-2">
                {user.isVerifiedArtist && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-xs uppercase tracking-widest font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> VIP
                  </span>
                )}
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-xs uppercase tracking-widest font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" /> Admin
                  </span>
                )}
              </div>
            </h2>
            <p className="text-zinc-400 font-mono text-sm mb-6">{user.email}</p>
            
            {user.bio && (
              <p className="text-zinc-300 mb-6 max-w-2xl leading-relaxed bg-black/30 p-4 rounded-2xl border border-white/5">{user.bio}</p>
            )}

            {/* Sosyal Linkler */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
              {user.instagramUrl && (
                <a href={user.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-pink-500/20 text-zinc-300 hover:text-pink-400 border border-white/10 px-4 py-2 rounded-xl transition-all text-sm font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg> Instagram
                </a>
              )}
              {user.spotifyUrl && (
                <a href={user.spotifyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-green-500/20 text-zinc-300 hover:text-green-400 border border-white/10 px-4 py-2 rounded-xl transition-all text-sm font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14C9.6 9.9 15.001 10.62 18.66 12.9c.42.24.6.84.3 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.239.54-.899.72-1.439.42z"/></svg>
                  Spotify
                </a>
              )}
              {user.youtubeUrl && (
                <a href={user.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-500 border border-white/10 px-4 py-2 rounded-xl transition-all text-sm font-bold">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.13 1 12 1 12s0 3.87.46 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.87 23 12 23 12s0-3.87-.46-5.58z"></path><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02"></polygon></svg> YouTube
                </a>
              )}
            </div>
            
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
                <div className="bg-gradient-to-br from-[#121318] to-black border border-white/5 rounded-2xl p-5 flex flex-col justify-center shadow-lg hover:border-white/10 transition-colors">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-[#D4AF37] mb-1.5 opacity-90 truncate">Şarkı Hakkı</p>
                  <p className="text-3xl font-black text-white">{user.uploadCredits}</p>
                </div>
                <div className="bg-gradient-to-br from-[#121318] to-black border border-white/5 rounded-2xl p-5 flex flex-col justify-center shadow-lg hover:border-white/10 transition-colors">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 opacity-90 truncate">Statü</p>
                  <p className="text-lg font-black text-white truncate">
                    {user.isVerifiedArtist ? "VIP Sanatçı" : user.role === "ADMIN" ? "Yönetici" : "Dinleyici"}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-[#121318] to-black border border-white/5 rounded-2xl p-5 flex flex-col justify-center shadow-lg hover:border-white/10 transition-colors">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 opacity-90 truncate">Dinlenen</p>
                  <p className="text-3xl font-black text-white">{user.songsListened}</p>
                </div>
                <div className="bg-gradient-to-br from-[#121318] to-black border border-white/5 rounded-2xl p-5 flex flex-col justify-center shadow-lg hover:border-white/10 transition-colors">
                  <p className="text-[9px] uppercase tracking-[0.15em] text-zinc-500 mb-1.5 opacity-90 truncate">Katılım</p>
                  <p className="text-lg font-black text-white truncate" suppressHydrationWarning>
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Sanatçı Başvurusu Bölümü */}
      {!user.isVerifiedArtist && (
        <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-2xl mt-4">
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
              
              <div className="text-sm text-zinc-400 mb-4 bg-white/5 p-4 rounded-xl border border-white/10">
                Sosyal medya linklerinizi yukarıdaki <strong>"Profili Düzenle"</strong> menüsünden eklediyseniz buraya otomatik gelecektir. Eksik olanları tamamlayıp başvurabilirsiniz.
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#D4AF37] hover:bg-[#F3E5AB] text-black font-black py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.2)] hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] disabled:opacity-50 tracking-widest uppercase flex justify-center items-center gap-2">
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
