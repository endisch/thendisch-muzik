import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const { email, password, name, isArtistApplication, instagramUrl, spotifyUrl, youtubeUrl } = data;

    if (!email || !password) {
      return NextResponse.json({ error: "E-posta ve şifre zorunludur" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: "Bu e-posta adresi zaten kullanılıyor." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Otomatik Admin atama kontrolü
    let role: "USER" | "ARTIST" | "ADMIN" = "USER";
    let isVerifiedArtist = false;

    if (email === "thendisch@gmail.com") {
      role = "ADMIN";
      isVerifiedArtist = true; // Admin aynı zamanda doğrulanmış olsun
    } else if (isArtistApplication) {
      role = "ARTIST";
    }

    const user = await prisma.user.create({
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
      }
    });

    return NextResponse.json({ message: "Kayıt başarılı" }, { status: 201 });
  } catch (error) {
    console.error("Kayıt hatası:", error);
    return NextResponse.json({ error: "Sunucu hatası" }, { status: 500 });
  }
}
