"use client";

import RadioPlayer from "@/components/RadioPlayer";
import MusicClientView from "./MusicClientView";
import AuthStatus from "@/components/AuthStatus";
import { SiteNavigation } from "@/components/SiteNavigation";
import LiveChat from "@/components/LiveChat";
import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { Session } from "next-auth";

const charts = [
  { label: "Top 10", sub: "En çok oy alanlar", href: "/top/10" },
  { label: "Top 20", sub: "Yeni keşifler", href: "/top/20" },
  { label: "Top 50", sub: "Tüm arşiv", href: "/top/50" },
];

function ChartsStrip() {
  return (
    <nav className="studio-chart-shortcuts" aria-label="Müzik listeleri">
      {charts.map((c) => (
        <Link
          key={c.label}
          href={c.href}
          className="studio-chart-shortcut"
        >
          <div>
            <span>{c.sub}</span>
            <strong>{c.label}</strong>
          </div>
          <ChevronRight size={18} strokeWidth={1.5} aria-hidden="true" />
        </Link>
      ))}
    </nav>
  );
}

export default function MuzikPageClient({ session }: { session: Session | null }) {
  return (
    <main className="relative min-h-screen bg-[#090b0e] text-[#f7f8fa] antialiased pb-32">
      <SiteNavigation active="music" actions={<AuthStatus session={session} />} />

      <div className="flex flex-col items-center">
        <header className="studio-page-width pt-12 sm:pt-16">
          <p className="studio-page-kicker mb-4">
            THENDISCH STUDIO <span className="text-[#adb5c0]">/</span> CANLI MÜZİK
          </p>
          <h1 className="studio-page-title">
            Müzik <span className="studio-page-title-accent">odası</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-[#b8bec8] sm:text-base">
            Canlı yayına katıl, yeni parçalar keşfet ve sıradaki şarkıya oy ver.
          </p>
        </header>

        <div className="studio-page-width">
          <ChartsStrip />
        </div>

        <div className="studio-page-width grid items-start gap-8 pt-8 pb-24 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] xl:gap-10">

          <div className="order-2 mt-8 w-full xl:order-1 xl:mt-0">
            <LiveChat />
          </div>

          <div className="order-1 flex w-full flex-col items-center xl:order-2">
            <RadioPlayer />
            <MusicClientView />
          </div>

        </div>
      </div>
    </main>
  );
}
