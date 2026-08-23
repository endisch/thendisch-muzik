import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { ArrowLeft, Trophy, Music } from "lucide-react";
import TopListClient from "./TopListClient";

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

  const { getPlaybackUrl } = await import("@/lib/storage");
  let topSongs = [];

  if (limitNum === 50) {
    // 50 = ARŞİV: Bugüne kadar en çok oy alan (Tüm Zamanlar)
    const topVotes = await prisma.vote.groupBy({
      by: ['songId'],
      _count: { songId: true },
      orderBy: { _count: { songId: 'desc' } },
      take: 50
    });

    const songIds = topVotes.map(v => v.songId);
    if (songIds.length > 0) {
      const songsData = await prisma.song.findMany({
        where: { id: { in: songIds } }
      });

      topSongs = await Promise.all(topVotes.map(async (vote) => {
        const song = songsData.find(s => s.id === vote.songId)!;
        return {
          id: song.id,
          title: song.title,
          artist: song.artist,
          monthlyVotes: vote._count.songId,
          coverUrl: song.coverUrl ? await getPlaybackUrl(song.coverUrl) : null,
          playbackUrl: await getPlaybackUrl(song.fileUrl),
        };
      }));
    } else {
      // Eğer hiç oy yoksa, en son eklenen 50 şarkıyı göster
      const songsData = await prisma.song.findMany({
        orderBy: { createdAt: 'desc' },
        take: 50
      });
      topSongs = await Promise.all(songsData.map(async (song) => ({
        id: song.id,
        title: song.title,
        artist: song.artist,
        monthlyVotes: 0,
        coverUrl: song.coverUrl ? await getPlaybackUrl(song.coverUrl) : null,
        playbackUrl: await getPlaybackUrl(song.fileUrl),
      })));
    }
  } else {
    // 10 ve 20: BU AYIN en iyileri
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
    if (songIds.length > 0) {
      const songsData = await prisma.song.findMany({
        where: { id: { in: songIds } }
      });

      topSongs = await Promise.all(topVotes.map(async (vote) => {
        const song = songsData.find(s => s.id === vote.songId)!;
        return {
          id: song.id,
          title: song.title,
          artist: song.artist,
          monthlyVotes: vote._count.songId,
          coverUrl: song.coverUrl ? await getPlaybackUrl(song.coverUrl) : null,
          playbackUrl: await getPlaybackUrl(song.fileUrl),
        };
      }));
    }
  }

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
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-400">
              {limitNum === 50 ? "Tüm Zamanlar" : "Aylık Liste"}
            </span>
          </div>
        </div>

        {/* Hero Banner */}
        <div className="relative h-72 md:h-80 rounded-[2.5rem] overflow-hidden mb-16 shadow-2xl flex flex-col items-center justify-center border border-white/[0.05]">
          <div className="absolute inset-0 bg-gradient-to-br from-black via-zinc-900 to-[#121318] opacity-80 z-10"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(212,175,55,0.15),transparent_70%)] z-10 pointer-events-none" />
          <img 
            src={`/images/top-${limitNum}.jpg`} 
            alt={`Top ${limitNum}`} 
            className="absolute inset-0 w-full h-full object-cover z-0 opacity-20 mix-blend-overlay grayscale"
          />
          <div className="relative z-20 text-center flex flex-col items-center">
            <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-[#D4AF37] mb-4">
              {subTitle}
            </span>
            <h1 className="text-7xl md:text-8xl font-black tracking-tighter text-white drop-shadow-2xl">
              {limitNum === 50 ? "ARŞİV" : (
                <>TOP <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#8A6D1C]">{limitNum}</span></>
              )}
            </h1>
          </div>
        </div>

        {/* Song List */}
        <div className="bg-[#121318]/50 backdrop-blur-xl rounded-[2.5rem] p-6 md:p-12 border border-white/[0.05] shadow-2xl">
          <TopListClient initialSongs={topSongs} />
        </div>
      </div>
    </main>
  );
}
