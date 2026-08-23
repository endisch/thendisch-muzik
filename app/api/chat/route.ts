import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

// Global cache for tracking active IPs (lives in memory on the Railway Node.js process)
const globalAny: any = global;
if (!globalAny.activeUsers) {
  globalAny.activeUsers = new Map<string, number>();
}
const activeUsers: Map<string, number> = globalAny.activeUsers;

export async function GET(req: Request) {
  try {
    // 1. Online kullanıcı sayısını IP bazlı (veya session bazlı) takip et
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("cf-connecting-ip") || "anonymous";
    if (ip) {
      activeUsers.set(ip, Date.now());
    }

    const now = Date.now();
    let onlineCount = 0;
    for (const [key, lastSeen] of activeUsers.entries()) {
      // 15 saniyeden uzun süredir ping atmayanları online listesinden çıkar (Polling 2-3 saniyede bir yapılıyor)
      if (now - lastSeen > 15000) {
        activeUsers.delete(key);
      } else {
        onlineCount++;
      }
    }

    // 2. Mesajları çek
    const messages = await prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true,
            isVerifiedArtist: true,
          }
        }
      }
    });

    return NextResponse.json({
      messages: messages.reverse(),
      onlineCount: Math.max(1, onlineCount) // Kendisi varsa en az 1
    });
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
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { chatTimeoutUntil: true }
    });

    if (user?.chatTimeoutUntil && user.chatTimeoutUntil > new Date()) {
      return NextResponse.json({ 
        error: "Sohbetten uzaklaştırıldınız. Ceza bitiş: " + user.chatTimeoutUntil.toLocaleString("tr-TR") 
      }, { status: 403 });
    }

    const message = await prisma.message.create({
      data: {
        text: text.trim(),
        userId: (session.user as any).id,
      },
      include: {
        user: {
          select: {
            id: true,
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
