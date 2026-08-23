import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { userId, durationMinutes } = await req.json();

    if (!userId || typeof durationMinutes !== "number") {
      return NextResponse.json({ error: "Eksik parametre" }, { status: 400 });
    }

    let timeoutUntil = null;
    if (durationMinutes > 0) {
      timeoutUntil = new Date(Date.now() + durationMinutes * 60000);
    }

    await prisma.user.update({
      where: { id: userId },
      data: { chatTimeoutUntil: timeoutUntil }
    });

    return NextResponse.json({ success: true, timeoutUntil });

  } catch (error) {
    console.error("Timeout error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
