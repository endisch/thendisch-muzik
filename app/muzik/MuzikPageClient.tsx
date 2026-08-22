"use client";

import RadioPlayer from "@/components/RadioPlayer";
import MusicClientView from "./MusicClientView";
import AuthStatus from "@/components/AuthStatus";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Radio, ChevronRight } from "lucide-react";
import { Session } from "next-auth";

function Grain() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-overlay"
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
      }}
    />
  );
}

const charts = [
  { label: "TOP 10", sub: "Bu ayın zirvesi", href: "/top/10", spark: [4, 7, 5, 9, 8, 12, 15] },
  { label: "TOP 20", sub: "Yükselen parçalar", href: "/top/20", spark: [8, 6, 9, 7, 11, 9, 13] },
  { label: "TOP 50", sub: "Tüm liste", href: "/top/50", spark: [6, 8, 7, 10, 9, 11, 10] },
];

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
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
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="h-8 w-16 opacity-80">
      <polyline
        points={points}
        fill="none"
        stroke="#10b981"
        strokeWidth="6"
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
      className="mx-auto flex max-w-7xl gap-4 overflow-x-auto px-6 pb-2 pt-8 no-scrollbar"
    >
      {charts.map((c) => (
        <motion.a
          key={c.label}
          href={c.href}
          variants={reduceMotion ? undefined : rise}
          className="group relative flex min-w-[240px] flex-1 items-center justify-between overflow-hidden rounded-2xl border border-white/[0.06] bg-zinc-900/50 px-6 py-5 backdrop-blur-3xl transition-all duration-300 hover:border-emerald-500/25"
        >
          <div className="pointer-events-none absolute -right-6 -top-10 h-28 w-28 rounded-full bg-emerald-500/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80" />
          <div className="relative z-10">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {c.sub}
            </p>
            <p className="mt-1 text-2xl font-black tracking-tight text-white">
              {c.label}
            </p>
          </div>
          <div className="relative z-10 flex items-center gap-2">
            <Sparkline data={c.spark} />
            <ChevronRight className="h-5 w-5 text-zinc-600 transition-all duration-300 group-hover:translate-x-1 group-hover:text-emerald-500" />
          </div>
        </motion.a>
      ))}
    </motion.div>
  );
}

export default function MuzikPageClient({ session }: { session: Session | null }) {
  return (
    <main className="relative min-h-screen bg-black text-white antialiased">
      <Grain />
      
      {/* Navbar */}
      <nav className="sticky top-0 z-40 border-b border-white/[0.06] bg-black/70 backdrop-blur-2xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500 transition-transform group-hover:scale-105">
              <Radio className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
            </div>
            <span className="font-black tracking-tight group-hover:text-emerald-400 transition-colors">THENDISCH MÜZİK</span>
          </Link>
          <div className="flex items-center gap-4">
            <AuthStatus session={session} />
          </div>
        </div>
      </nav>

      <ChartsStrip />

      <div className="mx-auto grid max-w-7xl gap-6 px-6 py-10 lg:grid-cols-12">
        <div className="lg:col-span-7">
          <div className="lg:sticky lg:top-24">
            <RadioPlayer />
          </div>
        </div>
        <div className="flex flex-col gap-5 lg:col-span-5">
          <MusicClientView session={session} />
        </div>
      </div>
    </main>
  );
}
