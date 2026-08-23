import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUploadUrl, publicKeyFor } from "@/lib/storage";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmalısın" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  const isVerifiedArtist = user.role === "ARTIST" && user.isVerifiedArtist;

  if (isVerifiedArtist) {
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
    return NextResponse.json(
      {
        error: "Yükleme hakkın kalmadı. 10 şarkı dinleyerek yeni bir hak kazanabilirsin.",
      },
      { status: 403 }
    );
  }

  try {
    const { filename, contentType } = await req.json();
    const key = publicKeyFor(user.id, filename);
    const uploadUrl = await getUploadUrl(key, contentType);

    return NextResponse.json({ uploadUrl, key });
  } catch (error: any) {
    console.error("Upload URL error:", error);
    return NextResponse.json({ error: "Upload bağlantısı oluşturulamadı: " + error.message }, { status: 500 });
  }
}
