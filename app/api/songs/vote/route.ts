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

    const { songId } = await request.json();
    if (!songId)
      return NextResponse.json({ error: "Missing songId" }, { status: 400 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const existingVote = await prisma.vote.findUnique({
      where: { userId_songId: { userId: user.id, songId } },
    });
    if (existingVote)
      return NextResponse.json({ error: "Already voted" }, { status: 400 });

    const song = await prisma.song.findUnique({ where: { id: songId } });
    if (!song)
      return NextResponse.json({ error: "Song not found" }, { status: 404 });

    if (song.uploadedBy === user.id) {
      return NextResponse.json({ error: "Kendi yüklediğiniz şarkıya oy veremezsiniz." }, { status: 403 });
    }

    // Eğer şarkı arşivdeyse (PLAYED), oy aldığında tekrar sıraya (QUEUED) girer!
    const newStatus = song.status === "PLAYED" ? "QUEUED" : song.status;

    await prisma.$transaction([
      prisma.vote.create({ data: { userId: user.id, songId } }),
      prisma.song.update({
        where: { id: songId },
        data: { 
          votesCount: { increment: 1 },
          status: newStatus 
        },
      }),
      // Yükleyen kişiye bildirim gönder (kendi kendine veremediği için sorun yok)
      prisma.notification.create({
        data: {
          userId: song.uploadedBy,
          type: "VOTE_RECEIVED",
          message: `🎉 "${song.title}" şarkın yeni bir oy aldı!`,
        }
      })
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
