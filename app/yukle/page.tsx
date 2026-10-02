import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { CheckCircle2 } from "lucide-react";
import YukleClientView from "./YukleClientView";
import AuthStatus from "@/components/AuthStatus";
import { SiteNavigation } from "@/components/SiteNavigation";

export const dynamic = "force-dynamic";

export default async function YuklePage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="relative min-h-screen bg-[#100F0E] text-white antialiased overflow-x-hidden selection:bg-[#9A7950]/30 selection:text-[#D0B98D]">
      <SiteNavigation actions={<AuthStatus session={session} />} />
      {/* Avant-Garde Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#9A7950]/5 hidden" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#9A7950]/5 hidden" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-end">
          {session?.user?.role === "ARTIST" && session?.user?.isVerifiedArtist && (
            <div className="bg-[#9A7950]/10 border border-[#9A7950]/20 px-3 py-1.5 rounded-full flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D0B98D]" />
              <span className="text-[#D0B98D] font-bold text-xs tracking-wide uppercase">Doğrulanmış Sanatçı</span>
            </div>
          )}
        </div>

        <div className="mb-12 text-center">
          <h1 className="studio-page-title mb-4">Şarkını <span className="studio-page-title-accent">Sahnele</span></h1>
          <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto font-light">
            Eserini Thendisch topluluğu ile paylaş. VIP Lounge radyo kuyruğunda yerini al.
          </p>
        </div>

        <div className="bg-[#171614]/50  border border-white/[0.05] rounded-xl p-8 shadow-2xl relative">
          <YukleClientView session={session} />
        </div>
      </div>
    </main>
  );
}
