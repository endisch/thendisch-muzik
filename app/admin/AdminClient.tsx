"use client";

import { BrandIcon } from "@/components/BrandIcon";

import { useState } from "react";
import { Check, X, Music, Search, Shield, RefreshCw, Minus, Plus } from "lucide-react";
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
          <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-5 shadow-none">
            <p className="text-sm tracking-[0.04em] text-[#adb5c0] mb-1">Toplam kullanıcı</p>
            <p className="text-3xl font-semibold text-[#f7f8fa]">{stats.totalUsers}</p>
          </div>
          <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-5 shadow-none">
            <p className="text-sm tracking-[0.04em] text-[#adb5c0] mb-1">Toplam parça</p>
            <p className="text-3xl font-semibold text-[#f7f8fa]">{stats.totalSongs}</p>
          </div>
          <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-5 shadow-none">
            <p className="text-sm tracking-[0.04em] text-[#adb5c0] mb-1">Toplam dinlenme</p>
            <p className="text-3xl font-semibold text-[#f7f8fa]">{stats.totalListens}</p>
          </div>
          <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-5 shadow-none">
            <p className="text-sm tracking-[0.04em] text-[#ff6c55] mb-1">Bugünkü mesajlar</p>
            <p className="text-3xl font-semibold text-[#ff6c55]">{stats.messagesToday}</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap gap-3 border-b border-white/10 pb-4">
        <button
          onClick={() => setActiveTab("ARTISTS")}
          className={`px-6 py-3 rounded-none text-base font-bold tracking-wide transition-all ${activeTab === "ARTISTS" ? "bg-[#ff543b] text-[#090b0e]" : "bg-[#090b0e] text-[#adb5c0] hover:text-[#f7f8fa] border border-white/10"}`}
        >
          Sanatçı başvuruları
        </button>
        <button
          onClick={() => setActiveTab("USERS")}
          className={`px-6 py-3 rounded-none text-base font-bold tracking-wide transition-all ${activeTab === "USERS" ? "bg-[#ff543b] text-[#090b0e]" : "bg-[#090b0e] text-[#adb5c0] hover:text-[#f7f8fa] border border-white/10"}`}
        >
          Kullanıcı yönetimi
        </button>
      </div>

      {activeTab === "ARTISTS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artists.length === 0 ? (
            <div className="col-span-full py-12 text-center bg-[#12161b]  border border-white/[0.12] rounded-none">
              <Music className="w-12 h-12 text-[#adb5c0] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#f7f8fa] mb-2">Bekleyen başvuru yok</h3>
              <p className="text-[#adb5c0]">Tüm sanatçı başvuruları değerlendirildi.</p>
            </div>
          ) : (
            artists.map(artist => (
              <div key={artist.id} className="group relative overflow-hidden rounded-none border border-white/10 bg-[#12161b] p-6 transition-colors hover:border-[#ff543b]/30">

                <div className="absolute top-0 right-0 p-4">
                  <div className="w-2 h-2 rounded-none bg-emerald-500 shadow-none animate-pulse" />
                </div>

                <h3 className="text-xl font-semibold text-[#f7f8fa] mb-1">{artist.name}</h3>
                <p className="text-base text-[#adb5c0] font-mono mb-6 truncate">{artist.email}</p>

                <div className="space-y-3 mb-8">
                  {artist.instagramUrl && (
                    <a href={artist.instagramUrl} target="_blank" rel="noreferrer" className="block text-base bg-[#090b0e] border border-white/[0.12] px-4 py-3 rounded-none text-[#f7f8fa] hover:text-[#ff6c55] hover:border-[#ff543b]/30 transition-all truncate">
                      <BrandIcon name="instagram" className="w-6 h-6 inline-block mr-3 align-middle" />Instagram profili
                    </a>
                  )}
                  {artist.spotifyUrl && (
                    <a href={artist.spotifyUrl} target="_blank" rel="noreferrer" className="block text-base bg-[#090b0e] border border-white/[0.12] px-4 py-3 rounded-none text-[#f7f8fa] hover:text-[#ff6c55] hover:border-[#ff543b]/30 transition-all truncate">
                      <BrandIcon name="spotify" className="w-6 h-6 inline-block mr-3 align-middle" />Spotify profili
                    </a>
                  )}
                  {artist.youtubeUrl && (
                    <a href={artist.youtubeUrl} target="_blank" rel="noreferrer" className="block text-base bg-[#090b0e] border border-white/[0.12] px-4 py-3 rounded-none text-[#f7f8fa] hover:text-[#ff6c55] hover:border-[#ff543b]/30 transition-all truncate">
                      <BrandIcon name="youtube" className="w-6 h-6 inline-block mr-3 align-middle" />YouTube kanalı
                    </a>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleArtistAction(artist.id, "REJECT")}
                    disabled={loadingId === artist.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 py-3 rounded-none font-bold text-base transition-all disabled:opacity-50"
                  >
                    <X className="w-4 h-4" />
                    Reddet
                  </button>
                  <button
                    onClick={() => handleArtistAction(artist.id, "VERIFY")}
                    disabled={loadingId === artist.id}
                    className="flex-1 flex items-center justify-center gap-2 bg-[#ff543b]/10 hover:bg-[#ff543b]/20 text-[#ff6c55] border border-[#ff543b]/20 py-3 rounded-none font-bold text-base transition-all disabled:opacity-50"
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
        <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-8 shadow-none">

          <form onSubmit={handleSearchUser} className="relative mb-10 flex flex-col sm:flex-row gap-3">
            <Search className="absolute left-4 top-4 w-5 h-5 text-[#ff6c55]" />
            <input
              type="text"
              aria-label="Kullanıcı e-posta adresi"
              placeholder="E-posta adresiyle kullanıcı ara"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="w-full min-w-0 bg-[#090b0e] text-[#f7f8fa] pl-12 pr-4 py-4 rounded-none focus:outline-none focus:ring-2 focus:ring-[#ff543b]/50 border border-white/[0.12] text-base"
            />
            <button type="submit" disabled={isSearching} className="flex justify-center items-center bg-[#ff543b] text-[#090b0e] px-8 py-4 rounded-none font-semibold text-base hover:bg-[#ff6c55] transition-colors disabled:opacity-50">
              {isSearching ? <RefreshCw className="w-5 h-5 animate-spin" /> : "Bul"}
            </button>
          </form>

          {searchResults.length > 0 && (
            <div className="flex flex-col gap-4">
              {searchResults.map(user => (
                <div key={user.id} className="bg-[#090b0e] border border-white/[0.12] rounded-none p-6 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:border-[#ff543b]/20 transition-all">

                  {/* User Info */}
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-none bg-[#090b0e] border border-white/10 flex items-center justify-center text-[#ff6c55] font-bold text-xl overflow-hidden shrink-0">
                      {user.image ? <img src={user.image} alt="Profil fotoğrafı" className="w-full h-full object-cover" /> : user.name?.charAt(0).toLocaleUpperCase("tr-TR")}
                    </div>
                    <div>
                      <h4 className="text-lg font-bold text-[#f7f8fa] flex items-center gap-2">
                        {user.name}
                        {user.role === "ADMIN" && <Shield className="w-4 h-4 text-red-500" />}
                        {user.isVerifiedArtist && <Check className="w-4 h-4 text-[#ff6c55]" />}
                      </h4>
                      <p className="text-[#adb5c0] text-base font-mono">{user.email}</p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex flex-wrap items-center gap-4">

                    {/* Role Toggle */}
                    <select
                      value={user.role}
                      onChange={(e) => handleUpdateUser(user.id, { role: e.target.value })}
                      className="bg-black border border-white/10 text-[#f7f8fa] px-4 py-2.5 rounded-none text-base focus:outline-none focus:border-[#ff543b]"
                    >
                      <option value="USER">Üye</option>
                      <option value="ARTIST">Sanatçı</option>
                      <option value="ADMIN">Yönetici</option>
                    </select>

                    {/* Artist Toggle */}
                    <button
                      onClick={() => handleUpdateUser(user.id, { isVerifiedArtist: !user.isVerifiedArtist })}
                      className={`px-4 py-2.5 rounded-none text-base font-bold transition-colors border ${user.isVerifiedArtist ? 'bg-[#ff543b]/10 text-[#ff6c55] border-[#ff543b]/30' : 'bg-black border-white/10 text-[#adb5c0] hover:text-[#f7f8fa]'}`}
                    >
                      {user.isVerifiedArtist ? "Sanatçı onayını kaldır" : "Sanatçıyı doğrula"}
                    </button>

                    {/* Credits Control */}
                    <div className="flex items-center bg-black border border-white/10 rounded-none overflow-hidden">
                      <div className="px-4 py-2.5 text-[#adb5c0] text-base font-mono border-r border-white/10 bg-white/5">
                        Yükleme hakkı: <strong className="text-[#f7f8fa]">{user.uploadCredits}</strong>
                      </div>
                      <button
                        aria-label="Yükleme hakkını azalt"
                        onClick={() => handleUpdateUser(user.id, { uploadCredits: Math.max(0, user.uploadCredits - 1) })}
                        className="p-2.5 hover:bg-white/10 text-[#adb5c0] hover:text-red-400 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <button
                        aria-label="Yükleme hakkını artır"
                        onClick={() => handleUpdateUser(user.id, { uploadCredits: user.uploadCredits + 1 })}
                        className="p-2.5 hover:bg-white/10 text-[#adb5c0] hover:text-[#ff6c55] transition-colors"
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
