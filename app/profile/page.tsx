import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import { getPlaybackUrl } from "@/lib/storage";
import { SiteNavigation } from "@/components/SiteNavigation";
import AuthStatus from "@/components/AuthStatus";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      uploadCredits: true,
      role: true,
      isVerifiedArtist: true,
      artistApplication: true,
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
    redirect("/login");
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
      <SiteNavigation actions={<AuthStatus session={session} />} />

      <div className="studio-page-width relative z-10 py-12 sm:py-16">
        <div className="mb-12">
          <p className="studio-page-kicker mb-3">Hesap</p>
          <h1 className="studio-page-title mb-3">
            <span className="studio-page-title-accent">Profilin</span>
          </h1>
          <p className="text-[#adb5c0] font-normal">
            Hesap bilgilerini düzenle, paylaştığın parçaları ve dinleme bilgilerini gör.
          </p>
        </div>

        <ProfileClient user={userWithUrls as any} />
      </div>
    </main>
  );
}
