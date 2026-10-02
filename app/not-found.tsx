import Link from "next/link";
import { SiteNavigation } from "@/components/SiteNavigation";

export default function NotFound() {
  return (
    <>
      <SiteNavigation />
      <main className="mx-auto max-w-5xl px-6 py-24 md:py-32">
        <p className="studio-page-kicker mb-6">404 / Sayfa bulunamadı</p>
        <h1 className="studio-page-title max-w-3xl">Bir adım geri.<br />Yeni bir yol ileri.</h1>
        <p className="mt-8 max-w-lg text-base leading-relaxed text-[#adb5c0]">Bu sayfa taşınmış ya da kaldırılmış olabilir. Stüdyoya dön veya müzik odasında yeni bir ses keşfet.</p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/" className="min-h-12 bg-[#ff543b] px-6 py-3 text-[#090b0e] font-semibold hover:bg-[#ff6c55]">Stüdyoya dön</Link>
          <Link href="/muzik" className="min-h-12 border border-[#2b323d] px-6 py-3 hover:border-[#ff543b]">Müzik odasına gir</Link>
        </div>
      </main>
    </>
  );
}
