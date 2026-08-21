import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPlaybackUrl } from "@/lib/storage";
import { advanceQueueIfNeeded } from "@/lib/radio";

// Bu endpoint "gerçek radyo" mantığının kalbidir:
// - Şu an çalması gereken şarkıyı ve başladığı andan bu yana geçen saniyeyi döner
// - Her istekte, şarkının süresi dolmuş mu diye kontrol eder; dolduysa
//   otomatik olarak kuyruktaki bir sonraki şarkıya geçer
// - Tüm kullanıcılar bu endpoint'e bağlanıp player'larını dönen "elapsedSec"
//   değerine göre ayarladığı için herkes aynı şarkıyı aynı anda dinler
export async function GET() {
  const current = await advanceQueueIfNeeded();

  if (!current) {
    return NextResponse.json({ playing: false });
  }

  const elapsedSec = Math.floor(
    (Date.now() - current.startedAt!.getTime()) / 1000
  );

  const playbackUrl = await getPlaybackUrl(current.song!.fileUrl);

  return NextResponse.json({
    playing: true,
    songId: current.song!.id,
    title: current.song!.title,
    artist: current.song!.artist,
    lyricsLrc: current.song!.lyricsLrc,
    durationSec: current.song!.durationSec,
    elapsedSec,
    playbackUrl,
  });
}
