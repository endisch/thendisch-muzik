import { prisma } from "./prisma";

// NowPlaying tablosunda her zaman tek satır (id=1) bulunur.
// Bu fonksiyon: mevcut şarkının süresi dolmuş mu diye bakar,
// dolduysa PLAYED olarak işaretler ve kuyruktaki bir sonrakini başlatır.
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
        data: { status: "PLAYED", queuePos: null },
      });
    }

    const next = await prisma.song.findFirst({
      where: { status: "QUEUED" },
      orderBy: { queuePos: "asc" },
    });

    if (!next) {
      await prisma.nowPlaying.update({
        where: { id: 1 },
        data: { songId: null, startedAt: null },
      });
      return null;
    }

    await prisma.song.update({
      where: { id: next.id },
      data: { status: "PLAYING" },
    });

    const updated = await prisma.nowPlaying.update({
      where: { id: 1 },
      data: { songId: next.id, startedAt: new Date() },
    });

    return { ...updated, song: next };
  }

  return { ...np, song: currentSong };
}
