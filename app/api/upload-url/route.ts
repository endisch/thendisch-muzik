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

  if (user.uploadCredits <= 0) {
    return NextResponse.json(
      {
        error:
          "Yükleme hakkın kalmadı. 10 şarkı dinleyerek yeni bir hak kazanabilirsin.",
      },
      { status: 403 }
    );
  }

  const { filename, contentType } = await req.json();
  const key = publicKeyFor(user.id, filename);
  const uploadUrl = await getUploadUrl(key, contentType);

  return NextResponse.json({ uploadUrl, key });
}
