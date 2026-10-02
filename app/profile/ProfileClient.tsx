"use client";

import { BrandIcon } from "@/components/BrandIcon";

import { useState } from "react";
import { Music2, CheckCircle2, ShieldAlert, Clock, ArrowRight, Edit3, X, Edit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import SongEditModal from "./SongEditModal";

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
  songs?: any[];
};

export default function ProfileClient({ user }: { user: UserData }) {
  const [instagram, setInstagram] = useState(user.instagramUrl || "");
  const [spotify, setSpotify] = useState(user.spotifyUrl || "");
  const [youtube, setYoutube] = useState(user.youtubeUrl || "");

  // Edit Profile States
  const [isEditing, setIsEditing] = useState(false);
  const [editingSong, setEditingSong] = useState<any>(null);
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="bg-[#12161b] border border-white/10 rounded-none w-full max-w-xl max-h-[90vh] flex flex-col shadow-none overflow-hidden relative">
            <div className="flex items-center justify-between p-6 border-b border-white/[0.12] bg-[#12161b]">
              <h3 className="font-semibold text-[#f7f8fa] text-xl">Profili düzenle</h3>
              <button onClick={() => setIsEditing(false)} aria-label="Profil düzenlemeyi kapat" className="p-3 bg-white/5 hover:bg-white/10 rounded-none transition-colors text-[#adb5c0]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
              <form onSubmit={handleUpdateProfile} className="flex flex-col gap-5">
                <div>
                  <label className="block text-sm font-mono tracking-wide text-[#adb5c0] mb-2">Kullanıcı adı</label>
                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-[#090b0e] text-[#f7f8fa] px-4 py-3.5 rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" />
                </div>
                <div>
                  <label className="block text-sm font-mono tracking-wide text-[#adb5c0] mb-2">Profil fotoğrafı bağlantısı</label>
                  <input type="url" value={editImage} onChange={(e) => setEditImage(e.target.value)} placeholder="https://..." className="w-full bg-[#090b0e] text-[#f7f8fa] px-4 py-3.5 rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" />
                </div>
                <div>
                  <label className="block text-sm font-mono tracking-wide text-[#adb5c0] mb-2">Hakkımda</label>
                  <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} rows={3} placeholder="Müzik zevkinden, kendinden bahset..." className="w-full bg-[#090b0e] text-[#f7f8fa] px-4 py-3.5 rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/[0.12] resize-none"></textarea>
                </div>

                <div className="border-t border-white/[0.12] my-2"></div>
                <h4 className="text-base font-bold text-[#ff6c55]">Sosyal medya bağlantıları</h4>

                <div>
                  <label className="block text-sm font-mono tracking-wide text-[#adb5c0] mb-2">Instagram profil bağlantısı</label>
                  <input type="url" value={instagram} onChange={(e) => setInstagram(e.target.value)} className="w-full bg-[#090b0e] text-[#f7f8fa] px-4 py-3.5 rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" />
                </div>
                <div>
                  <label className="block text-sm font-mono tracking-wide text-[#adb5c0] mb-2">Spotify bağlantısı</label>
                  <input type="url" value={spotify} onChange={(e) => setSpotify(e.target.value)} className="w-full bg-[#090b0e] text-[#f7f8fa] px-4 py-3.5 rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" />
                </div>
                <div>
                  <label className="block text-sm font-mono tracking-wide text-[#adb5c0] mb-2">YouTube kanal bağlantısı</label>
                  <input type="url" value={youtube} onChange={(e) => setYoutube(e.target.value)} className="w-full bg-[#090b0e] text-[#f7f8fa] px-4 py-3.5 rounded-none focus:outline-none focus:ring-1 focus:ring-[#ff543b] border border-white/5" />
                </div>

                <button type="submit" disabled={loading} className="w-full mt-4 bg-[#ff543b] hover:bg-[#ff6c55] text-[#090b0e] font-semibold py-4 rounded-none transition-all disabled:opacity-50 tracking-wide uppercase">
                  {loading ? "Kaydediliyor..." : "Kaydet"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Profil Kartı */}
      <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-8 md:p-12 shadow-none relative overflow-hidden group">


        <button
          onClick={() => setIsEditing(true)}
          className="relative z-20 mb-6 flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-[#ff543b]/10 hover:text-[#ff6c55] text-[#f7f8fa] rounded-none transition-colors border border-white/[0.12] font-semibold text-base"
        >
          <Edit3 className="w-4 h-4" /> Profili düzenle
        </button>

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="flex h-32 w-32 shrink-0 items-center justify-center overflow-hidden rounded-none border border-white/15 bg-[#12161b] md:h-40 md:w-40">
            {user.image ? (
              <img src={user.image} alt="Profil fotoğrafı" className="w-full h-full object-cover" />
            ) : (
              <span className="text-5xl md:text-7xl font-semibold text-[#ff6c55]">{user.name?.charAt(0).toLocaleUpperCase("tr-TR")}</span>
            )}
          </div>

          <div className="text-center md:text-left flex-1 min-w-0 w-full">
            <h2 className="text-3xl md:text-4xl font-semibold text-[#f7f8fa] flex flex-col md:flex-row items-center gap-3 mb-2">
              {user.name}
              <div className="flex items-center gap-2">
                {user.isVerifiedArtist && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#ff543b]/10 border border-[#ff543b]/30 text-[#ff6c55] text-sm tracking-wide font-bold">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sanatçı
                  </span>
                )}
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-red-500/10 border border-red-500/30 text-red-500 text-sm tracking-wide font-bold">
                    <ShieldAlert className="w-3.5 h-3.5" /> Yönetici
                  </span>
                )}
              </div>
            </h2>
            <p className="text-[#adb5c0] text-base mb-6 break-all">{user.email}</p>

            {user.bio && (
              <p className="text-[#f7f8fa] mb-6 max-w-2xl leading-relaxed bg-[#090b0e] p-4 rounded-none border border-white/5">{user.bio}</p>
            )}

            {/* Sosyal Linkler */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
              {user.instagramUrl && (
                <a href={user.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-[#ff543b]/10 text-[#f7f8fa] hover:text-[#ff6c55] border border-white/10 px-4 py-2 rounded-none transition-all text-base font-bold">
                  <BrandIcon name="instagram" className="w-6 h-6" /> Instagram
                </a>
              )}
              {user.spotifyUrl && (
                <a href={user.spotifyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-[#ff543b]/10 text-[#f7f8fa] hover:text-[#ff6c55] border border-white/10 px-4 py-2 rounded-none transition-all text-base font-bold">
                  <BrandIcon name="spotify" className="w-6 h-6" />
                  Spotify
                </a>
              )}
              {user.youtubeUrl && (
                <a href={user.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-[#f7f8fa] hover:text-red-500 border border-white/10 px-4 py-2 rounded-none transition-all text-base font-bold">
                  <BrandIcon name="youtube" className="w-6 h-6" /> YouTube
                </a>
              )}
            </div>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                <div className="bg-[#12161b] border border-white/10 rounded-none p-4 sm:p-5 flex flex-col justify-center transition-colors">
                  <p className="text-sm tracking-[0.04em] text-[#ff6c55] mb-1.5 opacity-90">Yükleme hakkı</p>
                  <p className="text-2xl font-semibold text-[#f7f8fa]">{user.uploadCredits}</p>
                </div>
                <div className="bg-[#12161b] border border-white/10 rounded-none p-4 sm:p-5 flex flex-col justify-center transition-colors">
                  <p className="text-sm tracking-[0.04em] text-[#adb5c0] mb-1.5 opacity-90">Hesap türü</p>
                  <p className="text-xl font-semibold text-[#f7f8fa]">
                    {user.isVerifiedArtist ? "Doğrulanmış sanatçı" : user.role === "ADMIN" ? "Yönetici" : "Dinleyici"}
                  </p>
                </div>
                <div className="bg-[#12161b] border border-white/10 rounded-none p-4 sm:p-5 flex flex-col justify-center transition-colors">
                  <p className="text-sm tracking-[0.04em] text-[#adb5c0] mb-1.5 opacity-90">Dinlenen parça</p>
                  <p className="text-2xl font-semibold text-[#f7f8fa]">{user.songsListened}</p>
                </div>
                <div className="bg-[#12161b] border border-white/10 rounded-none p-4 sm:p-5 flex flex-col justify-center transition-colors">
                  <p className="text-sm tracking-[0.04em] text-[#adb5c0] mb-1.5 opacity-90">Katılım tarihi</p>
                  <p className="text-xl font-semibold text-[#f7f8fa]" suppressHydrationWarning>
                    {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>
          </div>
        </div>
      </div>

      {/* Sanatçı Başvurusu Bölümü */}
      {!user.isVerifiedArtist && (
        <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-8 md:p-12 shadow-none mt-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-none bg-[#ff543b]/10 flex items-center justify-center text-[#ff6c55]">
              <Music2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-[#f7f8fa]">Sanatçı başvurusu</h3>
              <p className="text-[#adb5c0] text-base mt-1">Üretimlerini toplulukla paylaşmak için sanatçı hesabına başvur.</p>
            </div>
          </div>

          {user.artistApplication ? (
            <div className="bg-[#ff543b]/5 border border-[#ff543b]/20 rounded-none p-6 flex flex-col items-center text-center">
              <Clock className="w-12 h-12 text-[#ff6c55] mb-4" />
              <h4 className="text-lg font-bold text-[#ff6c55] mb-2">Başvurun inceleniyor</h4>
              <p className="text-[#adb5c0] text-base max-w-md leading-relaxed">Sosyal medya hesapların inceleniyor. Başvurun onaylandığında e-posta ile haber vereceğiz.</p>
            </div>
          ) : (
            <form onSubmit={handleApplyArtist} className="flex flex-col gap-5 mt-8">
              {message && (
                <div className="p-4 rounded-none bg-white/5 border border-white/10 text-center font-medium text-[#f7f8fa]">
                  {message}
                </div>
              )}

              <div className="text-base text-[#adb5c0] mb-4 bg-white/5 p-4 rounded-none border border-white/10">
                Profiline eklediğin sosyal medya bağlantıları başvurunda kullanılır. Eksik bağlantıları <strong>Profili düzenle</strong> bölümünden tamamlayabilirsin.
              </div>

              <button type="submit" disabled={loading} className="w-full bg-[#ff543b] hover:bg-[#ff6c55] text-[#090b0e] font-semibold py-4 rounded-none transition-all shadow-none hover:shadow-none disabled:opacity-50 tracking-wide flex justify-center items-center gap-2">
                {loading ? "Gönderiliyor..." : "Başvuruyu gönder"} <ArrowRight className="w-5 h-5" />
              </button>
            </form>
          )}
        </div>
      )}

      {/* Yüklediği Şarkılar */}
      {user.songs && user.songs.length > 0 && (
        <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-8 md:p-12 shadow-none mt-4">
          <h3 className="text-2xl font-semibold text-[#f7f8fa] mb-6 flex items-center gap-3">
            <Music2 className="w-6 h-6 text-[#ff6c55]" />
            Paylaştığın parçalar
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.songs.map((song) => (
              <div key={song.id} className="flex items-center justify-between bg-[#090b0e] p-4 rounded-none border border-white/[0.12] hover:border-[#ff543b]/30 transition-colors group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-14 h-14 rounded-none bg-[#090b0e] border border-white/10 overflow-hidden shrink-0">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt="Parça kapağı" className="w-full h-full object-cover transition-opacity duration-200" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Music2 className="w-6 h-6 text-[#ff6c55]" />
                      </div>
                    )}
                  </div>
                  <div className="truncate">
                    <p className="font-bold text-[#f7f8fa] truncate group-hover:text-[#ff6c55] transition-colors">{song.title}</p>
                    <p className="text-sm text-[#adb5c0] truncate">{song.artist}</p>
                  </div>
                </div>
                <button
                  onClick={() => setEditingSong(song)}
                  className="p-3 hover:bg-white/10 rounded-none transition-colors text-[#adb5c0] hover:text-[#ff6c55] shrink-0"
                  title="Düzenle"
                  aria-label={`${song.title} parçasını düzenle`}
                >
                  <Edit2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingSong && (
        <SongEditModal song={editingSong} onClose={() => setEditingSong(null)} />
      )}
    </div>
  );
}
