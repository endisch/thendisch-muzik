import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    // Yalnızca adminlerin çalıştırmasına izin ver
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const updated = await prisma.user.updateMany({
      where: { uploadCredits: 0 },
      data: { uploadCredits: 3 }
    });

    return NextResponse.json({ 
      success: true, 
      message: `${updated.count} kullanıcının yükleme hakkı 3 olarak güncellendi.` 
    });
  } catch (error) {
    return NextResponse.json({ error: "Veritabanı hatası" }, { status: 500 });
  }
}
