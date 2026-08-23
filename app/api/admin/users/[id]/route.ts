import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (session?.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const userId = params.id;
    const data = await request.json();

    // Sadece izin verilen alanları güncelleyelim
    const updateData: any = {};
    
    if (data.uploadCredits !== undefined) updateData.uploadCredits = data.uploadCredits;
    if (data.isVerifiedArtist !== undefined) updateData.isVerifiedArtist = data.isVerifiedArtist;
    if (data.role !== undefined) updateData.role = data.role;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isVerifiedArtist: true,
        uploadCredits: true
      }
    });

    return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });

  } catch (error) {
    console.error("Admin user update error:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
