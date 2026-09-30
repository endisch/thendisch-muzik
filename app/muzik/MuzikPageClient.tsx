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
        stroke="#c8323d"
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
      className="mx-auto flex max-w-[1500px] gap-4 overflow-x-auto px-8 pb-4 pt-8 no-scrollbar"
    >
      {charts.map((c) => (
        <motion.a
          key={c.label}
          href={c.href}
          variants={reduceMotion ? undefined : rise}
          className="group relative flex min-w-[260px] flex-1 items-center justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#101010] px-6 py-6 transition-all duration-300 hover:border-[#c8323d]/60 hover:bg-[#130b0c]"
        >
          <div className="pointer-events-none absolute left-0 top-0 h-full w-1 bg-[#c8323d] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
          <div className="relative z-10 flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#ff777e]">
              {c.sub}
            </p>
            <p className="font-display text-3xl tracking-wide text-white">
              {c.label}
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-4">
            <Sparkline data={c.spark} />
            <ChevronRight className="h-6 w-6 text-zinc-600 transition-all duration-500 group-hover:translate-x-2 group-hover:text-[#ff777e]" strokeWidth={1} />
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
}

export default function MuzikPageClient({ session }: { session: Session | null }) {
  return (
    <main className="relative min-h-screen bg-[#080808] text-white antialiased pb-32">
      <Grain />
      
      {/* Avant-Garde Background Glows wrapped in a fixed container so they don't break scroll */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#c8323d]/5 blur-[150px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-[#c8323d]/5 blur-[120px]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-40 border-b border-white/[0.08] bg-[#080808]/90 backdrop-blur-3xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-6 py-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#c8323d]/50 bg-[#111] transition-all duration-300 group-hover:bg-[#c8323d] group-hover:shadow-[0_0_20px_rgba(200,50,61,0.25)]">
              <Radio className="h-4 w-4 text-[#ff777e] group-hover:text-white transition-colors" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl tracking-tighter text-white leading-none">THENDISCH</span>
              <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-[#ff777e] leading-none mt-1">STUDIO</span>
            </div>
          </Link>
          <div className="flex items-center gap-6">
            <AuthStatus session={session} />
          </div>
        </div>
      </nav>

      <div className="relative z-10 flex flex-col items-center">
        <header className="w-full max-w-[1500px] px-6 pt-12 sm:px-8 sm:pt-16">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#c8323d]/30 bg-[#c8323d]/[0.08] px-3 py-1.5 font-mono text-[9px] uppercase tracking-[0.24em] text-[#ff777e]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c8323d] shadow-[0_0_10px_rgba(200,50,61,0.7)]" />
            THENDISCH STUDIO <span className="text-white/30">/</span> CANLI MÜZİK
          </p>
          <h1 className="font-sans text-4xl font-medium tracking-tight text-white sm:text-6xl">
            Müzik <span className="font-display font-normal tracking-normal text-[#ff777e]">odası</span>
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-6 text-zinc-400 sm:text-base">
            Birlikte dinle. Sıradaki parçayı birlikte seç.
          </p>
        </header>

        <div className="w-full">
          <ChartsStrip />
        </div>

        {/* 2 Column Spacious Layout for large screens: LiveChat - (Player + Queue) */}
        <div className="w-full max-w-[1600px] px-8 pt-8 pb-24 grid xl:grid-cols-[500px_1fr] gap-12 items-start">
          
          {/* Left Column: LiveChat */}
          <div className="w-full order-2 xl:order-1 mt-12 xl:mt-0">
            <LiveChat />
          </div>

          {/* Right Column: RadioPlayer and QueueList */}
          <div className="w-full flex flex-col items-center order-1 xl:order-2">
            <RadioPlayer />
            <MusicClientView session={session} />
          </div>

        </div>
      </div>
    </main>
  );
}
