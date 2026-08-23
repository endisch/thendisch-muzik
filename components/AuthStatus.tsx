"use client";

import { signIn, signOut } from "next-auth/react";
import { CheckCircle2, LogOut, ShieldAlert, Plus } from "lucide-react";
import Link from "next/link";

export default function AuthStatus({ session }: { session: any }) {
  if (session) {
    const { user } = session;
    const isArtist = user.role === "ARTIST" && user.isVerifiedArtist;
    const isAdmin = user.role === "ADMIN";

    return (
      <div className="flex items-center gap-3">
        {/* Upload Button */}
        <Link 
          href="/yukle" 
          className="flex items-center gap-2 bg-zinc-900/50 backdrop-blur-md border border-white/[0.06] hover:border-[#D4AF37]/50 hover:bg-[#D4AF37]/10 transition-all py-2 px-4 rounded-2xl group"
          title="Şarkı Yükle"
        >
          <Plus className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          <span className="text-xs font-bold text-[#D4AF37] uppercase tracking-widest hidden sm:inline-block">Yükle</span>
        </Link>

        {/* User Profile Info */}
        <div className="flex items-center gap-3 bg-zinc-900/50 backdrop-blur-md border border-white/[0.06] py-2 px-3 rounded-2xl">
          {user.image ? (
            <img src={user.image} alt="Avatar" className="w-8 h-8 rounded-full border border-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] flex items-center justify-center font-bold text-xs border border-[#D4AF37]/30">
              {user.name?.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col pr-2">
            <div className="flex items-center gap-1.5">
              <p className="font-bold text-white text-sm leading-none">{user.name}</p>
              {isArtist && <span title="Doğrulanmış Sanatçı"><CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" /></span>}
              {isAdmin && <span title="Yönetici"><ShieldAlert className="w-3.5 h-3.5 text-red-500" /></span>}
            </div>
            <p className="text-[10px] text-zinc-500 font-mono mt-1 leading-none uppercase tracking-widest">
              {isArtist ? "Sanatçı" : isAdmin ? "Admin" : `Kredi: ${user.uploadCredits}`}
            </p>
          </div>
          
          {isAdmin && (
            <Link href="/admin" className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white" title="Yönetici Paneli">
              <ShieldAlert className="w-4 h-4" />
            </Link>
          )}

          <button 
            onClick={() => signOut()} 
            className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors text-zinc-500 hover:text-red-500"
            title="Çıkış Yap"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <button 
      onClick={() => signIn()} 
      className="bg-[#D4AF37] hover:bg-[#F3E5AB] text-black px-5 py-2.5 rounded-xl font-black transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] text-sm tracking-wide"
    >
      Giriş Yap
    </button>
  );
}
