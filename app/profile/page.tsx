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
    <main className="relative min-h-screen bg-[#100F0E] text-white antialiased overflow-x-hidden selection:bg-[#9A7950]/30 selection:text-[#D0B98D] pb-32">
      <SiteNavigation actions={<AuthStatus session={session} />} />
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#9A7950]/5 hidden" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#9A7950]/5 hidden" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <p className="studio-page-kicker mb-3">Hesap</p>
          <h1 className="studio-page-title mb-3">
            VIP <span className="studio-page-title-accent">Profiliniz</span>
          </h1>
          <p className="text-zinc-400 font-light">
            Hesap bilgilerinizi görüntüleyin ve Thendisch ayrıcalıklarını yönetin.
          </p>
        </div>
        
        <ProfileClient user={userWithUrls as any} />
      </div>
    </main>
  );
}
