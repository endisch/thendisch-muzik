import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Trophy, Music } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TopPage({ params }: { params: { limit: string } }) {
  const limitNum = parseInt(params.limit) || 10;
  
  if (![10, 20, 50].includes(limitNum)) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center">
        <div className="text-zinc-500 font-mono text-sm uppercase tracking-widest border border-white/10 px-8 py-4 rounded-full">
          Geçersiz liste limiti.
        </div>
      </div>
    );
  }

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const topVotes = await prisma.vote.groupBy({
    by: ['songId'],
    _count: { songId: true },
    where: {
      createdAt: { gte: startOfMonth }
    },
    orderBy: {
      _count: { songId: 'desc' }
    },
    take: limitNum
  });

  const songIds = topVotes.map(v => v.songId);
  const songsData = await prisma.song.findMany({
    where: { id: { in: songIds } }
  });

  const { getPlaybackUrl } = await import("@/lib/storage");

  const topSongs = await Promise.all(topVotes.map(async (vote) => {
    const song = songsData.find(s => s.id === vote.songId)!;
    return {
      ...song,
      monthlyVotes: vote._count.songId,
      coverUrl: song.coverUrl ? await getPlaybackUrl(song.coverUrl) : null
    };
  }));

  const titles = {
    10: "Zirvenin Sesi",
    20: "Yeni Keşifler",
    50: "Tüm Koleksiyon"
  };
  const subTitle = titles[limitNum as keyof typeof titles] || "Koleksiyon";

  return (
    <main className="relative min-h-screen bg-[#0B0C10] text-white antialiased overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] pb-32">
      {/* Avant-Garde Background Glows */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12 flex items-center justify-between">
          <Link href="/muzik" className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium">
            <ArrowLeft className="w-4 h-4" />
            Radyoya Dön
          </Link>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/5 bg-white/[0.02]">
            <Trophy className="w-4 h-4 text-[#D4AF37]" />
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">Aylık Liste</span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative h-72 md:h-80 rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl flex flex-col items-center justify-center border border-white/[0.05]">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-[#121318] opacity-80 z-10"></div>
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.15),transparent_70%)] z-10 pointer-events-none" />

          {/* S3 Image Fallback or Static */}
          <img 
            src={`/images/top-${limitNum}.jpg`} 
            alt={`Top ${limitNum}`} 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-20 mix-blend-overlay grayscale"
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          
          <div className="relative z-20 text-center flex flex-col items-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#D4AF37] mb-4">
              {subTitle}
            </span>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
              TOP <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#8A6D1C]">{limitNum}</span>
            </h1>
          </div>
        </div>

        {/* Song List */}
        <div className="bg-[#121318]/50 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-12 border border-white/[0.05] shadow-2xl">
          {topSongs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Music className="w-12 h-12 text-zinc-800 mb-6" />
              <h3 className="text-xl font-bold text-white mb-2">Henüz Kimse Yok</h3>
              <p className="text-zinc-500 max-w-sm">Bu ay henüz hiçbir parça oylanmamış. Radyoda dinleyip oy vererek sıralamayı sen belirle.</p>
              <Link href="/muzik" className="mt-8 bg-[#D4AF37] text-black px-8 py-3 rounded-full font-bold uppercase tracking-widest text-xs hover:bg-[#F3E5AB] transition-colors">
                Radyoya Katıl
              </Link>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {topSongs.map((song, idx) => (
                <li key={song.id} className="group flex flex-col sm:flex-row sm:items-center gap-6 p-6 rounded-3xl bg-black/40 hover:bg-black/80 transition-all duration-500 border border-white/[0.03] hover:border-[#D4AF37]/30 relative overflow-hidden">
                  
                  {/* Background Highlight */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37]/0 via-[#D4AF37]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                  {/* Rank */}
                  <div className="text-4xl md:text-5xl font-black text-zinc-800 group-hover:text-[#D4AF37] w-12 text-center transition-colors duration-500 shrink-0">
                    {idx + 1}
                  </div>
                  
                  {/* Cover */}
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-zinc-900 border border-white/5 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg relative z-10 group-hover:shadow-[0_0_20px_rgba(212,175,55,0.2)] transition-shadow duration-500">
                    {song.coverUrl ? (
                      <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                    ) : (
                      <Music className="w-8 h-8 text-zinc-700" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 relative z-10 min-w-0">
                    <h3 className="text-xl font-bold text-white mb-1 truncate group-hover:text-[#D4AF37] transition-colors">{song.title}</h3>
                    <p className="text-zinc-500 truncate">{song.artist}</p>
                  </div>
                  
                  {/* Votes */}
                  <div className="flex flex-col items-center justify-center bg-black/50 rounded-2xl px-6 py-4 border border-white/5 shrink-0 relative z-10">
                    <span className="text-3xl font-black text-white group-hover:text-[#D4AF37] transition-colors leading-none">{song.monthlyVotes}</span>
                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold mt-2">Bu Ay</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
