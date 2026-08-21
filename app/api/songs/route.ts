import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const SongSchema = z.object({
  title: z.string().min(1),
  artist: z.string().min(1),
  fileKey: z.string().min(1),
  durationSec: z.number().positive(),
  categories: z.array(z.string()).default([]),
  genres: z.array(z.string()).default([]),
  lyricsLrc: z.string().optional(),
});

// GET: kuyruktaki şarkıları sırayla listeler
export async function GET() {
  const queue = await prisma.song.findMany({
    where: { status: "QUEUED" },
    orderBy: { queuePos: "asc" },
    select: {
      id: true,
      title: true,
      artist: true,
      categories: true,
      genres: true,
      durationSec: true,
    },
  });
  return NextResponse.json({ queue });
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
  if (user.uploadCredits <= 0) {
    return NextResponse.json({ error: "Yükleme hakkın yok" }, { status: 403 });
  }

  const body = SongSchema.parse(await req.json());

  const lastInQueue = await prisma.song.findFirst({
    where: { status: "QUEUED" },
    orderBy: { queuePos: "desc" },
  });
  const nextPos = (lastInQueue?.queuePos ?? 0) + 1;

  const [song] = await prisma.$transaction([
    prisma.song.create({
      data: {
        title: body.title,
        artist: body.artist,
        fileUrl: body.fileKey,
        durationSec: body.durationSec,
        categories: body.categories,
        genres: body.genres,
        lyricsLrc: body.lyricsLrc,
        uploadedBy: user.id,
        status: "QUEUED",
        queuePos: nextPos,
      },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { uploadCredits: { decrement: 1 } },
    }),
  ]);

  return NextResponse.json({ song });
}
