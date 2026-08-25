import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import ProfileClient from "./ProfileClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getPlaybackUrl } from "@/lib/storage";

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
    <main className="relative min-h-screen bg-[#0B0C10] text-white antialiased overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37] pb-32">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[150px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37]/5 blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <div className="mb-12">
          <Link href="/muzik" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium mb-8">
            <ArrowLeft className="w-4 h-4" />
            Radyoya Dön
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-white mb-2">
            VIP <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#8A6D1C]">Profiliniz</span>
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
