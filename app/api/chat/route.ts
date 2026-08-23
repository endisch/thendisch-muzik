import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            role: true,
            isVerifiedArtist: true,
          }
        }
      }
    });

    return NextResponse.json(messages.reverse());
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmalısınız" }, { status: 401 });
  }

  const { text } = await req.json();

  if (!text || text.trim().length === 0) {
    return NextResponse.json({ error: "Boş mesaj gönderilemez" }, { status: 400 });
  }
  
  if (text.length > 200) {
    return NextResponse.json({ error: "Mesaj çok uzun (max 200 karakter)" }, { status: 400 });
  }

  try {
    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        userId: (session.user as any).id,
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
            role: true,
            isVerifiedArtist: true,
          }
        }
      }
    });

    return NextResponse.json(message);
  } catch (error) {
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  
  // Sadece adminler mesaj silebilir
  if (!session?.user || (session.user as any).role !== "ADMIN") {
    return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Mesaj ID eksik" }, { status: 400 });
  }

  try {
    await prisma.message.delete({
      where: { id }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mesaj silme hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
