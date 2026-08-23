import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";
import bcrypt from "bcrypt";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "Giriş Yap",
      credentials: {
        email: { label: "E-posta", type: "email", placeholder: "ornek@mail.com" },
        password: { label: "Şifre", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("E-posta ve şifre zorunludur.");
        }
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user || !user.password) {
          throw new Error("Hesap bulunamadı veya bu e-posta Google ile kayıtlı.");
        }
        const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
        if (!isPasswordValid) {
          throw new Error("Hatalı şifre.");
        }
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image
        };
      }
    })
  ],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) return false;
        
        const isSuperAdmin = user.email === "thendisch@gmail.com";
        
        await prisma.user.upsert({
          where: { email: user.email },
          update: {
            googleId: account.providerAccountId,
            name: user.name,
            image: user.image,
            ...(isSuperAdmin && { role: "ADMIN", isVerifiedArtist: true })
          },
          create: {
            googleId: account.providerAccountId,
            email: user.email,
            name: user.name,
            image: user.image,
            role: isSuperAdmin ? "ADMIN" : "USER",
            isVerifiedArtist: isSuperAdmin ? true : false,
          },
        });
      }
      return true;
    },
    async session({ session }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).uploadCredits = dbUser.uploadCredits;
          (session.user as any).songsListened = dbUser.songsListened;
          (session.user as any).role = dbUser.role;
          (session.user as any).isVerifiedArtist = dbUser.isVerifiedArtist;
          (session.user as any).artistApplication = dbUser.artistApplication;
        }
      }
      return session;
    },
  },
};
