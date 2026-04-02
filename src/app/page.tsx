import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import AnimatedHeroSection from "@/components/ui/AnimatedHeroSection";
import { FadeIn } from "@/components/ui/FadeIn";
import { StaggerGroup, StaggerItem } from "@/components/ui/StaggerGroup";
import { GlowCard } from "@/components/ui/GlowCard";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";
import { MarqueeBar } from "@/components/ui/MarqueeBar";
import Footer from "@/components/layout/Footer";
import {
  ArrowRight, CheckCircle2, Target,
  FileSearch, Brain, TrendingUp, Star, AlertTriangle, Users, Clock, Shield,
  FileText, Sparkles, Eye,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ResumeATS — Free AI Resume Checker, Cover Letter Generator & ATS Score Analyzer",
  description:
    "Check your resume's ATS score instantly. AI-powered keyword analysis, cover letter generation, interview prep, recruiter readability — free, no account required.",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    icon: AlertTriangle,
    stat: "75%",
    title: "Rejected before a human sees them",
    desc: "ATS systems rank and filter resumes automatically. A resume that scores low on keyword alignment never reaches a recruiter.",
    color: "text-red-400",
    bg: "bg-red-500/5",
    border: "border-red-500/15",
  },
  {
    icon: Target,
    stat: "6s",
    title: "That's all a recruiter spends on first review",
    desc: "If your resume isn't structured for instant scanning — clear sections, bullet points, relevant keywords — it gets skipped.",
    color: "text-amber-400",
    bg: "bg-amber-500/5",
    border: "border-amber-500/15",
  },
  {
    icon: Users,
    stat: "250+",
    title: "Applicants per role on average",
    desc: "You're competing against hundreds of candidates who tailored their resume to the specific job description.",
    color: "text-violet-400",
    bg: "bg-violet-500/5",
    border: "border-violet-500/15",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "ATS Score Analysis",
    desc: "25+ factors analyzed in seconds. Synonym-aware keyword matching, section scoring, and formatting checks.",
    color: "text-indigo-400",
    border: "border-indigo-500/15",
    glow: "indigo" as const,
  },
  {
    icon: Sparkles,
    title: "AI Resume Rewriter",
    desc: "AI rewrites weak bullet points into powerful, quantified achievement statements.",
    color: "text-violet-400",
    border: "border-violet-500/15",
    glow: "violet" as const,
  },
  {
    icon: Target,
    title: "Keyword Intelligence",
    desc: "Match your resume to any job description. Find missing keywords and get natural integration suggestions.",
    color: "text-emerald-400",
    border: "border-emerald-500/15",
    glow: "emerald" as const,
  },
  {
    icon: Eye,
    title: "Recruiter Readability",
    desc: "See your resume through a recruiter's eyes. Clarity, impact, authenticity, and relevance scoring.",
    color: "text-amber-400",
    border: "border-amber-500/15",
    glow: "amber" as const,
  },
  {
    icon: FileSearch,
    title: "Resume Builder",
    desc: "8 ATS-optimized templates with drag-and-drop editing, AI content suggestions, and proper PDF export.",
    color: "text-cyan-400",
    border: "border-cyan-500/15",
    glow: "cyan" as const,
  },
  {
    icon: TrendingUp,
    title: "Career Intelligence",
    desc: "Role detection, skill gap analysis, growth paths, and salary insights powered by AI.",
    color: "text-pink-400",
    border: "border-pink-500/15",
    glow: "pink" as const,
  },
];

const CORE_FLOW = [
  {
    href: "/analyze",
    title: "1. Analyze your resume",
    description: "Start with ATS score, keyword gaps, recruiter readability, and a prioritized fix list.",
    accent: "border-indigo-500/20 bg-indigo-500/[0.04] text-indigo-300",
  },
  {
    href: "/cover-letter",
    title: "2. Tailor for the role",
    description: "Reuse your latest resume and job description to generate a stronger, targeted application package.",
    accent: "border-violet-500/20 bg-violet-500/[0.04] text-violet-300",
  },
  {
    href: "/interview-prep",
    title: "3. Practice the interview",
    description: "Turn the same resume and target role into likely questions, answer structures, and prep material.",
    accent: "border-emerald-500/20 bg-emerald-500/[0.04] text-emerald-300",
  },
  {
    href: "/templates",
    title: "4. Rebuild and recheck",
    description: "Apply the fixes, export a cleaner version, and come back to compare your score against the previous draft.",
    accent: "border-amber-500/20 bg-amber-500/[0.04] text-amber-300",
  },
];

const TRUST_PILLARS = [
  "Honest scoring methodology",
  "Local browser save controls",
  "AI suggestions clearly separated from scored checks",
];

const STEPS = [
  { num: "01", title: "Upload or paste your resume", desc: "Drop a PDF/DOCX or paste your resume text directly. No account, no friction.", numColor: "text-indigo-400", border: "border-indigo-500/15" },
  { num: "02", title: "Get your full ATS analysis", desc: "ATS score, keyword gaps, section scores, recruiter readability, and a prioritized fix list.", numColor: "text-violet-400", border: "border-violet-500/15" },
  { num: "03", title: "Fix and recheck", desc: "Apply the prioritized suggestions, re-upload your resume, and watch your score climb.", numColor: "text-emerald-400", border: "border-emerald-500/15" },
];

const HIRED_AT = ["Google", "Amazon", "Microsoft", "Meta", "Apple", "Stripe", "Netflix", "Spotify", "Uber", "Airbnb"];

const TESTIMONIALS = [
  {
    name: "Aisha R.",
    role: "Senior Software Engineer",
    company: "FAANG",
    text: "I was applying for 3 months with zero callbacks. Used this tool, found out my resume was missing 14 keywords the JD required. Fixed it in an hour. Three recruiter calls the next week.",
    stars: 5,
    score: { from: 31, to: 84 },
  },
  {
    name: "Marcus T.",
    role: "Product Manager",
    company: "Series B Startup",
    text: "Jobscan charged me $50/month to tell me my score was 60%. This tool told me the same thing, free, with better suggestions. The recruiter readability score is genius.",
    stars: 5,
    score: { from: 58, to: 91 },
  },
  {
    name: "Priya N.",
    role: "Data Scientist",
    company: "Fortune 500",
    text: "The synonym matching is what won me over. My resume said 'ML' everywhere — the job said 'Machine Learning'. Other tools flagged it as missing. This one correctly matched it.",
    stars: 5,
    score: { from: 47, to: 88 },
  },
];

const VS_COMPARISON = [
  { feature: "Always free, unlimited scans", us: true, jobscan: false, resumeworded: false, teal: false },
  { feature: "No account required", us: true, jobscan: false, resumeworded: false, teal: false },
  { feature: "AI Cover Letter Generator", us: true, jobscan: false, resumeworded: false, teal: true },
  { feature: "AI Interview Prep", us: true, jobscan: false, resumeworded: false, teal: false },
  { feature: "Recruiter readability score", us: true, jobscan: false, resumeworded: false, teal: false },
  { feature: "Synonym + stemmed matching", us: true, jobscan: true, resumeworded: false, teal: false },
  { feature: "AI Resume Coach Chat", us: true, jobscan: false, resumeworded: false, teal: false },
  { feature: "Career intelligence insights", us: true, jobscan: false, resumeworded: false, teal: false },
  { feature: "Resume Builder + PDF export", us: true, jobscan: false, resumeworded: true, teal: true },
  { feature: "Batch recruiter analysis", us: true, jobscan: false, resumeworded: false, teal: false },
];

const AI_EXAMPLES = [
  {
    before: "Responsible for managing a team of developers and ensuring project deadlines were met.",
    after: "Led a team of 8 engineers, delivering 12 product features on time and reducing sprint cycle time by 23% through agile workflow optimization.",
  },
  {
    before: "Worked on improving the company website to make it faster.",
    after: "Optimized web application performance, reducing page load time from 4.2s to 1.1s and improving Core Web Vitals scores by 67%, resulting in a 15% increase in organic traffic.",
  },
  {
    before: "Helped with customer service and handled complaints.",
    after: "Resolved 200+ customer escalations monthly with a 96% satisfaction rate, implementing a new ticketing workflow that reduced average resolution time by 40%.",
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ResumeATS",
    url: "https://resumeats.app",
    description: "Free AI-powered ATS resume checker with cover letter generation, interview prep, and career intelligence.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main id="main-content" className="flex flex-col min-h-screen bg-[var(--bg-primary)]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <AnimatedHeroSection />

      {/* ── Hired At Bar ──────────────────────────────────────────────────────── */}
      <section className="border-y border-white/[0.04] py-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <MarqueeBar items={HIRED_AT} />
        </div>
      </section>

      {/* ── Problem Section ───────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-red-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">The Real Problem</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Why your resume isn&apos;t working
              </h2>
              <p className="text-slate-400 max-w-lg mx-auto">
                It&apos;s probably not your experience — it&apos;s how your resume presents it.
              </p>
            </div>
          </FadeIn>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PAIN_POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <StaggerItem key={p.title}>
                  <GlowCard glow="indigo" tilt className={`glass-card p-6 border ${p.border} ${p.bg}`}>
                    <div className={`text-4xl font-black ${p.color} mb-3`} style={{ fontFamily: 'var(--font-display)' }}>{p.stat}</div>
                    <h3 className="text-white font-semibold mb-2 leading-snug">{p.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                    <Icon className={`w-5 h-5 ${p.color} mt-4 opacity-40`} />
                  </GlowCard>
                </StaggerItem>
              );
            })}
          </StaggerGroup>

          <FadeIn delay={0.3}>
            <div className="mt-8 text-center">
              <p className="text-slate-500 text-sm">
                The good news: all three problems are fixable in under an hour with the right feedback.
              </p>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-30" />
        <FloatingOrbs count={3} />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-indigo-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">3 Steps, Under 2 Minutes</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>How it works</h2>
            </div>
          </FadeIn>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6" delay={0.1}>
            {STEPS.map((step, i) => (
              <StaggerItem key={step.num}>
                <div className="relative">
                  {i < STEPS.length - 1 && (
                    <div className="hidden md:block absolute top-10 left-[calc(100%-12px)] w-[calc(100%-100%+88px)] h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
                  )}
                  <div className={`glass-card p-6 border ${step.border} hover:scale-[1.02] transition-transform duration-300 cursor-default`}>
                    <div className={`text-5xl font-black ${step.numColor} opacity-20 mb-4 leading-none`} style={{ fontFamily: 'var(--font-display)' }}>
                      {step.num}
                    </div>
                    <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>

          <div className="mt-10 text-center">
            <Link href="/analyze" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl font-semibold">
              Start Free Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-violet-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">One Core Workflow</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Start with ATS analysis. Then move forward with confidence.
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                ResumeATS works best as one connected application workflow: diagnose issues, fix the resume, tailor the application, and practice the interview.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <div className="glass-card border border-white/[0.06] p-5 sm:p-6 mb-6">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500 mb-1">Recommended path</p>
                  <h3 className="text-white text-lg font-semibold">Use the product like a workflow, not a pile of tools</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {TRUST_PILLARS.map((item) => (
                    <span key={item} className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] px-3 py-1.5 text-xs text-slate-300">
                      <Shield className="h-3.5 w-3.5 text-cyan-400" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-10">
            {CORE_FLOW.map((step) => (
              <Link
                key={step.href}
                href={step.href}
                className="glass-card group border border-white/[0.06] p-5 transition-all hover:border-white/[0.12]"
              >
                <div className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${step.accent}`}>
                  Step
                </div>
                <h3 className="mt-4 text-white font-semibold leading-snug">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-400">{step.description}</p>
                <div className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-300 transition-colors group-hover:text-white">
                  Open
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            ))}
          </div>

          <StaggerGroup className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" stagger={0.08}>
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <StaggerItem key={feat.title}>
                  <GlowCard glow={feat.glow} tilt className={`glass-card p-6 border ${feat.border} group cursor-default h-full`}>
                    <div className={`w-10 h-10 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-4 ${feat.color} group-hover:scale-110 transition-transform`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="text-white font-semibold mb-2">{feat.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                  </GlowCard>
                </StaggerItem>
              );
            })}
          </StaggerGroup>

          {/* Cover Letter CTA — full width highlighted card */}
          <FadeIn delay={0.3}>
            <div className="mt-6">
              <GlowCard glow="violet" tilt className="glass-card p-6 sm:p-8 border border-violet-500/20 bg-violet-500/[0.03] group cursor-pointer">
                <Link href="/cover-letter" className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg mb-1" style={{ fontFamily: 'var(--font-display)' }}>
                      AI Cover Letter Generator
                    </h3>
                    <p className="text-slate-400 text-sm">
                      Paste a job description, get a tailored, ATS-optimized cover letter in 30 seconds. Powered by AI.
                    </p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-indigo-400 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                </Link>
              </GlowCard>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── AI Showcase ──────────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(99,102,241,0.06),transparent)]" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-indigo-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">AI-Powered</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                Powered by AI — Not Just Keywords
              </h2>
              <p className="text-slate-400 max-w-xl mx-auto">
                Unlike other tools, we use advanced AI to understand context, quantify achievements, and suggest impactful rewrites.
              </p>
            </div>
          </FadeIn>

          <StaggerGroup className="space-y-4">
            {AI_EXAMPLES.map((ex, i) => (
              <StaggerItem key={i}>
                <div className="glass-card p-5 sm:p-6 border border-white/[0.06]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-red-500/[0.04] border border-red-500/10">
                      <p className="text-red-400 text-xs font-semibold mb-2 uppercase tracking-wider">Before</p>
                      <p className="text-slate-400 text-sm leading-relaxed">{ex.before}</p>
                    </div>
                    <div className="p-4 rounded-xl bg-emerald-500/[0.04] border border-emerald-500/10">
                      <p className="text-emerald-400 text-xs font-semibold mb-2 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3 h-3" /> AI-Improved
                      </p>
                      <p className="text-slate-300 text-sm leading-relaxed">{ex.after}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── Scoring Transparency ─────────────────────────────────────────────── */}
      <section className="relative py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up" delay={0.1}>
            <div className="glass-card border border-amber-500/15 bg-amber-500/[0.02] p-5 sm:p-8 lg:p-10">
              <div className="flex flex-col sm:flex-row gap-5 sm:gap-6 items-start">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-lg mb-2" style={{ fontFamily: 'var(--font-display)' }}>
                    Honest about what ATS scores actually mean
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4">
                    No tool — including ours — gives you a real ATS score. What we give you is a calibrated proxy based on 25+ factors that correlate with recruiter approval and callback rates.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { title: "What we actually check", desc: "Keyword density, synonym coverage, section completeness, bullet quality, contact data, formatting hygiene — 25+ measurable signals." },
                      { title: "What no tool can check", desc: "Real ATS ranking logic. Any tool claiming a Workday score or Greenhouse match % is guessing." },
                      { title: "Why it still works", desc: "The signals that produce high scores here are the same ones that move you up in any ATS." },
                    ].map(({ title, desc }) => (
                      <div key={title} className="bg-white/[0.03] rounded-xl p-4 border border-white/[0.05]">
                        <p className="text-white text-xs font-semibold mb-1.5">{title}</p>
                        <p className="text-slate-400 text-xs leading-relaxed">{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/[0.03] to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <p className="text-pink-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Honest Comparison</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                We vs. the paid alternatives
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.2}>
            <div className="glass-card border border-white/[0.06] overflow-x-auto">
              <table className="w-full min-w-[540px]">
                <thead>
                  <tr className="border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                    <th className="p-3 sm:p-4 text-left w-[38%]">Feature</th>
                    <th className="p-3 sm:p-4 text-center text-indigo-400">ResumeATS</th>
                    <th className="p-3 sm:p-4 text-center">Jobscan</th>
                    <th className="p-3 sm:p-4 text-center">ResumeWorded</th>
                    <th className="p-3 sm:p-4 text-center">Teal</th>
                  </tr>
                </thead>
                <tbody>
                  {VS_COMPARISON.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={`text-xs sm:text-sm ${i < VS_COMPARISON.length - 1 ? "border-b border-white/[0.04]" : ""} hover:bg-white/[0.02] transition-colors`}
                    >
                      <td className="p-3 sm:p-4 text-slate-300">{row.feature}</td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.us ? <CheckCircle2 className="w-4 h-4 text-emerald-400 mx-auto" /> : <span className="text-slate-600">—</span>}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.jobscan ? <CheckCircle2 className="w-4 h-4 text-slate-500 mx-auto" /> : <span className="text-red-500/60 text-sm">✗</span>}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.resumeworded ? <CheckCircle2 className="w-4 h-4 text-slate-500 mx-auto" /> : <span className="text-red-500/60 text-sm">✗</span>}
                      </td>
                      <td className="p-3 sm:p-4 text-center">
                        {row.teal ? <CheckCircle2 className="w-4 h-4 text-slate-500 mx-auto" /> : <span className="text-red-500/60 text-sm">✗</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-indigo-500/[0.04] border-t border-indigo-500/15">
                    <td className="p-3 sm:p-4 text-slate-400 text-xs font-semibold">Price</td>
                    <td className="p-3 sm:p-4 text-center text-indigo-400 text-xs font-bold">FREE</td>
                    <td className="p-3 sm:p-4 text-center text-slate-500 text-xs">$49.95/mo</td>
                    <td className="p-3 sm:p-4 text-center text-slate-500 text-xs">$29/mo</td>
                    <td className="p-3 sm:p-4 text-center text-slate-500 text-xs">$9/mo</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-14">
              <p className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Real Results</p>
              <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
                From &quot;no callbacks&quot; to &quot;3 interviews this week&quot;
              </h2>
            </div>
          </FadeIn>

          <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <StaggerItem key={t.name}>
                <div className="glass-card p-6 border border-white/[0.06] hover:border-white/[0.1] transition-colors flex flex-col h-full">
                  <div className="flex gap-0.5 mb-4">
                    {Array.from({ length: t.stars }).map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    ))}
                  </div>

                  <div className="flex items-center gap-2 mb-4 text-xs">
                    <span className="px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                      {t.score.from}
                    </span>
                    <ArrowRight className="w-3 h-3 text-slate-600" />
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                      {t.score.to}
                    </span>
                    <span className="text-slate-500">ATS score</span>
                  </div>

                  <p className="text-slate-300 text-sm leading-relaxed mb-5 flex-1">&quot;{t.text}&quot;</p>

                  <div className="flex items-center gap-3 mt-auto">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">{t.name}</p>
                      <p className="text-slate-500 text-xs">{t.role} · {t.company}</p>
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-20" />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/15 via-violet-900/15 to-transparent" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/6 rounded-full blur-[80px] pointer-events-none" />

        <FadeIn className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-8">
            <Clock className="w-3 h-3" />
            Takes 2 minutes. Saves weeks of failed applications.
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
            Ready to Beat{" "}
            <span className="gradient-text">the ATS?</span>
          </h2>

          <p className="text-slate-400 text-lg mb-10">
            Find out exactly what&apos;s wrong with your resume — and fix it today.
          </p>

          <Link
            href="/analyze"
            className="btn-primary inline-flex items-center gap-3 px-10 py-5 rounded-2xl text-lg font-bold group"
          >
            Analyze My Resume Free
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 mt-6 text-slate-500 text-xs">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No account</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant results</span>
          </div>
        </FadeIn>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <Footer />
    </main>
  );
}
