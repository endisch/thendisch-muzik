import RadioPlayer from "@/components/RadioPlayer";
import UploadForm from "@/components/UploadForm";
import QueueList from "@/components/QueueList";
import AuthStatus from "@/components/AuthStatus";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import MusicClientView from "./MusicClientView"; // We will create this to manage refresh state

export const dynamic = "force-dynamic";

export default async function MuzikPage() {
  const session = await getServerSession(authOptions);

  return (
    <main className="max-w-4xl mx-auto p-4 sm:p-6">
      <header className="mb-8 text-center border-b pb-4">
        <h1 className="text-3xl font-extrabold text-blue-600 mb-2">Thendisch Müzik</h1>
        <p className="text-gray-500">7/24 Canlı, Ortak Radyo Deneyimi</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="sticky top-4">
            <RadioPlayer />
          </div>
        </div>

        <div>
          <AuthStatus session={session} />
          
          <MusicClientView session={session} />
        </div>
      </div>
    </main>
  );
}
