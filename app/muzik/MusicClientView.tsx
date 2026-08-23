"use client";

import { useState } from "react";
import QueueList from "@/components/QueueList";
import Link from "next/link";
import { Plus, CheckCircle2, ShieldAlert } from "lucide-react";

export default function MusicClientView({ session }: { session: any }) {
  const [refreshQueue, setRefreshQueue] = useState(0);

  const user = session?.user;

  // Upload Permission Logic
  let canUpload = false;
  let uploadMessage = "";

  if (user) {
    if (user.role === "ARTIST" && user.isVerifiedArtist) {
      canUpload = true; 
    } else if (user.uploadCredits > 0) {
      canUpload = true;
    } else {
      uploadMessage = "Yükleme hakkınız bitmiş. Radyodan 10 şarkı dinleyerek yeni bir hak kazanabilirsiniz.";
    }
  }

  return (
    <>
      <div className="flex flex-col gap-6">
        {/* User Status and Upload Button */}
        <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-[50px] pointer-events-none" />
          
          {user ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                  {user.image ? (
                    <img src={user.image} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-sm font-bold text-[#D4AF37]">{user.name?.charAt(0).toUpperCase()}</span>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-white font-bold tracking-tight">{user.name}</h3>
                    {user.isVerifiedArtist && <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />}
                    {user.role === "ADMIN" && <ShieldAlert className="w-4 h-4 text-red-500" />}
                  </div>
                  <p className="text-xs text-zinc-500 font-mono mt-1">
                    {user.isVerifiedArtist ? "DOĞRULANMIŞ SANATÇI" : `${user.uploadCredits} YÜKLEME HAKKI`}
                  </p>
                </div>
              </div>

              {canUpload ? (
                <Link href="/yukle" className="group mt-2 relative flex items-center justify-center gap-2 w-full bg-[#D4AF37] hover:bg-[#F3E5AB] text-black px-4 py-3.5 rounded-2xl font-black transition-all shadow-[0_0_15px_rgba(212,175,55,0.2)] hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] text-sm tracking-wide overflow-hidden">
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                  <Plus className="w-5 h-5 relative z-10" />
                  <span className="relative z-10">ŞARKI YÜKLE</span>
                </Link>
              ) : (
                <div className="mt-2 bg-zinc-900/50 border border-white/5 p-4 rounded-xl text-center">
                  <p className="font-medium text-zinc-400 text-xs leading-relaxed">
                    {uploadMessage}
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-4">
              <p className="text-sm text-zinc-400 font-medium mb-4">Şarkı yüklemek ve sohbete katılmak için giriş yapmalısınız.</p>
              <Link href="/login" className="bg-white/5 hover:bg-white/10 text-white border border-white/10 px-6 py-2.5 rounded-full text-xs font-bold tracking-widest uppercase transition-colors">
                Giriş Yap
              </Link>
            </div>
          )}
        </div>

        {/* Queue List */}
        <QueueList refreshTrigger={refreshQueue} />
      </div>
    </>
  );
}
