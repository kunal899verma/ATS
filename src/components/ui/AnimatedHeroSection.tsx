"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Sparkles, Play } from "lucide-react";
import dynamic from "next/dynamic";

const ParticleCanvas = dynamic(() => import("./ParticleCanvas"), { ssr: false });

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const EASE: [number, number, number, number] = [0.25, 0.1, 0.25, 1];

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

const SUB_SCORES = [
  { label: "Keywords", pct: 91, color: "from-indigo-400 to-indigo-500" },
  { label: "Skills",   pct: 88, color: "from-violet-400 to-violet-500" },
  { label: "Formatting", pct: 84, color: "from-emerald-400 to-emerald-500" },
  { label: "Recruiter", pct: 80, color: "from-amber-400 to-amber-500" },
];

const QUICK_WINS = [
  "Add 'TypeScript' to skills section",
  "Quantify impact in 2nd bullet point",
  "Missing LinkedIn URL in contact",
];

export default function AnimatedHeroSection() {
  const [showCanvas, setShowCanvas] = useState(false);

  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const isLargeViewport = window.innerWidth >= 1024;
    if (prefersReduced || !isLargeViewport) return;

    const schedule = "requestIdleCallback" in window
      ? window.requestIdleCallback(() => setShowCanvas(true), { timeout: 1200 })
      : setTimeout(() => setShowCanvas(true), 700);

    return () => {
      if ("cancelIdleCallback" in window && typeof schedule === "number") {
        window.cancelIdleCallback(schedule);
        return;
      }
      clearTimeout(schedule);
    };
  }, []);

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden pt-16">
      {showCanvas ? <ParticleCanvas count={32} /> : null}
      {/* Gradient mesh */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(99,102,241,0.12),transparent)]" />
      <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-indigo-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">

          {/* Left: text — 7 cols */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left lg:col-span-7"
          >
            {/* Eyebrow badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/25 bg-indigo-500/5 text-indigo-400 text-xs font-medium mb-8">
              <Sparkles className="w-3 h-3" />
              Trusted by 50,000+ job seekers
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={item} className="text-4xl sm:text-5xl lg:text-6xl xl:text-[68px] font-bold text-white leading-[1.08] tracking-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              Your Resume Deserves More Than a{" "}
              <span className="gradient-text">7-Second Glance</span>
            </motion.h1>

            <motion.p variants={item} className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Free AI-powered ATS analysis that actually tells you what to fix — not just what&apos;s wrong.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
              <Link href="/analyze" className="btn-primary flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base font-semibold group w-full sm:w-auto">
                Analyze My Resume — Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a href="#how-it-works" className="btn-ghost flex items-center justify-center gap-2 px-6 py-4 rounded-xl text-sm font-medium w-full sm:w-auto">
                <Play className="w-3.5 h-3.5" />
                See How It Works
              </a>
            </motion.div>

            {/* Trust row */}
            <motion.div variants={item} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-slate-500 text-sm">
              {["No signup", "100% Free", "AI-Powered", "Privacy First"].map((text) => (
                <span key={text} className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  {text}
                </span>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: mockup card — 5 cols */}
          <motion.div
            className="hidden lg:block relative lg:col-span-5"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-indigo-500/10 to-violet-500/10 rounded-3xl blur-2xl" />

            <motion.div
              className="relative glass-card p-5 shadow-2xl cursor-pointer"
              whileHover={{ scale: 1.02, borderColor: "rgba(99,102,241,0.3)" }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white text-sm font-semibold">Sarah M.</p>
                  <p className="text-slate-400 text-xs">Senior Software Engineer</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white leading-none" style={{ fontFamily: 'var(--font-display)' }}>87</div>
                  <div className="text-xs text-emerald-400 font-medium">Grade A</div>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-2 bg-white/5 rounded-full mb-5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-indigo-400 to-violet-500 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: "87%" }}
                  transition={{ duration: 1.2, delay: 0.8, ease: "easeOut" }}
                />
              </div>

              {/* Sub-scores */}
              <div className="space-y-2.5 mb-5">
                {SUB_SCORES.map(({ label, pct, color }, idx) => (
                  <div key={label} className="flex items-center gap-2.5">
                    <span className="text-slate-400 text-xs w-20 flex-shrink-0">{label}</span>
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <motion.div
                        className={`h-full bg-gradient-to-r ${color} rounded-full`}
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 1, delay: 1 + idx * 0.1, ease: "easeOut" }}
                      />
                    </div>
                    <span className="text-slate-300 text-xs w-8 text-right font-mono">{pct}%</span>
                  </div>
                ))}
              </div>

              {/* Quick wins */}
              <div className="border-t border-white/5 pt-4">
                <p className="text-xs font-semibold text-amber-400 mb-2.5 flex items-center gap-1.5">
                  <span>⚡</span> 3 Quick Wins Found
                </p>
                {QUICK_WINS.map((win, idx) => (
                  <motion.div
                    key={win}
                    className="flex items-start gap-2 mb-1.5"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.5 + idx * 0.1, duration: 0.4 }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-1.5 flex-shrink-0" />
                    <p className="text-slate-300 text-xs">{win}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Floating badges */}
            <motion.div
              className="absolute -top-3 -right-3 bg-emerald-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 1.8, type: "spring", stiffness: 200 }}
            >
              ATS Ready
            </motion.div>

            <motion.div
              className="absolute -bottom-3 -left-3 glass-card text-xs px-3 py-1.5 rounded-full text-slate-300"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, type: "spring", stiffness: 200 }}
            >
              Analyzed in 3.2s
            </motion.div>

            <motion.div
              className="absolute -bottom-4 right-6 z-10 inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-indigo-400/25 bg-[linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.14))] px-3.5 py-2 text-[11px] font-semibold tracking-[0.02em] text-indigo-100 shadow-[0_12px_30px_rgba(79,70,229,0.24)] backdrop-blur-xl"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2.2, type: "spring", stiffness: 200 }}
            >
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              12 Suggestions
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll hint */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-600"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.5 }}
      >
        <span className="text-[11px] uppercase tracking-widest">Scroll</span>
        <div className="w-4 h-7 rounded-full border border-white/10 flex items-start justify-center py-1">
          <motion.div
            className="w-1 h-2 bg-indigo-400 rounded-full"
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
