"use client";
import { signIn, signOut } from "next-auth/react";
import { CheckCircle2, LogOut, ShieldAlert, Plus, Trophy } from "lucide-react";
import Link from "next/link";
import NotificationBell from "./NotificationBell";

export default function AuthStatus({ session }: { session: any }) {
  if (session) {
    const { user } = session;
    const isArtist = user.role === "ARTIST" && user.isVerifiedArtist;
    const isAdmin = user.role === "ADMIN";

    return (
      <div className="flex max-w-full flex-wrap items-center gap-2 sm:gap-3">
        {/* Liderlik Tablosu Button */}
        <Link
          href="/liderler"
          className="flex items-center justify-center bg-[#12161b] border border-white/[0.09] hover:border-[#ff543b]/60 hover:bg-[#ff543b]/5 transition-colors p-2 rounded-none group"
          title="Liderlik Tablosu"
        >
          <Trophy className="w-5 h-5 text-[#b8bec8] group-hover:text-[#ff6c55] transition-colors" strokeWidth={2} />
        </Link>

        {/* Upload Button */}
        <Link
          href="/yukle"
          className="flex items-center gap-2 bg-[#12161b] border border-white/[0.09] hover:border-[#ff543b]/60 hover:bg-[#ff543b]/5 transition-colors py-2 px-4 rounded-none group"
          title="Şarkı Yükle"
        >
          <Plus className="w-4 h-4 text-[#ff6c55] group-hover:scale-110 transition-transform" strokeWidth={2.5} />
          <span className="text-xs font-semibold text-[#ff6c55] uppercase tracking-widest hidden sm:inline-block">Yükle</span>
        </Link>

        {/* Bildirim Çanı */}
        <NotificationBell />

        {/* User Profile Info */}
        <div className="flex items-center gap-3 bg-[#12161b] border border-white/[0.09] max-w-full py-2 px-3 rounded-none">
          {user.image ? (
            <img src={user.image} alt="Profil fotoğrafı" className="w-8 h-8 rounded-none border border-white/10" />
          ) : (
            <div className="w-8 h-8 rounded-none bg-[#ff543b]/20 text-[#ff6c55] flex items-center justify-center font-semibold text-xs border border-[#ff543b]/30">
              {user.name?.charAt(0).toLocaleUpperCase("tr-TR")}
            </div>
          )}
          <Link href="/profile" className="min-w-0 flex flex-col pr-2 hover:opacity-80 transition-opacity">
            <div className="flex items-center gap-1.5">
              <p className="max-w-[140px] truncate font-semibold text-[#f7f8fa] text-sm leading-none">{user.name}</p>
              {isArtist && <span title="Doğrulanmış Sanatçı"><CheckCircle2 className="w-3.5 h-3.5 text-[#ff6c55]" /></span>}
              {isAdmin && <span title="Yönetici"><ShieldAlert className="w-3.5 h-3.5 text-red-500" /></span>}
            </div>
            <p className="text-xs text-[#adb5c0] font-mono mt-1 leading-none uppercase tracking-widest">
              {isArtist ? "Sanatçı" : isAdmin ? "Yönetici" : `${user.uploadCredits} yükleme hakkı`}
            </p>
          </Link>

          {isAdmin && (
            <Link href="/admin" className="p-1.5 hover:bg-[#1b222c] rounded-none transition-colors text-[#b8bec8] hover:text-[#f7f8fa]" title="Yönetici Paneli">
              <ShieldAlert className="w-4 h-4" />
            </Link>
          )}

          <button
            onClick={() => signOut()}
            className="p-1.5 hover:bg-red-500/10 rounded-none transition-colors text-[#adb5c0] hover:text-red-500"
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
      className="bg-[#ff543b] hover:bg-[#ff806c] text-[#090b0e] px-5 py-3 rounded-none font-semibold transition-colors text-sm tracking-wide"
    >
      Giriş Yap
    </button>
  );
}
