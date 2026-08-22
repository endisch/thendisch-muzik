import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function TopPage({ params }: { params: { limit: string } }) {
  const limitNum = parseInt(params.limit) || 10;
  
  if (![10, 20, 50].includes(limitNum)) {
    return <div className="text-white p-8 text-center text-2xl">Geçersiz liste limiti.</div>;
  }

  const topSongs = await prisma.song.findMany({
    where: { votesCount: { gt: 0 } },
    orderBy: { votesCount: "desc" },
    take: limitNum
  });

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
                <div className="flex flex-col items-center justify-center bg-gray-900/50 rounded-lg px-4 py-2 border border-gray-800">
                  <span className="text-2xl font-bold text-blue-400">{song.votesCount}</span>
                  <span className="text-xs text-gray-500 uppercase font-semibold">Oy</span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
