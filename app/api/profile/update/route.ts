import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Oturum açmanız gerekiyor." }, { status: 401 });
    }

    const { name, image, bio, instagramUrl, spotifyUrl, youtubeUrl } = await req.json();

    const user = await prisma.user.update({
      where: { email: session.user.email },
      data: {
        name: name || null,
        image: image || null,
        bio: bio || null,
        instagramUrl: instagramUrl || null,
        spotifyUrl: spotifyUrl || null,
        youtubeUrl: youtubeUrl || null
      }
    });

    return NextResponse.json({ success: true, user }, { status: 200 });

  } catch (error) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
