import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "E-posta ve doğrulama kodu gereklidir." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({ error: "Kullanıcı bulunamadı." }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: "Bu hesap zaten doğrulanmış." }, { status: 400 });
    }

    if (!user.verificationCode || user.verificationCode !== code) {
      return NextResponse.json({ error: "Geçersiz doğrulama kodu." }, { status: 400 });
    }

    if (!user.verificationCodeExpires || user.verificationCodeExpires < new Date()) {
      return NextResponse.json({ error: "Doğrulama kodunun süresi dolmuş. Lütfen tekrar kayıt olmayı deneyin." }, { status: 400 });
    }

    // Doğrulama başarılı
    await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationCode: null,
        verificationCodeExpires: null,
      }
    });

    return NextResponse.json({ success: true, message: "E-posta başarıyla doğrulanmıştır." }, { status: 200 });

  } catch (error) {
    console.error("Doğrulama hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
