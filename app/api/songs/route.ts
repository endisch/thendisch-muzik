import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const SongSchema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  fileKey: z.string().min(1),
  coverKey: z.string().optional(),
  durationSec: z.number().positive(),
  categories: z.array(z.string()).default([]),
  genres: z.array(z.string()).default([]),
  lyricsLrc: z.string().optional(),
  youtubeUrl: z.string().optional(),
});

// GET: kuyruktaki şarkıları sırayla listeler
export async function GET() {
  const queue = await prisma.song.findMany({
    where: { status: "QUEUED" },
    orderBy: [{ votesCount: "desc" }, { createdAt: "asc" }],
    select: {
      id: true,
      title: true,
      artist: true,
      coverUrl: true,
      categories: true,
      genres: true,
      durationSec: true,
      votesCount: true,
    },
  });
  
  const { getPlaybackUrl } = await import("@/lib/storage");
  const queueWithUrls = await Promise.all(
    queue.map(async (q) => ({
      ...q,
      coverUrl: q.coverUrl ? await getPlaybackUrl(q.coverUrl) : null,
    }))
  );

  return NextResponse.json({ queue: queueWithUrls });
}

// POST: R2'ye yükleme tamamlandıktan sonra şarkıyı DB'ye + kuyruğa kaydeder
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmalısın" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const body = SongSchema.parse(await req.json());

  // Check upload rights for Verified Artists vs Normal Users
  if (user.role === "ARTIST" && user.isVerifiedArtist) {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    
    const uploadsToday = await prisma.song.count({
      where: {
        uploadedBy: user.id,
        createdAt: { gte: startOfDay }
      }
    });
    
    if (uploadsToday >= 1) {
      return NextResponse.json({ error: "Doğrulanmış sanatçılar günde en fazla 1 şarkı yükleyebilir." }, { status: 403 });
    }
  } else if (user.uploadCredits <= 0) {
    return NextResponse.json({ error: "Yükleme hakkın yok" }, { status: 403 });
  }

  const [song] = await prisma.$transaction([
    prisma.song.create({
      data: {
        title: body.title,
        artist: body.artist,
        fileUrl: body.fileKey,
        coverUrl: body.coverKey,
        durationSec: body.durationSec,
        categories: body.categories,
        genres: body.genres,
        lyricsLrc: body.lyricsLrc,
        youtubeUrl: body.youtubeUrl,
        uploadedBy: user.id,
        status: "QUEUED",
      },
    }),
    user.role === "ARTIST" && user.isVerifiedArtist
      ? prisma.user.update({
          where: { id: user.id },
          data: { lastUploadDate: new Date() },
        })
      : prisma.user.update({
          where: { id: user.id },
          data: { uploadCredits: { decrement: 1 } },
        }),
  ]);

  return NextResponse.json({ song });
}
