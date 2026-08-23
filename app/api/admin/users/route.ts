import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const email = searchParams.get("email");

    if (!email) {
      return NextResponse.json({ users: [] }, { status: 200 });
    }

    const users = await prisma.user.findMany({
      where: {
        email: {
          contains: email,
          mode: 'insensitive' // Büyük/küçük harf duyarsız
        }
      },
      select: {
        id: true,
        email: true,
        name: true,
        image: true,
        role: true,
        isVerifiedArtist: true,
        uploadCredits: true,
        createdAt: true
      },
      take: 10 // Max 10 sonuç
    });

    return NextResponse.json({ users }, { status: 200 });

  } catch (error) {
    console.error("Admin user search error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
