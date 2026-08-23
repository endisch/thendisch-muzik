"use client";

import RadioPlayer from "@/components/RadioPlayer";
import MusicClientView from "./MusicClientView";
import AuthStatus from "@/components/AuthStatus";
import LiveChat from "@/components/LiveChat";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Radio, ChevronRight } from "lucide-react";
import { Session } from "next-auth";

function Grain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.03] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

const charts = [
  { label: "VIP 10", sub: "Zirvenin Sesi", href: "/top/10", spark: [4, 7, 5, 9, 8, 12, 15] },
  { label: "TREND", sub: "Yeni Keşifler", href: "/top/20", spark: [8, 6, 9, 7, 11, 9, 13] },
  { label: "ARCHIVE", sub: "Tüm Koleksiyon", href: "/top/50", spark: [6, 8, 7, 10, 9, 11, 10] },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const points = data
    .map((v, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - ((v - min) / (max - min || 1)) * 100;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-10 w-20 opacity-40 mix-blend-screen">
      <polyline
        points={points}
        fill="none"
        stroke="#D4AF37"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ChartsStrip() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? undefined : "hidden"}
      whileInView={reduceMotion ? undefined : "show"}
      viewport={{ once: true, margin: "-40px" }}
      variants={reduceMotion ? undefined : container}
      className="mx-auto flex max-w-[1500px] gap-6 overflow-x-auto px-8 pb-4 pt-12 no-scrollbar"
    >
      {charts.map((c) => (
        <motion.a
          key={c.label}
          href={c.href}
          variants={reduceMotion ? undefined : rise}
          className="group relative flex min-w-[280px] flex-1 items-center justify-between overflow-hidden rounded-3xl border border-white/[0.03] bg-white/[0.01] backdrop-blur-md px-8 py-8 transition-all duration-500 hover:border-[#D4AF37]/30 hover:bg-white/[0.03]"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-[#D4AF37] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
              {c.sub}
            </p>
            <p className="text-3xl font-black tracking-tighter text-white">
              {c.label}
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <Sparkline data={c.spark} />
            <ChevronRight className="h-6 w-6 text-zinc-600 transition-all duration-500 group-hover:translate-x-2 group-hover:text-[#D4AF37]" strokeWidth={1} />
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
}

export default function MuzikPageClient({ session }: { session: Session | null }) {
  return (
    <main className="relative min-h-screen bg-[#0B0C10] text-white antialiased overflow-hidden pb-32">
      <Grain />
      
      {/* Avant-Garde Background Glows */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#D4AF37]/5 blur-[150px] pointer-events-none z-0"></div>
      <div className="fixed bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#D4AF37]/5 blur-[120px] pointer-events-none z-0"></div>

      {/* Navbar */}
      <nav className="relative z-40 border-b border-white/[0.02] bg-[#0B0C10]/80 backdrop-blur-3xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-8 py-6">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-none border border-[#D4AF37]/30 bg-black transition-transform duration-500 group-hover:scale-95 group-hover:bg-[#D4AF37]">
              <Radio className="h-4 w-4 text-[#D4AF37] group-hover:text-black transition-colors" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-white leading-none">THENDISCH</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#D4AF37] leading-none mt-1">Acoustics</span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <AuthStatus session={session} />
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center">
        <div className="w-full">
          <ChartsStrip />
        </div>

        {/* 3 Column Layout for large screens: LiveChat - Player - Queue */}
        <div className="w-full max-w-[1500px] px-8 pt-8 pb-24 grid lg:grid-cols-[1fr_400px] xl:grid-cols-[380px_1fr_380px] gap-8 items-start">
          
          <div className="w-full hidden xl:block">
            <LiveChat />
          </div>

          <div className="w-full flex justify-center">
            <RadioPlayer />
          </div>
          
          <div className="w-full flex flex-col gap-8">
            <MusicClientView session={session} />
            
            {/* Show LiveChat below queue on smaller than XL screens */}
            <div className="xl:hidden">
              <LiveChat />
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
