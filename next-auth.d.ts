import type { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session {
    user?: DefaultSession["user"] & {
      id?: string;
      uploadCredits?: number;
      songsListened?: number;
      role?: "USER" | "ARTIST" | "ADMIN";
      isVerifiedArtist?: boolean;
      artistApplication?: boolean | null;
    };
  }
}
