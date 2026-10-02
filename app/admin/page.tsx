import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SiteNavigation } from "@/components/SiteNavigation";
import AuthStatus from "@/components/AuthStatus";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || (session.user as any).role !== "ADMIN") {
    redirect("/muzik");
  }

  // Sanatçı başvurusu yapmış ama henüz onaylanmamış olanları getir
  const pendingArtists = await prisma.user.findMany({
    where: {
      artistApplication: true,
      isVerifiedArtist: false,
    },
    select: {
      id: true,
      name: true,
      email: true,
      instagramUrl: true,
      spotifyUrl: true,
      youtubeUrl: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" }
  });

  // Sistem İstatistikleri
  const totalUsers = await prisma.user.count();
  const totalSongs = await prisma.song.count();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const messagesToday = await prisma.message.count({
    where: { createdAt: { gte: today } }
  });
  const totalListens = await prisma.playHistory.count();

  const stats = { totalUsers, totalSongs, messagesToday, totalListens };

  return (
    <main className="relative min-h-screen bg-[#090b0e] text-[#f7f8fa] antialiased overflow-x-hidden selection:bg-[#ff543b]/30 selection:text-[#ff6c55] pb-32">
      <SiteNavigation actions={<AuthStatus session={session} />} />

      <div className="studio-page-width relative z-10 py-12 sm:py-16">
        <div className="mb-12">
          <Link href="/muzik" className="inline-flex items-center gap-2 text-[#adb5c0] hover:text-[#f7f8fa] transition-colors text-base font-medium mb-8">
            <ArrowLeft className="w-4 h-4" />
            Müzik Odası’na dön
          </Link>
          <p className="studio-page-kicker mb-3">Yönetim</p>
          <h1 className="studio-page-title mb-3">
            Yönetim <span className="studio-page-title-accent">paneli.</span>
          </h1>
          <p className="text-[#adb5c0] font-normal max-w-xl">
            Sanatçı başvurularını, kullanıcıları ve yükleme haklarını tek yerden yönet.
          </p>
        </div>

        <AdminClient initialArtists={pendingArtists} stats={stats} />
      </div>
    </main>
  );
}
