"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Music, Trophy, Disc3, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

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

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1, delayChildren: 0.3 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] },
  },
};

export default function LandingPage() {
  const reduceMotion = useReducedMotion();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <div className="min-h-screen bg-[#0B0C10]" />;

  return (
    <main className="relative bg-[#0B0C10] text-white antialiased overflow-x-hidden selection:bg-[#D4AF37]/30 selection:text-[#D4AF37]">
      <Grain />

      {/* Abstract Glowing Orbs */}
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full bg-[#D4AF37]/5 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-20%] left-[-10%] w-[800px] h-[800px] rounded-full bg-[#D4AF37]/3 blur-[180px] pointer-events-none" />

      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-8 md:px-16">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col"
        >
          <span className="font-black text-2xl tracking-tighter leading-none">THENDISCH</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.4em] text-[#D4AF37] leading-none mt-1">Acoustics</span>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        >
          <Link href="/muzik" className="group flex items-center gap-2 text-sm font-mono uppercase tracking-widest text-zinc-500 hover:text-[#D4AF37] transition-colors">
            VIP Giriş
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-[75vh] px-6 text-center pb-20">
        <motion.div
          variants={reduceMotion ? undefined : container}
          initial="hidden"
          animate="show"
          className="max-w-5xl mx-auto flex flex-col items-center"
        >
          <motion.div variants={fadeUp} className="mb-8 overflow-hidden rounded-full border border-white/[0.05] bg-white/[0.02] backdrop-blur-md px-6 py-2">
            <span className="font-mono text-[11px] uppercase tracking-[0.3em] text-[#D4AF37]">
              Lüks, Kalite ve Kesintisiz Müzik
            </span>
          </motion.div>

          <motion.h1 
            variants={fadeUp}
            className="text-balance font-black tracking-tighter text-white [font-size:clamp(3.5rem,8vw,8rem)] leading-[0.9]"
          >
            Sıradanlığı <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#D4AF37] via-[#F3E5AB] to-[#8A6D1C]">
              Reddet.
            </span>
          </motion.h1>

          <motion.p 
            variants={fadeUp}
            className="mt-8 max-w-2xl text-balance text-lg md:text-xl text-zinc-400 font-light leading-relaxed"
          >
            Dünyanın ilk sanat galerisi formatındaki canlı müzik kulübü. Kendi müziklerini yükle, topluluğun seçtiği ritimlere yön ver ve VIP Lounge'da elit dinleyicilerle anı yaşa.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-14 flex flex-col sm:flex-row items-center gap-6">
            {/* Elegant, sophisticated Play button without background blob */}
            <Link 
              href="/muzik"
              className="group flex items-center gap-3 border border-[#D4AF37]/50 rounded-full px-10 py-4 text-[#D4AF37] transition-all duration-500 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] hover:shadow-[0_0_30px_rgba(212,175,55,0.2)]"
            >
              <span className="font-bold uppercase tracking-widest text-sm">Deneyimi Başlat</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
            
            <Link 
              href="/top/10"
              className="group flex items-center gap-3 rounded-full border border-white/10 px-10 py-4 text-white transition-all duration-500 hover:border-white/30 hover:bg-white/[0.02]"
            >
              <Trophy className="h-4 w-4 text-zinc-500 group-hover:text-white transition-colors" />
              <span className="font-medium uppercase tracking-widest text-sm text-zinc-300 group-hover:text-white transition-colors">Zirvedekiler</span>
            </Link>
          </motion.div>
        </motion.div>
      </section>

      {/* Decorative Minimalist Features */}
      <section className="relative z-10 border-t border-white/[0.05] bg-gradient-to-b from-[#121318]/50 to-[#0B0C10]">
        <div className="mx-auto max-w-7xl px-8 py-24 md:py-32">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8">
            {[
              {
                icon: Disc3,
                title: "Kusursuz Akustik",
                desc: "Her parça, en ince detayına kadar dinleyicilerin onayından geçer."
              },
              {
                icon: Music,
                title: "Senin Sahnen",
                desc: "Doğrulanmış sanatçı ol, eserlerini milyonların beğenebileceği bir vitrine taşı."
              },
              {
                icon: Trophy,
                title: "Koleksiyon",
                desc: "Her ayın en elit 10 parçası arşivlenir ve Thendisch efsaneleri arasına girer."
              }
            ].map((f, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.8, delay: i * 0.2, ease: [0.16, 1, 0.3, 1] }}
                className="flex flex-col gap-4 border-l border-white/[0.05] pl-6 hover:border-[#D4AF37]/30 transition-colors duration-500"
              >
                <f.icon className="h-6 w-6 text-[#D4AF37]" strokeWidth={1.5} />
                <h3 className="text-xl font-bold tracking-tight text-white">{f.title}</h3>
                <p className="text-zinc-500 font-light leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-zinc-600">
          © 2026 Thendisch Acoustics.
        </p>
      </footer>
    </main>
  );
}
