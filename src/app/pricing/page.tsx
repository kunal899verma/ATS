import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/layout/Footer";
import {
  CheckCircle2, XCircle, Zap, ArrowRight, Star, Shield,
  BarChart3, Brain, Target, FileSearch, Sparkles, FileText,
  MessageSquare, LayoutTemplate, Users,
} from "lucide-react";
import type { Metadata } from "next";
import { FadeIn } from "@/components/ui/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/ui/StaggerGroup";
import { GlowCard } from "@/components/ui/GlowCard";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";

export const metadata: Metadata = {
  title: "ResumeATS Pricing — 100% Free ATS Resume Checker | ResumeATS",
  description: "ResumeATS is completely free — unlimited ATS analyses, AI cover letters, interview prep, and resume building. See how we compare to Jobscan ($49/month) and others.",
};

const FREE_FEATURES = [
  { icon: BarChart3, text: "Unlimited ATS analyses" },
  { icon: Brain, text: "Synonym-aware keyword matching" },
  { icon: Target, text: "Recruiter Readability Score" },
  { icon: FileText, text: "AI Cover Letter Generator" },
  { icon: MessageSquare, text: "AI Interview Prep" },
  { icon: Sparkles, text: "AI Resume Coach Chat" },
  { icon: LayoutTemplate, text: "8 ATS-optimized templates" },
  { icon: Users, text: "Batch recruiter analysis" },
  { icon: FileSearch, text: "6-dimension score breakdown" },
  { icon: Shield, text: "Clear saved browser data anytime" },
];

const COMPARISON = [
  { feature: "ATS Score", us: true, jobscan: true, resumeWorded: true, teal: true },
  { feature: "AI Cover Letter Generator", us: true, jobscan: false, resumeWorded: false, teal: true },
  { feature: "AI Interview Prep", us: true, jobscan: false, resumeWorded: false, teal: false },
  { feature: "AI Resume Coach", us: true, jobscan: false, resumeWorded: false, teal: false },
  { feature: "Synonym-aware matching", us: true, jobscan: false, resumeWorded: false, teal: false },
  { feature: "Recruiter readability score", us: true, jobscan: false, resumeWorded: false, teal: false },
  { feature: "Resume Builder + PDF", us: true, jobscan: false, resumeWorded: true, teal: true },
  { feature: "Batch recruiter analysis", us: true, jobscan: false, resumeWorded: false, teal: false },
  { feature: "Career intelligence", us: true, jobscan: false, resumeWorded: false, teal: false },
  { feature: "No account required", us: true, jobscan: false, resumeWorded: false, teal: false },
  { feature: "Completely free", us: true, jobscan: false, resumeWorded: false, teal: false },
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
    text: "The recruiter readability score alone is worth more than anything Jobscan gives me. And the AI cover letter generator? Game changer.",
    stars: 5,
  },
];

export default function PricingPage() {
  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-15 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
        <FloatingOrbs count={4} />

        {/* Header */}
        <FadeIn>
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-6">
              <Zap className="w-3 h-3" />
              Always free. No credit card. No account.
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Premium Features.{" "}
              <span className="gradient-text">Zero Price Tag.</span>
            </h1>
            <p className="text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Job searching is already hard enough. Resume tools shouldn&apos;t cost $50/month.
              ResumeATS is free — not a &quot;freemium&quot; with 3 free scans. Actually free.
            </p>
          </div>
        </FadeIn>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5 mb-16">

          {/* ResumeATS */}
          <div className="sm:col-span-2 md:col-span-1 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-[11px] font-bold shadow-lg shadow-indigo-500/30">
                <Star className="w-3 h-3 fill-white" /> BEST VALUE
              </div>
            </div>
            <FadeIn delay={0.2}>
              <GlowCard glow="indigo">
                <div className="glass-card border border-indigo-500/30 p-7 h-full relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-violet-500/5 pointer-events-none" />
                  <div className="relative">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                        <Zap className="w-3.5 h-3.5 text-white" />
                      </div>
                      <span className="text-white font-bold text-lg">ResumeATS</span>
                    </div>
                    <div className="mt-4 mb-6">
                      <span className="text-5xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>$0</span>
                      <span className="text-slate-400 text-sm ml-2">/ forever</span>
                    </div>
                    <StaggerGroup stagger={0.05}>
                      <ul className="space-y-2.5 mb-8">
                        {FREE_FEATURES.map((f) => {
                          const Icon = f.icon;
                          return (
                            <StaggerItem key={f.text}>
                              <li className="flex items-start gap-2.5 text-sm text-slate-300">
                                <Icon className="w-4 h-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                                {f.text}
                              </li>
                            </StaggerItem>
                          );
                        })}
                      </ul>
                    </StaggerGroup>
                    <Link
                      href="/analyze"
                      className="btn-primary w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold"
                    >
                      Start Free Analysis
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </GlowCard>
            </FadeIn>
          </div>

          {/* Competitors */}
          <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-5">
            {[
              { name: "Jobscan", sub: "Most popular paid tool", price: "$49", period: "/ month", yearly: "$588 / year",
                items: ["ATS score", "Keyword matching (exact only)", "Limited free scans", "Account required", "No AI features", "No recruiter score"] },
              { name: "Teal", sub: "Job tracker + resume", price: "$9", period: "/ month", yearly: "$108 / year",
                items: ["Basic ATS score", "AI cover letter", "Resume builder", "Account required", "No synonym matching", "No recruiter readability"] },
            ].map((comp) => (
              <div key={comp.name} className="glass-card border border-white/[0.06] p-6 opacity-60">
                <span className="text-slate-300 font-bold text-lg">{comp.name}</span>
                <p className="text-slate-500 text-xs mb-4">{comp.sub}</p>
                <div className="mt-3 mb-5">
                  <span className="text-4xl font-black text-slate-300">{comp.price}</span>
                  <span className="text-slate-500 text-sm ml-1">{comp.period}</span>
                </div>
                <ul className="space-y-2 mb-6 text-sm text-slate-500">
                  {comp.items.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <XCircle className="w-4 h-4 text-slate-600 flex-shrink-0 mt-0.5" />
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="w-full text-center py-2.5 rounded-xl border border-white/[0.06] text-slate-600 text-sm">
                  {comp.yearly}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feature comparison table */}
        <FadeIn delay={0.1}>
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-white mb-6 text-center" style={{ fontFamily: 'var(--font-display)' }}>Full Feature Comparison</h2>
            <div className="glass-card border border-white/[0.06] overflow-x-auto">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="p-3 sm:p-4 text-left w-[36%]">Feature</th>
                    <th className="p-3 sm:p-4 text-center text-indigo-400">ResumeATS</th>
                    <th className="p-3 sm:p-4 text-center">Jobscan</th>
                    <th className="p-3 sm:p-4 text-center">ResumeWorded</th>
                    <th className="p-3 sm:p-4 text-center">Teal</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`text-xs sm:text-sm ${i < COMPARISON.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}
                    >
                      <td className="p-3 sm:p-4 text-slate-300">{row.feature}</td>
                      <td className="p-3 sm:p-4 text-center">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" />
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.jobscan ? <CheckCircle2 className="w-4 h-4 text-slate-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400/40 mx-auto" />}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.resumeWorded ? <CheckCircle2 className="w-4 h-4 text-slate-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400/40 mx-auto" />}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.teal ? <CheckCircle2 className="w-4 h-4 text-slate-500 mx-auto" /> : <XCircle className="w-4 h-4 text-red-400/40 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-500/[0.04] border-t border-indigo-500/15">
                    <td className="p-3 sm:p-4 text-slate-400 text-xs font-semibold">Price</td>
                    <td className="p-3 sm:p-4 text-center text-indigo-400 text-xs font-bold">FREE</td>
                    <td className="p-3 sm:p-4 text-center text-slate-500 text-xs">$49/mo</td>
                    <td className="p-3 sm:p-4 text-center text-slate-500 text-xs">$29/mo</td>
                    <td className="p-3 sm:p-4 text-center text-slate-500 text-xs">$9/mo</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </FadeIn>

        {/* Why free? */}
        <FadeIn>
          <div className="glass-card border border-violet-500/15 bg-violet-500/[0.02] p-7 mb-16">
            <h2 className="text-xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>Why is this free?</h2>
            <div className="space-y-3 text-slate-400 text-[15px] leading-relaxed">
              <p>
                Hiring is already a rigged game — companies spend thousands on ATS software to filter candidates,
                while job seekers spend hundreds on tools just to understand those filters.
              </p>
              <p>
                We built ResumeATS because the tools that should exist — honest scoring, smart matching,
                AI-powered improvements — shouldn&apos;t cost $50/month. Job searching is stressful enough.
              </p>
              <p className="text-slate-300 font-medium">
                We believe job seekers shouldn&apos;t pay to fix their resumes. Zero ads. Zero selling your data.
                Your resume is analyzed server-side, and the latest results can be saved locally in your browser so other tools can reuse them.
                You stay in control and can clear that browser data anytime.
              </p>
            </div>
          </div>
        </FadeIn>

        {/* Testimonials */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold text-white mb-8 text-center" style={{ fontFamily: 'var(--font-display)' }}>What people say about switching</h2>
          <StaggerGroup>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {TESTIMONIALS.map((t) => (
                <StaggerItem key={t.name}>
                  <div className="glass-card p-6 border border-white/[0.06]">
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
                </StaggerItem>
              ))}
            </div>
          </StaggerGroup>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Ready to check your resume?</h2>
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

      <Footer />
    </main>
  );
}
