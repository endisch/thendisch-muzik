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
    <div className="min-h-screen bg-black text-gray-100 flex flex-col font-sans selection:bg-emerald-500/30">
      {/* Sleek Navbar */}
      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-xl border-b border-white/5 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-black" fill="currentColor" viewBox="0 0 24 24"><path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/></svg>
          </div>
          <Link href="/">
            <h1 className="text-2xl font-black text-white tracking-tight hover:text-emerald-400 transition-colors">Thendisch <span className="font-light text-gray-400">Müzik</span></h1>
          </Link>
        </div>
        <div className="flex items-center gap-6">
          <AuthStatus session={session} />
        </div>
      </header>

      <main className="flex-1 max-w-[1400px] w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col gap-10">
        
        {/* Top Charts Banner Strip */}
        <section className="flex items-center gap-6 overflow-x-auto pb-4 no-scrollbar">
          <div className="flex-shrink-0 flex items-center justify-center h-24 px-6 rounded-2xl bg-zinc-900 border border-white/5">
            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest whitespace-nowrap">Ayın En<br/>İyileri</span>
          </div>
          <Link href="/top/10" className="flex-shrink-0 group relative w-64 h-24 rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-105 border border-white/5 hover:border-emerald-500/50 block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-black/80 z-10 group-hover:opacity-60 transition-opacity"></div>
            <img src="/images/top-10.jpg" alt="Top 10" className="absolute inset-0 w-full h-full object-cover z-0 opacity-70 mix-blend-screen" />
            <div className="relative z-20 h-full flex items-center px-6">
              <span className="text-3xl font-black text-white tracking-wider drop-shadow-md">TOP 10</span>
            </div>
          </Link>
          <Link href="/top/20" className="flex-shrink-0 group relative w-64 h-24 rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-105 border border-white/5 hover:border-emerald-500/50 block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-black/80 z-10 group-hover:opacity-60 transition-opacity"></div>
            <img src="/images/top-20.jpg" alt="Top 20" className="absolute inset-0 w-full h-full object-cover z-0 opacity-70 mix-blend-screen" />
            <div className="relative z-20 h-full flex items-center px-6">
              <span className="text-3xl font-black text-white tracking-wider drop-shadow-md">TOP 20</span>
            </div>
          </Link>
          <Link href="/top/50" className="flex-shrink-0 group relative w-64 h-24 rounded-2xl overflow-hidden shadow-lg transition-transform hover:scale-105 border border-white/5 hover:border-emerald-500/50 block">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-900/40 to-black/80 z-10 group-hover:opacity-60 transition-opacity"></div>
            <img src="/images/top-50.jpg" alt="Top 50" className="absolute inset-0 w-full h-full object-cover z-0 opacity-70 mix-blend-screen" />
            <div className="relative z-20 h-full flex items-center px-6">
              <span className="text-3xl font-black text-white tracking-wider drop-shadow-md">TOP 50</span>
            </div>
          </Link>
        </section>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left: Player (Takes up 7 cols) */}
          <div className="lg:col-span-7">
            <div className="sticky top-28">
              <RadioPlayer />
            </div>
          </div>

          {/* Right: Client Controls & Queue (Takes up 5 cols) */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <MusicClientView session={session} />
          </div>

        </div>
      </main>
    </div>
  );
}
