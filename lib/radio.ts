import { prisma } from "./prisma";

// NowPlaying tablosunda her zaman tek satır (id=1) bulunur.
// Bu fonksiyon: mevcut şarkının süresi dolmuş mu diye bakar,
// dolduysa PLAYED olarak işaretler ve kuyruktaki bir sonrakini başlatır.
// Kuyruk boşsa, "Auto-DJ" devreye girer ve arşivden rastgele bir şarkı çalar!
export async function advanceQueueIfNeeded() {
  let np = await prisma.nowPlaying.findUnique({
    where: { id: 1 }
  });

  if (!np) {
    np = await prisma.nowPlaying.create({ data: { id: 1 } });
  }

  const currentSong = np.songId
    ? await prisma.song.findUnique({ where: { id: np.songId } })
    : null;

  const expired =
    currentSong &&
    np.startedAt &&
    Date.now() - np.startedAt.getTime() > currentSong.durationSec * 1000;

  if (!currentSong || expired) {
    if (currentSong) {
      await prisma.song.update({
        where: { id: currentSong.id },
        data: { status: "PLAYED" },
      });
    }

    // 1. Önce kullanıcıların yüklediği veya oy vererek sıraya soktuğu (QUEUED) şarkılara bak
    let next = await prisma.song.findFirst({
      where: { status: "QUEUED" },
      orderBy: [{ votesCount: "desc" }, { createdAt: "asc" }],
    });

    // 2. Eğer kuyrukta şarkı yoksa, tüm çalınmış şarkıları (PLAYED) başa sarıp tekrar sıraya (QUEUED) al!
    if (!next) {
      await prisma.song.updateMany({
        where: { status: "PLAYED" },
        data: { status: "QUEUED", votesCount: 0 }
      });

      // Şarkıları tekrar QUEUED yaptıktan sonra yeniden sorgula
      next = await prisma.song.findFirst({
        where: { status: "QUEUED" },
        orderBy: [{ votesCount: "desc" }, { createdAt: "asc" }],
      });
    }

    // Hala next yoksa (sistemde hiç şarkı yoksa) radyoyu durdur
    if (!next) {
      await prisma.nowPlaying.update({
        where: { id: 1 },
        data: { songId: null, startedAt: null },
      });
      return null;
    }

    // Sıradaki şarkıyı çal
    await prisma.song.update({
      where: { id: next.id },
      data: { status: "PLAYING" },
    });

    await prisma.notification.create({
      data: {
        userId: next.uploadedBy,
        type: "SONG_PLAYING",
        message: `📻 Yüklediğin "${next.title}" şu an radyoda çalıyor!`,
      }
    });

    const updated = await prisma.nowPlaying.update({
      where: { id: 1 },
      data: { songId: next.id, startedAt: new Date() },
    });

    return { ...updated, song: next };
  }

  return { ...np, song: currentSong };
}
