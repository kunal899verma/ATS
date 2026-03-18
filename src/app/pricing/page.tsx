import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import {
  CheckCircle2, XCircle, Zap, ArrowRight, Star, Shield,
  BarChart3, Brain, Target, FileSearch, Sparkles,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing — ResumeATS Free ATS Resume Checker",
  description: "ResumeATS is completely free — unlimited resume analyses, no account required. See how we compare to Jobscan ($49/month) and ResumeWorded ($19–49/month).",
};

const FREE_FEATURES = [
  { icon: BarChart3, text: "Unlimited ATS analyses" },
  { icon: Brain, text: "Synonym-aware keyword matching" },
  { icon: Target, text: "Recruiter Readability Score (unique)" },
  { icon: FileSearch, text: "6-dimension score breakdown" },
  { icon: Sparkles, text: "Prioritized fix list with effort estimates" },
  { icon: Shield, text: "Zero data retention — your resume is never stored" },
  { icon: Zap, text: "PDF, DOCX, TXT or paste text" },
  { icon: CheckCircle2, text: "No account or credit card needed" },
];

const COMPARISON = [
  { feature: "ATS Score", us: true, jobscan: true, resumeWorded: true },
  { feature: "Keyword matching", us: true, jobscan: true, resumeWorked: true },
  { feature: "Synonym-aware matching", us: true, jobscan: false, resumeWorded: false },
  { feature: "Recruiter readability score", us: true, jobscan: false, resumeWorded: false },
  { feature: "Section-by-section scoring", us: true, jobscan: true, resumeWorded: true },
  { feature: "Prioritized fix list", us: true, jobscan: true, resumeWorded: false },
  { feature: "Paste text mode (no upload)", us: true, jobscan: false, resumeWorded: false },
  { feature: "Score history", us: true, jobscan: false, resumeWorded: false },
  { feature: "Share results", us: true, jobscan: false, resumeWorded: false },
  { feature: "Print / export report", us: true, jobscan: false, resumeWorded: true },
  { feature: "No account required", us: true, jobscan: false, resumeWorded: false },
  { feature: "Completely free", us: true, jobscan: false, resumeWorded: false },
];

const TESTIMONIALS = [
  {
    name: "Aisha R.",
    role: "Senior Software Engineer",
    text: "I was paying $50/month for Jobscan. This does the same thing — actually better because of the synonym matching — for free.",
    stars: 5,
  },
  {
    name: "Marcus T.",
    role: "Product Manager",
    text: "The recruiter readability score alone is worth more than anything Jobscan gives me. Why is this free?",
    stars: 5,
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-6">
            <Zap className="w-3 h-3" />
            Always free. No credit card. No account.
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Built to level the{" "}
            <span className="gradient-text">playing field.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
            Job searching is already hard enough. Resume tools shouldn&apos;t cost $50/month.
            ResumeATS is free — not a &quot;freemium&quot; with 3 free scans. Actually free.
          </p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">

          {/* ResumeATS */}
          <div className="md:col-span-1 relative">
            {/* "Best Value" badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-[11px] font-bold shadow-lg shadow-cyan-500/30">
                <Star className="w-3 h-3 fill-white" /> BEST VALUE
              </div>
            </div>
            <div className="glass rounded-2xl border border-cyan-500/30 p-7 h-full relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 pointer-events-none" />
              <div className="relative">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
                    <Zap className="w-3.5 h-3.5 text-white" />
                  </div>
                  <span className="text-white font-bold text-lg">ResumeATS</span>
                </div>
                <div className="mt-4 mb-6">
                  <span className="text-5xl font-black text-white">$0</span>
                  <span className="text-slate-400 text-sm ml-2">/ forever</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {FREE_FEATURES.map((f) => {
                    const Icon = f.icon;
                    return (
                      <li key={f.text} className="flex items-start gap-2.5 text-sm text-slate-300">
                        <Icon className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                        {f.text}
                      </li>
                    );
                  })}
                </ul>
                <Link
                  href="/analyze"
                  className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                >
                  Start Free Analysis
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>

          {/* Competitors column */}
          <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Jobscan */}
            <div className="glass rounded-2xl border border-white/6 p-6 opacity-60">
              <div className="mb-1">
                <span className="text-slate-300 font-bold text-lg">Jobscan</span>
              </div>
              <p className="text-slate-500 text-xs mb-4">Most popular paid tool</p>
              <div className="mt-3 mb-5">
                <span className="text-4xl font-black text-slate-300">$49</span>
                <span className="text-slate-500 text-sm ml-1">/ month</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm text-slate-500">
                {[
                  "ATS score",
                  "Keyword matching (exact only)",
                  "Limited free scans",
                  "Account required",
                  "No recruiter score",
                  "No synonym matching",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="w-full text-center py-2.5 rounded-xl border border-white/8 text-slate-600 text-sm">
                $588 / year
              </div>
            </div>

            {/* ResumeWorded */}
            <div className="glass rounded-2xl border border-white/6 p-6 opacity-60">
              <div className="mb-1">
                <span className="text-slate-300 font-bold text-lg">ResumeWorded</span>
              </div>
              <p className="text-slate-500 text-xs mb-4">AI-focused competitor</p>
              <div className="mt-3 mb-5">
                <span className="text-4xl font-black text-slate-300">$19</span>
                <span className="text-slate-500 text-sm ml-1">– $49 / month</span>
              </div>
              <ul className="space-y-2 mb-6 text-sm text-slate-500">
                {[
                  "ATS score + tips",
                  "Section-by-section scoring",
                  "3 free scans only",
                  "Account required",
                  "No synonym matching",
                  "No recruiter readability",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-2">
                    <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="w-full text-center py-2.5 rounded-xl border border-white/8 text-slate-600 text-sm">
                Up to $588 / year
              </div>
            </div>
          </div>
        </div>

        {/* Feature comparison table */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Full Feature Comparison</h2>
          <div className="glass rounded-2xl border border-white/8 overflow-hidden">
            <div className="grid grid-cols-4 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <div className="p-4 col-span-2">Feature</div>
              <div className="p-4 text-center text-cyan-400">ResumeATS</div>
              <div className="p-4 text-center">Competitors</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 text-sm ${i < COMPARISON.length - 1 ? "border-b border-white/4" : ""} hover:bg-white/2 transition-colors`}
              >
                <div className="p-4 col-span-2 text-slate-300">{row.feature}</div>
                <div className="p-4 flex justify-center">
                  {row.us ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400/50" />
                  )}
                </div>
                <div className="p-4 flex justify-center">
                  {(row.jobscan || row.resumeWorded) ? (
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-400/50" />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Why free? */}
        <div className="glass rounded-2xl border border-violet-500/15 bg-violet-500/3 p-7 mb-16">
          <h2 className="text-xl font-bold text-white mb-3">Why is this free?</h2>
          <div className="space-y-3 text-slate-400 text-[15px] leading-relaxed">
            <p>
              Hiring is already a rigged game — companies spend thousands on ATS software to filter candidates,
              while job seekers spend hundreds on tools just to understand those filters.
            </p>
            <p>
              We built ResumeATS because the tools that should exist — honest scoring, smart matching,
              real feedback — shouldn&apos;t cost $50/month. Job searching is stressful enough.
            </p>
            <p className="text-slate-300 font-medium">
              Zero ads. Zero tracking. Your resume data is processed in memory and immediately discarded.
              No account. No credit card. No catch.
            </p>
          </div>
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center">What people say about switching</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 border border-white/6">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-slate-300 text-sm leading-relaxed mb-4">&quot;{t.text}&quot;</p>
                <div>
                  <p className="text-white text-sm font-medium">{t.name}</p>
                  <p className="text-slate-500 text-xs">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Ready to check your resume?</h2>
          <p className="text-slate-400 mb-8">No account. No credit card. Results in 5 seconds.</p>
          <Link
            href="/analyze"
            className="btn-primary inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold group"
          >
            Analyze My Resume Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-slate-400 text-sm font-medium">Resume<span className="text-cyan-400">ATS</span></span>
          </div>
          <p className="text-slate-600 text-xs text-center">Built to level the playing field. Your resume data is never stored.</p>
          <div className="flex gap-6 text-slate-600 text-xs">
            <Link href="/analyze" className="hover:text-slate-400 transition-colors">Analyze Resume</Link>
            <Link href="/tips" className="hover:text-slate-400 transition-colors">ATS Tips</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
