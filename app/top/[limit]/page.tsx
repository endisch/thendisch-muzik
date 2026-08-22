import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TopPage({ params }: { params: { limit: string } }) {
  const limitNum = parseInt(params.limit) || 10;
  
  if (![10, 20, 50].includes(limitNum)) {
    return <div className="text-white p-8 text-center text-2xl">Geçersiz liste limiti.</div>;
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

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-8 min-h-screen">
      <Link href="/muzik" className="text-blue-400 hover:text-blue-300 mb-8 inline-block font-semibold">&larr; Radyoya Dön</Link>
      
      <div className="relative h-64 rounded-3xl overflow-hidden mb-12 shadow-2xl flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-purple-900 opacity-80 z-10"></div>
        <img 
          src={`/images/top-${limitNum}.jpg`} 
          alt={`Top ${limitNum}`} 
          className="absolute inset-0 w-full h-full object-cover z-0 opacity-60 mix-blend-overlay"
        />
        <h1 className="relative z-20 text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-300 drop-shadow-2xl">
          TOP {limitNum}
        </h1>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-md rounded-3xl p-6 md:p-10 border border-gray-700 shadow-xl">
        {topSongs.length === 0 ? (
          <p className="text-center text-gray-400 py-8">Henüz oylanmış şarkı bulunmuyor.</p>
        ) : (
          <ul className="flex flex-col gap-4">
            {topSongs.map((song, idx) => (
              <li key={song.id} className="flex items-center gap-6 p-4 rounded-xl hover:bg-gray-700/50 transition-colors border border-transparent hover:border-gray-600 group">
                <div className="text-3xl font-black text-gray-700 group-hover:text-blue-500 w-12 text-center transition-colors">
                  {idx + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white mb-1">{song.title}</h3>
                  <p className="text-gray-400">{song.artist}</p>
                </div>
                
                {/* Kapak Görseli */}
                <div className="w-16 h-16 md:w-20 md:h-20 rounded-lg bg-gray-800 border border-gray-700 overflow-hidden flex-shrink-0 flex items-center justify-center shadow-lg">
                  {song.coverUrl ? (
                    <img src={song.coverUrl} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <svg className="w-8 h-8 text-gray-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 14.5c-2.49 0-4.5-2.01-4.5-4.5S9.51 7.5 12 7.5s4.5 2.01 4.5 4.5-2.01 4.5-4.5 4.5zm0-5.5c-.55 0-1 .45-1 1s.45 1 1 1 1-.45 1-1-.45-1-1-1z"/></svg>
                  )}
                </div>

                <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg px-4 py-2 border border-gray-800 ml-2">
                  <span className="text-2xl font-bold text-blue-400">{song.monthlyVotes}</span>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Bu Ay</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
