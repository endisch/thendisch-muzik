import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const { instagram, spotify, youtube } = await request.json();

    if (!instagram || !spotify || !youtube) {
      return NextResponse.json({ error: "Tüm linkleri doldurmanız gerekmektedir." }, { status: 400 });
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        artistApplication: true,
        instagramUrl: instagram,
        spotifyUrl: spotify,
        youtubeUrl: youtube
      }
    });

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error("Artist application error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
