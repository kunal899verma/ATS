"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap } from "lucide-react";
import ParticleCanvas from "./ParticleCanvas";

const STATS = [
  { value: "25+", label: "Scoring factors" },
  { value: "<5s", label: "Analysis time" },
  { value: "100%", label: "Free forever" },
  { value: "No", label: "Account needed" },
];

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
  { label: "Keywords", pct: 91, color: "from-cyan-400 to-cyan-500" },
  { label: "Skills",   pct: 88, color: "from-violet-400 to-violet-500" },
  { label: "Formatting", pct: 84, color: "from-pink-400 to-pink-500" },
  { label: "Recruiter", pct: 80, color: "from-amber-400 to-amber-500" },
];

const QUICK_WINS = [
  "Add 'TypeScript' to skills section",
  "Quantify impact in 2nd bullet point",
  "Missing LinkedIn URL in contact",
];

export default function AnimatedHeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      <ParticleCanvas />
      <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/3 -right-20 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

          {/* Left: text */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center lg:text-left"
          >
            {/* Badge */}
            <motion.div variants={item} className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-8">
              <Zap className="w-3 h-3" />
              Free · Instant · No Account Required
            </motion.div>

            {/* Headline */}
            <motion.h1 variants={item} className="text-4xl sm:text-5xl lg:text-[68px] font-bold text-white leading-[1.1] tracking-tight mb-6">
              Your Resume Has{" "}
              <span className="gradient-text">7 Seconds.</span>
              <br />
              Make Them Count.
            </motion.h1>

            <motion.p variants={item} className="text-slate-400 text-lg sm:text-xl max-w-xl mx-auto lg:mx-0 mb-10 leading-relaxed">
              Most resumes never reach a human. Our ATS analyzer tells you exactly why yours isn&apos;t
              getting callbacks — and gives you a prioritized fix list to change that.
            </motion.p>

            {/* CTAs */}
            <motion.div variants={item} className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-12">
              <Link href="/analyze" className="btn-primary flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-base group w-full sm:w-auto">
                Analyze My Resume Free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <div className="flex flex-col sm:flex-row items-center gap-3 text-slate-500 text-sm">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  PDF, DOCX, or paste text
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Results in 5 seconds
                </span>
              </div>
            </motion.div>

            {/* Stats */}
            <motion.div variants={item} className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto lg:mx-0">
              {STATS.map((s) => (
                <div key={s.label} className="glass rounded-xl p-3.5 text-center border border-white/5">
                  <div className="text-xl font-bold text-white leading-none mb-1">{s.value}</div>
                  <div className="text-slate-500 text-xs">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: mockup card */}
          <motion.div
            className="hidden lg:block relative"
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: EASE }}
          >
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-500/10 to-violet-500/10 rounded-3xl blur-2xl" />

            <motion.div
              className="relative glass rounded-2xl border border-white/10 p-5 shadow-2xl"
              whileHover={{ scale: 1.02, borderColor: "rgba(6,182,212,0.3)" }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-white text-sm font-semibold">Sarah M.</p>
                  <p className="text-slate-400 text-xs">Senior Software Engineer</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-black text-white leading-none">87</div>
                  <div className="text-xs text-emerald-400 font-medium">Grade A</div>
                </div>
              </div>

              {/* Score bar */}
              <div className="h-2 bg-white/5 rounded-full mb-5 overflow-hidden">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
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
                    <span className="text-slate-300 text-xs w-8 text-right">{pct}%</span>
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
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 mt-1.5 flex-shrink-0" />
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
              ✓ ATS Ready
            </motion.div>

            <motion.div
              className="absolute -bottom-3 -left-3 glass border border-white/10 text-xs px-3 py-1.5 rounded-full text-slate-300"
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 2, type: "spring", stiffness: 200 }}
            >
              📄 Analyzed in 3.2s
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
            className="w-1 h-2 bg-cyan-400 rounded-full"
            animate={{ y: [0, 4, 0] }}
            transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
