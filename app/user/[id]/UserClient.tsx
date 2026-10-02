"use client";

import { BrandIcon } from "@/components/BrandIcon";

import { Calendar, CheckCircle2, Music, ShieldAlert } from "lucide-react";

type PublicUser = {
  id: string;
  name: string | null;
  image: string | null;
  bio: string | null;
  role: string;
  isVerifiedArtist: boolean;
  instagramUrl: string | null;
  spotifyUrl: string | null;
  youtubeUrl: string | null;
  createdAt: Date;
  songsListened: number;
  songs: { id: string; title: string; artist: string; coverUrl: string | null }[];
};

export default function UserClient({ user }: { user: PublicUser }) {
  return (
    <div className="flex flex-col gap-8">

      {/* Profil Kartı */}
      <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-8 md:p-12 shadow-none relative overflow-hidden">


        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-40 h-40 rounded-none border-4 border-[#ff543b]/30 flex items-center justify-center bg-[#090b0e] overflow-hidden shadow-none shrink-0">
            {user.image ? (
              <img src={user.image} alt="Profil fotoğrafı" className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl font-semibold text-[#ff6c55]">{user.name?.charAt(0).toLocaleUpperCase("tr-TR")}</span>
            )}
          </div>

          <div className="text-center md:text-left flex-1 w-full">
            <h2 className="text-4xl md:text-5xl font-semibold text-[#f7f8fa] flex flex-col md:flex-row items-center gap-4 mb-4">
              {user.name}
              <div className="flex items-center gap-2">
                {user.isVerifiedArtist && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-[#ff543b]/10 border border-[#ff543b]/30 text-[#ff6c55] text-base tracking-wide font-bold">
                    <CheckCircle2 className="w-4 h-4" /> Sanatçı
                  </span>
                )}
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-none bg-red-500/10 border border-red-500/30 text-red-500 text-base tracking-wide font-bold">
                    <ShieldAlert className="w-4 h-4" /> Yönetici
                  </span>
                )}
              </div>
            </h2>

            {user.bio ? (
              <p className="text-[#f7f8fa] mb-6 max-w-2xl leading-relaxed bg-[#090b0e] p-5 rounded-none border border-white/[0.12] text-lg">{user.bio}</p>
            ) : (
              <p className="text-[#adb5c0] italic mb-6">Henüz bir profil açıklaması eklenmemiş.</p>
            )}

            {/* Sosyal Linkler */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
              {user.instagramUrl && (
                <a href={user.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-[#ff543b]/10 text-[#f7f8fa] hover:text-[#ff6c55] border border-white/10 px-5 py-2.5 rounded-none transition-all text-base font-bold">
                  <BrandIcon name="instagram" className="w-6 h-6" /> Instagram
                </a>
              )}
              {user.spotifyUrl && (
                <a href={user.spotifyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-[#ff543b]/10 text-[#f7f8fa] hover:text-[#ff6c55] border border-white/10 px-5 py-2.5 rounded-none transition-all text-base font-bold">
                  <BrandIcon name="spotify" className="w-6 h-6" />
                  Spotify
                </a>
              )}
              {user.youtubeUrl && (
                <a href={user.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-[#f7f8fa] hover:text-red-500 border border-white/10 px-5 py-2.5 rounded-none transition-all text-base font-bold">
                  <BrandIcon name="youtube" className="w-6 h-6" /> YouTube
                </a>
              )}
            </div>

            <div className="flex items-center justify-center md:justify-start gap-4 text-[#adb5c0] text-base font-medium">
              <div className="flex items-center gap-1.5" suppressHydrationWarning>
                <Calendar className="w-4 h-4" />
                {new Date(user.createdAt).toLocaleDateString("tr-TR")}
              </div>
              <div className="w-1 h-1 rounded-none bg-white/20" />
              <div className="flex items-center gap-1.5">
                <Music className="w-4 h-4" />
                {user.songsListened} şarkı dinledi
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Yüklediği Şarkılar */}
      <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-8 md:p-12 shadow-none mt-4">
        <h3 className="text-2xl font-semibold text-[#f7f8fa] mb-6 flex items-center gap-3">
          <Music className="w-6 h-6 text-[#ff6c55]" />
          Paylaştığı parçalar
        </h3>

        {user.songs.length === 0 ? (
          <p className="text-[#adb5c0] italic bg-white/5 p-6 rounded-none text-center border border-white/5">Henüz paylaşılan parça yok.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.songs.map((song) => (
              <div key={song.id} className="flex items-center gap-4 bg-[#090b0e] p-4 rounded-none border border-white/[0.12] hover:border-[#ff543b]/30 transition-colors group">
                <div className="w-14 h-14 rounded-none bg-[#090b0e] border border-white/10 overflow-hidden shrink-0">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="Parça kapağı" className="w-full h-full object-cover transition-opacity duration-200" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-6 h-6 text-[#ff6c55]" />
                    </div>
                  )}
                </div>
                <div className="flex-1 truncate">
                  <p className="font-bold text-[#f7f8fa] truncate group-hover:text-[#ff6c55] transition-colors">{song.title}</p>
                  <p className="text-sm text-[#adb5c0] truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
