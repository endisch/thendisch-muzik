import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Arka plan animasyonu/glow */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 text-center max-w-3xl">
        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-6 drop-shadow-lg">
          Thendisch Müzik
        </h1>
        <p className="text-xl md:text-2xl text-gray-300 mb-12 font-light">
          Türkiye'nin ilk interaktif ortak radyo deneyimi. Şarkını ekle, oylamaya katıl, radyoyu sen yönet.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            href="/muzik" 
            className="group relative px-8 py-4 bg-blue-600 text-white font-bold text-xl rounded-full overflow-hidden shadow-[0_0_40px_rgba(37,99,235,0.5)] hover:shadow-[0_0_60px_rgba(37,99,235,0.8)] transition-all hover:-translate-y-1"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out"></div>
            <span className="relative flex items-center gap-2">
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
              Radyoya Bağlan
            </span>
          </Link>
          
          <Link 
            href="/top/10"
            className="px-8 py-4 bg-gray-800 text-white font-bold text-xl rounded-full border border-gray-700 hover:bg-gray-700 transition-all hover:-translate-y-1 flex items-center gap-2"
          >
            <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            Ayın En İyileri
          </Link>
        </div>
      </div>
    </main>
  );
}
