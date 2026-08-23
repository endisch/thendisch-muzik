import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import AdminClient from "./AdminClient";

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

  return (
    <main className="min-h-screen bg-black text-white p-6 sm:p-12">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-4xl font-black mb-2 tracking-tight text-white">Yönetici <span className="text-emerald-500">Paneli</span></h1>
        <p className="text-zinc-400 font-medium mb-12">Sanatçı başvurularını ve platformu yönetin.</p>
        
        <AdminClient initialArtists={pendingArtists} />
      </div>
    </main>
  );
}
