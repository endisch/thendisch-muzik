import GoogleProvider from "next-auth/providers/google";
import type { NextAuthOptions } from "next-auth";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (!account || !user.email) return false;
      // İlk giriş: kullanıcıyı 3 yükleme hakkıyla oluştur. Sonraki girişlerde dokunma.
      await prisma.user.upsert({
        where: { googleId: account.providerAccountId },
        update: {},
        create: {
          googleId: account.providerAccountId,
          email: user.email,
          name: user.name,
          image: user.image,
        },
      });
      return true;
    },
    async session({ session, token }) {
      if (session.user?.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (dbUser) {
          (session.user as any).id = dbUser.id;
          (session.user as any).uploadCredits = dbUser.uploadCredits;
          (session.user as any).songsListened = dbUser.songsListened;
        }
      }
      return session;
    },
  },
};
