import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Güvenlik Kontrolü
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
  }

  const { userId, action } = await req.json();

  if (!userId || !action) {
    return NextResponse.json({ error: "Eksik bilgi" }, { status: 400 });
  }

  try {
    if (action === "VERIFY") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          isVerifiedArtist: true,
          role: "ARTIST",
        }
      });
    } else if (action === "REJECT") {
      await prisma.user.update({
        where: { id: userId },
        data: {
          artistApplication: false,
          isVerifiedArtist: false,
          role: "USER",
        }
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Doğrulama hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
