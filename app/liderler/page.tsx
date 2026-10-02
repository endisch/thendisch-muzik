import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Headphones, Star } from "lucide-react";
import { SiteNavigation } from "@/components/SiteNavigation";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  // Top 10 Listeners
  const topListeners = await prisma.user.findMany({
    orderBy: { songsListened: "desc" },
    take: 10,
    select: { id: true, name: true, image: true, songsListened: true, isVerifiedArtist: true }
  });

  // Top 10 Curators (Kullanıcıların yüklediği tüm şarkıların aldığı toplam oylar)
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      image: true,
      isVerifiedArtist: true,
      songs: { select: { votesCount: true } }
    }
  });

  const topCurators = users.map(u => {
    const totalVotes = u.songs.reduce((acc, song) => acc + song.votesCount, 0);
    return { ...u, totalVotes };
  }).filter(u => u.totalVotes > 0)
    .sort((a, b) => b.totalVotes - a.totalVotes)
    .slice(0, 10);

  return (
    <main className="relative min-h-screen bg-[#100F0E] text-white antialiased overflow-x-hidden selection:bg-[#9A7950]/30 selection:text-[#D0B98D] pb-32">
      <SiteNavigation active="community" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#9A7950]/5 hidden" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#9A7950]/5 hidden" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <p className="studio-page-kicker mb-3">Topluluk</p>
          <h1 className="studio-page-title mb-3">
            Liderlik <span className="studio-page-title-accent">Tablosu</span>
          </h1>
          <p className="text-zinc-400 font-light">
            Thendisch Studio'nun en aktif dinleyicileri ve en iyi küratörleri.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Listeners */}
          <div className="bg-[#171614]/50  border border-white/[0.05] rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Headphones className="w-6 h-6 text-[#D0B98D]" />
              En Çok Dinleyenler
            </h2>
            <div className="flex flex-col gap-3">
              {topListeners.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? "bg-[#9A7950] text-white shadow-sm" : idx === 1 ? "bg-zinc-300 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                    {idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[#D0B98D]/50">{user.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/user/${user.id}`} className="font-bold text-white hover:text-[#D0B98D] transition-colors">{user.name}</Link>
                    <p className="text-xs text-zinc-400">{user.songsListened} Şarkı Dinledi</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Curators */}
          <div className="bg-[#171614]/50  border border-white/[0.05] rounded-xl p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-[#D0B98D]" />
              En İyi Küratörler
            </h2>
            <div className="flex flex-col gap-3">
              {topCurators.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? "bg-[#9A7950] text-white shadow-sm" : idx === 1 ? "bg-zinc-300 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                    {idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[#D0B98D]/50">{user.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/user/${user.id}`} className="font-bold text-white hover:text-[#D0B98D] transition-colors">{user.name}</Link>
                    <p className="text-xs text-[#D0B98D]">Toplam {user.totalVotes} Oy Aldı</p>
                  </div>
                </div>
              ))}
              {topCurators.length === 0 && (
                <p className="text-zinc-500 italic p-4 text-center">Henüz yeterli veri yok.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
