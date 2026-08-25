import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const song = await prisma.song.findUnique({ where: { id: params.id } });
    if (!song)
      return NextResponse.json({ error: "Song not found" }, { status: 404 });

    // Yalnızca şarkının sahibi veya ADMIN düzenleyebilir
    if (song.uploadedBy !== user.id && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz işlem" }, { status: 403 });
    }

    const data = await request.json();
    const { title, artist, coverUrl, lyricsLrc, youtubeUrl } = data;

    // Güncelleme verilerini hazırla (Sadece gönderilen alanları güncelle)
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (artist !== undefined) updateData.artist = artist;
    if (coverUrl !== undefined) updateData.coverUrl = coverUrl;
    if (lyricsLrc !== undefined) updateData.lyricsLrc = lyricsLrc;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;

    const updatedSong = await prisma.song.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, song: updatedSong });
  } catch (error) {
    console.error("Song PUT error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
