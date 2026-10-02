import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import UserClient from "./UserClient";
import { getPlaybackUrl } from "@/lib/storage";
import { SiteNavigation } from "@/components/SiteNavigation";

export const dynamic = "force-dynamic";

export default async function PublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
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
    <main className="relative min-h-screen bg-[#100F0E] text-white antialiased overflow-x-hidden selection:bg-[#9A7950]/30 selection:text-[#D0B98D] pb-32">
      <SiteNavigation active="community" />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#9A7950]/5 hidden" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <UserClient user={userWithUrls} />
      </div>
    </main>
  );
}
