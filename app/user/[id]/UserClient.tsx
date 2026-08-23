"use client";

import { CheckCircle2, ShieldAlert, Instagram, Youtube, Music, Calendar } from "lucide-react";

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
  songs: { id: string; title: string; artist: string; coverUrl: string | null }[];
};

export default function UserClient({ user }: { user: PublicUser }) {
  return (
    <div className="flex flex-col gap-8">
      
      {/* Profil Kartı */}
      <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-2xl relative overflow-hidden">
        
        {/* Dekoratif Yansıma */}
        <div className="absolute top-0 right-0 p-8 opacity-20 pointer-events-none">
          {user.isVerifiedArtist ? <CheckCircle2 className="w-64 h-64 text-[#D4AF37]" /> : <UserDecoration />}
        </div>
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 relative z-10">
          <div className="w-40 h-40 rounded-[2.5rem] border-4 border-[#D4AF37]/30 flex items-center justify-center bg-zinc-900 overflow-hidden shadow-[0_0_40px_rgba(212,175,55,0.2)] shrink-0">
            {user.image ? (
              <img src={user.image} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-7xl font-black text-[#D4AF37]">{user.name?.charAt(0).toUpperCase()}</span>
            )}
          </div>
          
          <div className="text-center md:text-left flex-1 w-full">
            <h2 className="text-4xl md:text-5xl font-black text-white flex flex-col md:flex-row items-center gap-4 mb-4">
              {user.name}
              <div className="flex items-center gap-2">
                {user.isVerifiedArtist && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37] text-sm uppercase tracking-widest font-bold">
                    <CheckCircle2 className="w-4 h-4" /> VIP
                  </span>
                )}
                {user.role === "ADMIN" && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/30 text-red-500 text-sm uppercase tracking-widest font-bold">
                    <ShieldAlert className="w-4 h-4" /> Admin
                  </span>
                )}
              </div>
            </h2>
            
            {user.bio ? (
              <p className="text-zinc-300 mb-6 max-w-2xl leading-relaxed bg-black/30 p-5 rounded-2xl border border-white/5 text-lg">{user.bio}</p>
            ) : (
              <p className="text-zinc-500 italic mb-6">Bu kullanıcı henüz kendinden bahsetmemiş.</p>
            )}

            {/* Sosyal Linkler */}
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-8">
              {user.instagramUrl && (
                <a href={user.instagramUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-pink-500/20 text-zinc-300 hover:text-pink-400 border border-white/10 px-5 py-2.5 rounded-xl transition-all text-sm font-bold">
                  <Instagram className="w-5 h-5" /> Instagram
                </a>
              )}
              {user.spotifyUrl && (
                <a href={user.spotifyUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-green-500/20 text-zinc-300 hover:text-green-400 border border-white/10 px-5 py-2.5 rounded-xl transition-all text-sm font-bold">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.54.659.3 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.02.6-1.14C9.6 9.9 15.001 10.62 18.66 12.9c.42.24.6.84.3 1.26zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.6.18-1.2.72-1.38 4.26-1.26 11.28-1.02 15.72 1.621.539.3.719 1.02.419 1.56-.239.54-.899.72-1.439.42z"/></svg>
                  Spotify
                </a>
              )}
              {user.youtubeUrl && (
                <a href={user.youtubeUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 bg-white/5 hover:bg-red-500/20 text-zinc-300 hover:text-red-500 border border-white/10 px-5 py-2.5 rounded-xl transition-all text-sm font-bold">
                  <Youtube className="w-5 h-5" /> YouTube
                </a>
              )}
            </div>
            
            <div className="flex items-center justify-center md:justify-start gap-2 text-zinc-500 text-sm font-medium">
              <Calendar className="w-4 h-4" /> 
              {new Date(user.createdAt).toLocaleDateString("tr-TR")} tarihinden beri üye
            </div>
          </div>
        </div>
      </div>

      {/* Yüklediği Şarkılar */}
      <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 md:p-12 shadow-2xl mt-4">
        <h3 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
          <Music className="w-6 h-6 text-[#D4AF37]" />
          Radyoya Yüklediği Şarkılar
        </h3>

        {user.songs.length === 0 ? (
          <p className="text-zinc-500 italic bg-white/5 p-6 rounded-2xl text-center border border-white/5">Henüz radyoya hiç şarkı yüklememiş.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {user.songs.map((song) => (
              <div key={song.id} className="flex items-center gap-4 bg-black/40 p-4 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-colors group">
                <div className="w-14 h-14 rounded-xl bg-zinc-900 border border-white/10 overflow-hidden shrink-0">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Music className="w-6 h-6 text-[#D4AF37]/50" />
                    </div>
                  )}
                </div>
                <div className="flex-1 truncate">
                  <p className="font-bold text-white truncate group-hover:text-[#D4AF37] transition-colors">{song.title}</p>
                  <p className="text-xs text-zinc-400 truncate">{song.artist}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
