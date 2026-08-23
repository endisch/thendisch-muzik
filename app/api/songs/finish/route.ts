import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Hangi şarkının bittiğini NowPlaying'den anlıyoruz
    const np = await prisma.nowPlaying.findUnique({ where: { id: 1 } });
    if (!np?.songId) {
      return NextResponse.json({ error: "No song is currently playing" }, { status: 400 });
    }

    // Aynı şarkı için daha önce dinleme kaydı var mı diye bak (spamı önlemek için)
    // Bu, aynı kullanıcının sayfayı yenileyip aynı şarkıyı 5 kez "dinledim" diye raporlamasını engeller.
    // Ancak AutoDJ sayesinde aynı şarkı daha sonra tekrar çalarsa, tekrar dinlemiş sayılmalıdır.
    // Çok karmaşık yapmamak adına, son 5 dakika içinde bu şarkıyı dinlemiş mi diye bakalım:
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentPlay = await prisma.playHistory.findFirst({
      where: {
        userId: user.id,
        songId: np.songId,
        completed: true,
        listenedAt: { gte: fiveMinutesAgo }
      }
    });

    if (recentPlay) {
      return NextResponse.json({ success: true, message: "Already recorded recently" });
    }

    // 10 şarkıda 1 yükleme hakkı kazanma mantığı
    // Yeni songsListened sayısını hesapla
    const newSongsListened = user.songsListened + 1;
    let creditsToAdd = 0;
    
    // Her 10 dinlemede 1 kredi ver
    if (newSongsListened % 10 === 0) {
      creditsToAdd = 1;
    }

    await prisma.$transaction([
      prisma.playHistory.create({
        data: {
          userId: user.id,
          songId: np.songId,
          completed: true,
        }
      }),
      prisma.user.update({
        where: { id: user.id },
        data: {
          songsListened: { increment: 1 },
          uploadCredits: { increment: creditsToAdd }
        }
      })
    ]);

    return NextResponse.json({ 
      success: true, 
      earnedCredit: creditsToAdd > 0,
      totalListened: newSongsListened 
    });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
