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
    <main className="relative min-h-screen bg-[#090b0e] text-[#f7f8fa] antialiased overflow-x-hidden selection:bg-[#ff543b]/30 selection:text-[#ff6c55] pb-32">
      <SiteNavigation active="community" />

      <div className="studio-page-width relative z-10 py-12 sm:py-16">
        <UserClient user={userWithUrls} />
      </div>
    </main>
  );
}
