import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";
import { sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name, isArtistApplication, instagramUrl, spotifyUrl, youtubeUrl } = data;

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunludur" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      if (!existingUser.emailVerified) {
        // Kullanıcı var ama doğrulamamış. Yeni kod gönderelim.
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika

        // Yeni şifreyi de kaydedelim ki değiştirdiyse güncellensin
        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
          where: { email },
          data: {
            password: hashedPassword,
            name: name || existingUser.name,
            verificationCode: code,
            verificationCodeExpires: expires,
          }
        });

        // Mail gönder
        const emailSent = await sendVerificationEmail(email, code);
        
        return NextResponse.json({ 
          message: "Hesap doğrulama bekliyor. Yeni kod gönderildi.", 
          requiresVerification: true 
        }, { status: 200 });
      }
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Otomatik Admin atama kontrolü
    let role: "USER" | "ARTIST" | "ADMIN" = "USER";
    let isVerifiedArtist = false;

    if (email === "thendisch@gmail.com") {
      role = "ADMIN";
      isVerifiedArtist = true; 
    } else if (isArtistApplication) {
      role = "ARTIST";
    }

    // 6 haneli doğrulama kodu oluştur
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 dakika geçerli

    await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || email.split("@")[0],
        role: role,
        artistApplication: isArtistApplication || false,
        instagramUrl: instagramUrl || null,
        spotifyUrl: spotifyUrl || null,
        youtubeUrl: youtubeUrl || null,
        isVerifiedArtist: isVerifiedArtist,
        uploadCredits: 3, // İlk kayıtta 3 hediye yükleme hakkı
        emailVerified: false, // E-posta henüz doğrulanmadı
        verificationCode,
        verificationCodeExpires
      }
    });

    // E-posta gönder (hata verse bile db'ye kaydedildi, kullanıcı tekrar kod isteyebilir ileride)
    await sendVerificationEmail(email, verificationCode);

    return NextResponse.json({ 
      message: "Kayıt başarılı. Lütfen e-postanızı doğrulayın.",
      requiresVerification: true
    }, { status: 201 });
    
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
