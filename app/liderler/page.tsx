import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Trophy, Headphones, Star } from "lucide-react";

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
    <main className="relative min-h-screen bg-[#0B0C10] text-white antialiased overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] pb-32">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <div className="mb-12">
          <Link href="/muzik" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium mb-8">
            <ArrowLeft className="w-4 h-4" />
            Radyoya Dön
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2 flex items-center gap-4">
            <Trophy className="w-10 h-10 text-[#D4AF37]" />
            Liderlik <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#8A6D1C]">Tablosu</span>
          </h1>
          <p className="text-zinc-400 font-light">
            Thendisch Studio'nun en aktif dinleyicileri ve en iyi küratörleri.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Top Listeners */}
          <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Headphones className="w-6 h-6 text-[#D4AF37]" />
              En Çok Dinleyenler
            </h2>
            <div className="flex flex-col gap-3">
              {topListeners.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.5)]" : idx === 1 ? "bg-zinc-300 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                    {idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[#D4AF37]/50">{user.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/user/${user.id}`} className="font-bold text-white hover:text-[#D4AF37] transition-colors">{user.name}</Link>
                    <p className="text-xs text-zinc-400">{user.songsListened} Şarkı Dinledi</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Curators */}
          <div className="bg-[#121318]/50 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-8 shadow-2xl">
            <h2 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
              <Star className="w-6 h-6 text-[#D4AF37]" />
              En İyi Küratörler
            </h2>
            <div className="flex flex-col gap-3">
              {topCurators.map((user, idx) => (
                <div key={user.id} className="flex items-center gap-4 p-4 rounded-2xl bg-black/40 border border-white/5 hover:border-white/10 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-sm ${idx === 0 ? "bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.5)]" : idx === 1 ? "bg-zinc-300 text-black" : idx === 2 ? "bg-amber-700 text-white" : "bg-zinc-800 text-zinc-400"}`}>
                    {idx + 1}
                  </div>
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-zinc-900 border border-white/10">
                    {user.image ? (
                      <img src={user.image} alt={user.name || ""} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center font-bold text-[#D4AF37]/50">{user.name?.charAt(0)}</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <Link href={`/user/${user.id}`} className="font-bold text-white hover:text-[#D4AF37] transition-colors">{user.name}</Link>
                    <p className="text-xs text-[#D4AF37]">Toplam {user.totalVotes} Oy Aldı</p>
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
