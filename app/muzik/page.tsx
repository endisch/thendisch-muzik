import RadioPlayer from "@/components/RadioPlayer";
import UploadForm from "@/components/UploadForm";
import QueueList from "@/components/QueueList";
import AuthStatus from "@/components/AuthStatus";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Link from "next/link";
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
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

      <section className="mt-16 border-t border-gray-800 pt-12">
        <h2 className="text-2xl font-bold text-white mb-6 text-center">Ayın En İyileri</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <Link href="/top/10" className="group relative h-40 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 block border border-gray-700 hover:border-blue-500">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-purple-900/80 z-10 group-hover:opacity-70 transition-opacity"></div>
            <img src="/images/top-10.jpg" alt="Top 10" className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-overlay" />
            <div className="relative z-20 h-full flex items-center justify-center">
              <span className="text-3xl font-black text-white tracking-widest drop-shadow-lg">TOP 10</span>
            </div>
          </Link>
          
          <Link href="/top/20" className="group relative h-40 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 block border border-gray-700 hover:border-orange-500">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-900/80 to-red-900/80 z-10 group-hover:opacity-70 transition-opacity"></div>
            <img src="/images/top-20.jpg" alt="Top 20" className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-overlay" />
            <div className="relative z-20 h-full flex items-center justify-center">
              <span className="text-3xl font-black text-white tracking-widest drop-shadow-lg">TOP 20</span>
            </div>
          </Link>
          
          <Link href="/top/50" className="group relative h-40 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all hover:-translate-y-1 block border border-gray-700 hover:border-yellow-500">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-900/80 to-gray-900/80 z-10 group-hover:opacity-70 transition-opacity"></div>
            <img src="/images/top-50.jpg" alt="Top 50" className="absolute inset-0 w-full h-full object-cover z-0 mix-blend-overlay" />
            <div className="relative z-20 h-full flex items-center justify-center">
              <span className="text-3xl font-black text-white tracking-widest drop-shadow-lg">TOP 50</span>
            </div>
          </Link>
        </div>
      </section>
    </main>
  );
}
