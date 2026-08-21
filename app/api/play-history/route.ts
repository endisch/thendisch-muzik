import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Client, bir şarkının en az %80'ini dinlediğinde bu endpoint'i çağırır.
// 10 "tam dinleme" birikince kullanıcıya otomatik olarak yeni bir yükleme hakkı verilir.
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Giriş yapmalısın" }, { status: 401 });
  }

  const { songId } = await req.json();

  const user = await prisma.user.findUnique({
    where: { email: session.user.email! },
  });
  if (!user) return NextResponse.json({ error: "Kullanıcı bulunamadı" }, { status: 404 });

  // Aynı şarkı için tekrar tekrar sayılmasın diye kısa süre içinde tekrar
  // kayıt var mı kontrol edilebilir; basit tutmak için burada atlandı.
  await prisma.playHistory.create({
    data: { userId: user.id, songId, completed: true },
  });

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { songsListened: { increment: 1 } },
  });

  let gainedCredit = false;
  if (updated.songsListened >= 10) {
    await prisma.user.update({
      where: { id: user.id },
      data: { uploadCredits: { increment: 1 }, songsListened: 0 },
    });
    gainedCredit = true;
  }

  return NextResponse.json({ gainedCredit });
}
