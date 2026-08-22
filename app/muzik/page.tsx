import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MuzikPageClient from "./MuzikPageClient";

export const dynamic = "force-dynamic";

export default async function MuzikPage() {
  const session = await getServerSession(authOptions);

  return <MuzikPageClient session={session} />;
}
