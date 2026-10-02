import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TopListClient from "./TopListClient";
import { SiteNavigation } from "@/components/SiteNavigation";
import { getPlaybackUrl } from "@/lib/storage";

type ChartSong = {
  id: string;
  title: string;
  artist: string;
  monthlyVotes: number;
  coverUrl: string | null;
  playbackUrl: string;
};

export const dynamic = "force-dynamic";

export default async function TopPage({ params }: { params: Promise<{ limit: string }> }) {
  const { limit } = await params;
  const limitNum = parseInt(limit) || 10;

  if (![10, 20, 50].includes(limitNum)) {
    return (
      <div className="min-h-screen bg-[#090b0e] flex items-center justify-center">
        <div className="text-[#adb5c0] font-mono text-base tracking-wide border border-white/10 px-8 py-4 rounded-none">
          Bu liste bulunamadı.
        </div>
      </div>
    );
  }

  let topSongs: ChartSong[] = [];

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
    <main className="relative min-h-screen bg-[#090b0e] text-[#f7f8fa] antialiased overflow-x-hidden selection:bg-[#ff543b]/30 selection:text-[#ff6c55] pb-24">
      <SiteNavigation active="charts" />
      <div className="studio-page-width relative z-10 py-12 sm:py-16">
        <header className="chart-page-heading">
          <div>
            <p className="studio-page-kicker">{limitNum === 50 ? "Thendisch arşivi" : "Topluluğun seçimi · aylık liste"}</p>
            <h1 className="studio-page-title mt-4">
              {limitNum === 50 ? "Arşiv" : <>Top <span className="studio-page-title-accent">{limitNum}</span></>}
            </h1>
            <p className="chart-page-description">{subTitle} — topluluğun dinleyip oy verdiği parçalar.</p>
          </div>
          <nav className="chart-range-nav" aria-label="Liste türü">
            <Link href="/top/10" aria-current={limitNum === 10 ? "page" : undefined}>Top 10</Link>
            <Link href="/top/20" aria-current={limitNum === 20 ? "page" : undefined}>Keşifler</Link>
            <Link href="/top/50" aria-current={limitNum === 50 ? "page" : undefined}>Arşiv</Link>
          </nav>
        </header>
        <section className="chart-list-shell" aria-label={`${subTitle} parça listesi`}>
          <TopListClient initialSongs={topSongs} />
        </section>
      </div>
    </main>
  );
}
