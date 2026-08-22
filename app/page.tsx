"use client";

import { useEffect, useState } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Music2, Vote, Trophy, Radio, ChevronRight } from "lucide-react";

/* ---------- İnce grain dokusu — düz siyahın steril durmasını engeller ---------- */
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

const queue = [
  { title: "Gece Yarısı Sinyali", artist: "CEMİLECEM", votes: 812 },
  { title: "Kırık Ayna", artist: "Sazband Live", votes: 641 },
  { title: "Toz Bulutu", artist: "Thendisch", votes: 573 },
];

function NowPlayingPanel() {
  const [progress, setProgress] = useState(34);
  const [listeners, setListeners] = useState(342);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 0.6));
      setListeners((l) => l + Math.floor(Math.random() * 3) - 1);
    }, 400);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="relative w-full max-w-sm rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-5 backdrop-blur-2xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-1.5 w-1.5">
            {!reduceMotion && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
            )}
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-emerald-500">
            Şu An Çalıyor
          </span>
        </div>
        <span className="font-mono text-[10px] tracking-widest text-zinc-600">
          {listeners.toLocaleString("tr-TR")} dinleyici
        </span>
      </div>

      <div className="mt-4 flex items-center gap-4">
        <div className="h-16 w-16 shrink-0 rounded-lg bg-gradient-to-br from-emerald-500/25 via-zinc-800 to-black" />
        <div className="min-w-0">
          <p className="truncate text-base font-bold tracking-tight text-white">
            Gece Yarısı Sinyali
          </p>
          <p className="truncate text-sm text-zinc-500">CEMİLECEM</p>
        </div>
      </div>

      <div className="mt-4 h-[3px] w-full overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-emerald-500 transition-[width] duration-300 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="mt-5 border-t border-white/[0.06] pt-4">
        <p className="mb-2.5 font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
          Sırada
        </p>
        <div className="space-y-2.5">
          {queue.map((s) => (
            <div key={s.title} className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-zinc-300">{s.title}</p>
                <p className="truncate text-xs text-zinc-600">{s.artist}</p>
              </div>
              <span className="shrink-0 font-mono text-xs tabular-nums text-emerald-500/80">
                {s.votes}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: Music2,
    title: "Senin Müziğin",
    desc: "Şarkını yükle, ortak kuyruğa katıl. Herkesin sırası aynı akışta çalar.",
    span: "sm:col-span-2",
  },
  {
    icon: Vote,
    title: "Gerçek Zamanlı Oylama",
    desc: "Sıradaki şarkıyı topluluk belirler.",
    span: "",
  },
  {
    icon: Trophy,
    title: "Global Liste",
    desc: "Aylık Top 10, 20 ve 50 — en çok dinlenen parçalar.",
    span: "",
  },
];

/* ---------- Animasyon varyantları — sahneli, kademeli giriş ---------- */
const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.09, delayChildren: 0.05 },
  },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function LandingPage() {
  const reduceMotion = useReducedMotion();

  return (
    <main className="relative min-h-screen bg-black text-white antialiased">
      <Grain />

      {/* NAV */}
      <motion.nav
        initial={reduceMotion ? undefined : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7"
      >
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-emerald-500">
            <Radio className="h-3.5 w-3.5 text-black" strokeWidth={2.5} />
          </div>
          <span className="font-black tracking-tight">THENDISCH</span>
        </div>
        <a
          href="/muzik"
          className="group flex items-center gap-1 text-sm font-medium text-zinc-400 transition-colors hover:text-white"
        >
          Giriş Yap
          <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </a>
      </motion.nav>

      {/* HERO */}
      <section className="relative overflow-hidden px-6 pb-28 pt-10 sm:pt-16">
        <div className="pointer-events-none absolute -right-40 -top-20 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-[120px]" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-[400px] w-[400px] rounded-full bg-emerald-500/5 blur-[120px]" />

        <motion.div
          variants={reduceMotion ? undefined : container}
          initial={reduceMotion ? undefined : "hidden"}
          animate={reduceMotion ? undefined : "show"}
          className="relative z-10 mx-auto grid max-w-6xl items-center gap-16 lg:grid-cols-[1.1fr_0.9fr]"
        >
          <div>
            <motion.div
              variants={reduceMotion ? undefined : rise}
              className="mb-7 inline-flex items-center gap-2 rounded-full border border-white/[0.06] bg-zinc-900/50 px-3.5 py-1.5"
            >
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                7/24 canlı ortak yayın
              </span>
            </motion.div>

            <motion.h1
              variants={reduceMotion ? undefined : rise}
              className="text-balance font-black tracking-tight text-white [font-size:clamp(2.75rem,6vw,5rem)] leading-[1.03]"
            >
              Ortak Ritmi <span className="text-emerald-500">Hisset.</span>
            </motion.h1>

            <motion.p
              variants={reduceMotion ? undefined : rise}
              className="mt-6 max-w-lg text-balance text-lg text-zinc-400"
            >
              Thendisch Müzik, dinleyicilerin yönettiği 7/24 canlı ortak radyo
              deneyimidir. Şarkını yükle, oylamaya katıl, radyoyu sen yönet.
            </motion.p>

            <motion.div
              variants={reduceMotion ? undefined : rise}
              className="mt-10 flex flex-col gap-4 sm:flex-row"
            >
              <a
                href="/muzik"
                className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-9 py-4 text-base font-bold text-black transition-all duration-300 hover:scale-[1.03] hover:shadow-[0_0_40px_4px_rgba(16,185,129,0.4)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
              >
                Radyoya Bağlan
              </a>
              <a
                href="/top/10"
                className="inline-flex items-center justify-center rounded-full border border-white/10 px-9 py-4 text-base font-semibold text-white transition-all duration-300 hover:border-white/25 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/40"
              >
                Ayın En İyileri
              </a>
            </motion.div>
          </div>

          <motion.div
            variants={reduceMotion ? undefined : rise}
            className="flex justify-center lg:justify-end"
          >
            <NowPlayingPanel />
          </motion.div>
        </motion.div>
      </section>

      {/* FEATURES — bento grid, scroll'da beliriyor */}
      <section className="relative px-6 pb-32">
        <motion.div
          initial={reduceMotion ? undefined : "hidden"}
          whileInView={reduceMotion ? undefined : "show"}
          viewport={{ once: true, margin: "-80px" }}
          variants={reduceMotion ? undefined : container}
          className="mx-auto grid max-w-5xl gap-5 sm:grid-cols-2"
        >
          {features.map(({ icon: Icon, title, desc, span }) => (
            <motion.div
              key={title}
              variants={reduceMotion ? undefined : rise}
              className={`group rounded-2xl border border-white/[0.06] bg-zinc-900/40 p-8 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/20 hover:bg-zinc-900/70 ${span}`}
            >
              <div className="mb-6 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 transition-colors duration-300 group-hover:bg-emerald-500/15">
                <Icon className="h-5 w-5" strokeWidth={2} />
              </div>
              <h3 className="mb-2 text-lg font-bold tracking-tight text-white">
                {title}
              </h3>
              <p className="text-sm leading-relaxed text-zinc-500">{desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/[0.06] px-6 py-10">
        <p className="text-center text-sm text-zinc-600">
          Thendisch Müzik © 2026. Tüm hakları saklıdır.
        </p>
      </footer>
    </main>
  );
}
