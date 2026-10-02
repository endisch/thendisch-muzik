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
    <main className="relative min-h-screen bg-[#090b0e] text-[#f7f8fa] antialiased overflow-x-hidden selection:bg-[#ff543b]/30 selection:text-[#ff6c55]">
      <SiteNavigation actions={<AuthStatus session={session} />} />

      <div className="studio-page-width relative z-10 py-12 sm:py-16">
        <div className="mb-8 flex items-center justify-end">
          {session?.user?.role === "ARTIST" && session?.user?.isVerifiedArtist && (
            <div className="bg-[#ff543b]/10 border border-[#ff543b]/20 px-3 py-1.5 rounded-none flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#ff6c55]" />
              <span className="text-[#ff6c55] font-bold text-sm tracking-wide uppercase">Doğrulanmış Sanatçı</span>
            </div>
          )}
        </div>

        <div className="mb-10">
          <p className="studio-page-kicker mb-3">Üretimini paylaş</p>
          <h1 className="studio-page-title mb-4">Şarkını <span className="studio-page-title-accent">paylaş.</span></h1>
          <p className="text-[#adb5c0] text-base sm:text-lg max-w-2xl leading-relaxed">
            Şarkını Thendisch Studio topluluğuyla paylaş, Müzik Odası’nda dinleyicilerle buluştur.
          </p>
        </div>

        <div className="bg-[#12161b] border border-white/[0.12] rounded-none p-5 sm:p-8 relative">
          <YukleClientView session={session} />
        </div>
      </div>
    </main>
  );
}
