"use client";

import { useState } from "react";
import { Check, X, Music, Search, Shield, User, RefreshCw, Minus, Plus } from "lucide-react";
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

type UserData = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  role: string;
  isVerifiedArtist: boolean;
  uploadCredits: number;
  createdAt: Date;
};

export default function AdminClient({ initialArtists, stats }: { initialArtists: ArtistApp[], stats?: any }) {
  const [artists, setArtists] = useState<ArtistApp[]>(initialArtists);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ARTISTS" | "USERS">("ARTISTS");
  
  // User Search State
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState<UserData[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  const router = useRouter();

  const handleArtistAction = async (userId: string, action: "VERIFY" | "REJECT") => {
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
        alert("İşlem başarısız oldu.");
      }
    } catch (e) {
      alert("Bir hata oluştu.");
    } finally {
      setLoadingId(null);
    }
  };

  const handleSearchUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchEmail.trim()) return;
    
    setIsSearching(true);
    try {
      const res = await fetch(`/api/admin/users?email=${encodeURIComponent(searchEmail)}`);
      if (res.ok) {
        const data = await res.json();
        setSearchResults(data.users || []);
      }
    } catch (error) {
      alert("Arama sırasında hata oluştu.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleUpdateUser = async (userId: string, data: any) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const result = await res.json();
        setSearchResults(prev => prev.map(u => u.id === userId ? { ...u, ...result.user } : u));
      } else {
        alert("Güncelleme başarısız.");
      }
    } catch (e) {
      alert("Güncelleme sırasında hata.");
    }
  };

  return (
    <div className="flex flex-col gap-8">
      
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          <div className="bg-[#121318]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg">
            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1">Toplam Kullanıcı</p>
            <p className="text-3xl font-black text-white">{stats.totalUsers}</p>
          </div>
          <div className="bg-[#121318]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg">
            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1">Toplam Şarkı</p>
            <p className="text-3xl font-black text-white">{stats.totalSongs}</p>
          </div>
          <div className="bg-[#121318]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg">
            <p className="text-[10px] uppercase tracking-[0.15em] text-zinc-500 mb-1">Toplam Dinlenme</p>
            <p className="text-3xl font-black text-white">{stats.totalListens}</p>
          </div>
          <div className="bg-[#121318]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-5 shadow-lg">
            <p className="text-[10px] uppercase tracking-[0.15em] text-[#D4AF37] mb-1">Bugün Atılan Mesaj</p>
            <p className="text-3xl font-black text-[#D4AF37]">{stats.messagesToday}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-4 border-b border-white/10 pb-4">
        <button 
          onClick={() => setActiveTab("ARTISTS")}
          className={`px-6 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all ${activeTab === "ARTISTS" ? "bg-[#D4AF37] text-black" : "bg-black/50 text-zinc-400 hover:text-white border border-white/10"}`}
        >
          Sanatçı Başvuruları
        </button>
        <button 
          onClick={() => setActiveTab("USERS")}
          className={`px-6 py-3 rounded-full text-sm font-bold tracking-widest uppercase transition-all ${activeTab === "USERS" ? "bg-[#D4AF37] text-black" : "bg-black/50 text-zinc-400 hover:text-white border border-white/10"}`}
        >
          Kullanıcı Yönetimi
        </button>
      </div>

      {activeTab === "ARTISTS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-3xl">
              <Music className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-white mb-2">Bekleyen Başvuru Yok</h3>
              <p className="text-zinc-500">Tüm sanatçı başvuruları değerlendirildi.</p>
            </div>
          ) : (
            artists.map(artist => (
              <div key={artist.id} className="bg-[#121318]/80 backdrop-blur-xl border border-white/5 rounded-[2rem] p-6 shadow-2xl relative overflow-hidden group hover:border-[#D4AF37]/30 transition-all">
                
                <div className="absolute top-0 right-0 p-4">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)] animate-pulse" />
                </div>

                <h3 className="text-xl font-black text-white mb-1">{artist.name}</h3>
                <p className="text-sm text-zinc-400 font-mono mb-6 truncate">{artist.email}</p>
                
                <div className="space-y-3 mb-8">
                  {artist.instagramUrl && (
                    <a href={artist.instagramUrl} target="_blank" rel="noreferrer" className="block text-sm bg-black/50 border border-white/5 px-4 py-3 rounded-xl text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all truncate">
                      Instagram Profili
                    </a>
                  )}
                  {artist.spotifyUrl && (
                    <a href={artist.spotifyUrl} target="_blank" rel="noreferrer" className="block text-sm bg-black/50 border border-white/5 px-4 py-3 rounded-xl text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all truncate">
                      Spotify Profili
                    </a>
                  )}
                  {artist.youtubeUrl && (
                    <a href={artist.youtubeUrl} target="_blank" rel="noreferrer" className="block text-sm bg-black/50 border border-white/5 px-4 py-3 rounded-xl text-zinc-300 hover:text-[#D4AF37] hover:border-[#D4AF37]/30 transition-all truncate">
                      YouTube Kanalı
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button 
                    onClick={() => handleArtistAction(artist.id, "REJECT")}
                    disabled={loadingId === artist.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reddet
                  </button>
                  <button 
                    onClick={() => handleArtistAction(artist.id, "VERIFY")}
                    disabled={loadingId === artist.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/20 py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                  >
                    <Check className="w-4 h-4" />
                    Onayla
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "USERS" && (
        <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 shadow-2xl">
          
          <form onSubmit={handleSearchUser} className="relative mb-12">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#D4AF37]" />
            <input 
              type="text" 
              placeholder="Kullanıcı e-posta adresi ile ara..." 
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full bg-black/50 text-white pl-16 pr-6 py-5 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#D4AF37]/50 border border-white/5 text-lg"
            />
            <button type="submit" disabled={isSearching} className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#D4AF37] text-black px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-[#F3E5AB] transition-colors disabled:opacity-50">
              {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Bul"}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-4">
              {searchResults.map(user => (
                <div key={user.id} className="bg-black/40 border border-white/5 rounded-3xl p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:border-[#D4AF37]/20 transition-all">
                  
                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 border border-white/10 flex items-center justify-center text-[#D4AF37] font-bold text-xl overflow-hidden shrink-0">
                      {user.image ? <img src={user.image} alt="Avatar" className="w-full h-full object-cover" /> : user.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-white flex items-center gap-2">
                        {user.name} 
                        {user.role === "ADMIN" && <Shield className="w-4 h-4 text-red-500" />}
                        {user.isVerifiedArtist && <Check className="w-4 h-4 text-[#D4AF37]" />}
                      </h4>
                      <p className="text-zinc-500 text-sm font-mono">{user.email}</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-4">
                    
                    {/* Role Toggle */}
                    <select 
                      value={user.role} 
                      onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                      className="bg-black border border-white/10 text-white px-4 py-2.5 rounded-xl text-sm focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="USER">Üye (USER)</option>
                      <option value="ARTIST">Sanatçı (ARTIST)</option>
                      <option value="ADMIN">Yönetici (ADMIN)</option>
                    </select>

                    {/* Artist Toggle */}
                    <button 
                      onClick={() => handleUpdateUser(user.id, { isVerifiedArtist: !user.isVerifiedArtist })}
                      className={`px-4 py-2.5 rounded-xl text-sm font-bold transition-colors border ${user.isVerifiedArtist ? 'bg-[#D4AF37]/10 text-[#D4AF37] border-[#D4AF37]/30' : 'bg-black border-white/10 text-zinc-400 hover:text-white'}`}
                    >
                      {user.isVerifiedArtist ? "VIP Sanatçı (Aktif)" : "VIP Sanatçı Yap"}
                    </button>

                    {/* Credits Control */}
                    <div className="flex items-center bg-black border border-white/10 rounded-xl overflow-hidden">
                      <div className="px-4 py-2.5 text-zinc-400 text-sm font-mono border-r border-white/10 bg-white/5">
                        Kredi: <strong className="text-white">{user.uploadCredits}</strong>
                      </div>
                      <button 
                        onClick={() => handleUpdateUser(user.id, { uploadCredits: Math.max(0, user.uploadCredits - 1) })}
                        className="p-2.5 hover:bg-white/10 text-zinc-400 hover:text-red-400 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleUpdateUser(user.id, { uploadCredits: user.uploadCredits + 1 })}
                        className="p-2.5 hover:bg-white/10 text-zinc-400 hover:text-green-400 transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
