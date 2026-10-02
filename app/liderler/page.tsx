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
    <main className="relative min-h-screen bg-[#090b0e] text-[#f7f8fa] antialiased overflow-x-hidden selection:bg-[#ff543b]/30 selection:text-[#ff6c55] pb-32">
      <SiteNavigation active="community" />

      <div className="studio-page-width relative z-10 py-12 sm:py-16">
        <div className="mb-12">
          <p className="studio-page-kicker mb-3">Topluluk</p>
          <h1 className="studio-page-title mb-3">
            Topluluğun <span className="studio-page-title-accent">sesleri.</span>
          </h1>
          <p className="text-[#adb5c0] font-normal">
            Topluluğa ses veren dinleyiciler ve en çok oy alan parçaları paylaşanlar.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Listeners */}
          <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-8 shadow-none">
            <h2 className="text-2xl font-semibold text-[#f7f8fa] mb-6 flex items-center gap-3">
              <Headphones className="w-6 h-6 text-[#ff6c55]" />
              En çok dinleyenler
            </h2>
            <div className="flex flex-col gap-3">
              {topListeners.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-none bg-[#090b0e] border border-white/[0.12] hover:border-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-none flex items-center justify-center font-semibold text-base ${idx === 0 ? "bg-[#ff543b] text-[#090b0e] shadow-none" : idx === 1 ? "bg-zinc-300 text-black" : idx === 2 ? "bg-[#ff543b]/15 text-[#ff6c55]" : "bg-[#12161b] text-[#adb5c0]"}`}>
                    {idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-none overflow-hidden bg-[#090b0e] border border-white/10">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[#ff6c55]">{user.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/user/${user.id}`} className="font-bold text-[#f7f8fa] hover:text-[#ff6c55] transition-colors">{user.name}</Link>
                    <p className="text-sm text-[#adb5c0]">{user.songsListened} şarkı dinledi</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Curators */}
          <div className="bg-[#12161b]  border border-white/[0.12] rounded-none p-8 shadow-none">
            <h2 className="text-2xl font-semibold text-[#f7f8fa] mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-[#ff6c55]" />
              En çok oy alanlar
            </h2>
            <div className="flex flex-col gap-3">
              {topCurators.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-none bg-[#090b0e] border border-white/[0.12] hover:border-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-none flex items-center justify-center font-semibold text-base ${idx === 0 ? "bg-[#ff543b] text-[#090b0e] shadow-none" : idx === 1 ? "bg-zinc-300 text-black" : idx === 2 ? "bg-[#ff543b]/15 text-[#ff6c55]" : "bg-[#12161b] text-[#adb5c0]"}`}>
                    {idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-none overflow-hidden bg-[#090b0e] border border-white/10">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[#ff6c55]">{user.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/user/${user.id}`} className="font-bold text-[#f7f8fa] hover:text-[#ff6c55] transition-colors">{user.name}</Link>
                    <p className="text-sm text-[#ff6c55]">Toplam {user.totalVotes} oy aldı</p>
                  </div>
                </div>
              ))}
              {topCurators.length === 0 && (
                <p className="text-[#adb5c0] italic p-4 text-center">Henüz yeterli veri yok.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
