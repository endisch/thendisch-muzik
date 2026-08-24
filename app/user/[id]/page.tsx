import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserClient from "./UserClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPlaybackUrl } from "@/lib/storage";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: { id: string } }) {
  const user = await prisma.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      image: true,
      bio: true,
      role: true,
      isVerifiedArtist: true,
      instagramUrl: true,
      spotifyUrl: true,
      youtubeUrl: true,
      createdAt: true,
      songsListened: true,
      songs: {
        orderBy: { createdAt: "desc" },
        take: 20
      }
    }
  });

  if (!user) {
    redirect("/muzik");
  }

  // Cover ve File URL'lerini public/presigned URL'ye çevir
  const userWithUrls = {
    ...user,
    songs: await Promise.all(
      user.songs.map(async (song) => ({
        ...song,
        coverUrl: song.coverUrl ? await getPlaybackUrl(song.coverUrl) : null,
        fileUrl: await getPlaybackUrl(song.fileUrl),
      }))
    ),
  };

  return (
    <main className="relative min-h-screen bg-[#0B0C10] text-white antialiased overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] pb-32">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[150px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <Link href="/muzik" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium mb-8">
            <ArrowLeft className="w-4 h-4" />
            Radyoya Dön
          </Link>
        </div>
        
        <UserClient user={userWithUrls} />
      </div>
    </main>
  );
}
