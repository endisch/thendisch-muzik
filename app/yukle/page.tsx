import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import YukleClientView from "./YukleClientView";

export const dynamic = "force-dynamic";

export default async function YuklePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="relative min-h-screen bg-[#0B0C10] text-white antialiased overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      {/* Avant-Garde Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <Link href="/muzik" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Radyoya Dön
          </Link>
          
          {session?.user?.role === "ARTIST" && session?.user?.isVerifiedArtist && (
            <div className="bg-[#D4AF37]/10 border border-[#D4AF37]/20 px-3 py-1.5 rounded-full flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              <span className="text-[#D4AF37] font-bold text-xs tracking-wide uppercase">Doğrulanmış Sanatçı</span>
            </div>
          )}
        </div>

        <div className="mb-12 text-center">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-4">Şarkını <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#8A6D1C]">Sahnele</span></h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-light">
            Eserini Thendisch topluluğu ile paylaş. VIP Lounge radyo kuyruğunda yerini al.
          </p>
        </div>

        <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 shadow-2xl relative">
          <YukleClientView session={session} />
        </div>
      </div>
    </main>
  );
}
