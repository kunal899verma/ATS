import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import {
  ArrowRight, CheckCircle2, Zap, Target, BarChart3, Shield,
  FileSearch, Brain, TrendingUp, Star, AlertTriangle, Users, Clock,
} from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ResumeATS — Free ATS Resume Checker & Keyword Analyzer",
  description:
    "Check your resume's ATS score instantly. Keyword analysis, section scoring, recruiter readability — free, no account required.",
};

// ─── Data ─────────────────────────────────────────────────────────────────────

const PAIN_POINTS = [
  {
    icon: AlertTriangle,
    stat: "75%",
    title: "Rejected before a human sees them",
    desc: "ATS systems rank and filter resumes automatically. A resume that scores low on keyword alignment never reaches a recruiter's desk.",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
  },
  {
    icon: Target,
    stat: "6s",
    title: "That's all a recruiter spends on first review",
    desc: "If your resume isn't structured for instant scanning — clear sections, bullet points, relevant keywords — it gets skipped.",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  {
    icon: Users,
    stat: "250+",
    title: "Applicants per role on average",
    desc: "You're not just competing against the job requirements — you're competing against hundreds of other candidates who tailored their resume.",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
];

const FEATURES = [
  {
    icon: Brain,
    title: "Synonym-Aware Keyword Matching",
    desc: "We don't just check exact words. 'JS' counts for 'JavaScript'. 'K8s' counts for 'Kubernetes'. Smart matching means you're not penalized for natural writing.",
    color: "text-cyan-400",
    border: "border-cyan-500/15",
  },
  {
    icon: BarChart3,
    title: "6-Dimension Score Breakdown",
    desc: "Keywords, Skills, Experience, Education, Formatting, and ATS Compatibility — each scored separately so you know exactly where to spend 20 minutes.",
    color: "text-violet-400",
    border: "border-violet-500/15",
  },
  {
    icon: Target,
    title: "Recruiter Readability Score",
    desc: "Our differentiator. Beyond ATS bots — we grade your resume for the human who opens it. Clarity, impact, authenticity, and relevance.",
    color: "text-pink-400",
    border: "border-pink-500/15",
  },
  {
    icon: FileSearch,
    title: "PDF, DOCX & Text Upload",
    desc: "Upload any format or paste your resume text directly. No file parsing issues, no garbled output. Works the first time.",
    color: "text-amber-400",
    border: "border-amber-500/15",
  },
  {
    icon: TrendingUp,
    title: "Prioritized Fix List",
    desc: "Every suggestion has a priority level and estimated score impact. Stop guessing what to fix first — follow the list.",
    color: "text-emerald-400",
    border: "border-emerald-500/15",
  },
  {
    icon: Shield,
    title: "Zero Data Retention",
    desc: "Your resume is analyzed in memory and immediately discarded. We don't store, share, or train on your data. Period.",
    color: "text-blue-400",
    border: "border-blue-500/15",
  },
];

const STEPS = [
  { num: "01", title: "Upload or paste your resume", desc: "Drop a PDF/DOCX or paste your resume text directly. No account, no friction.", numColor: "text-cyan-400", border: "border-cyan-500/20" },
  { num: "02", title: "Get your full ATS analysis", desc: "ATS score, keyword gaps, section scores, recruiter readability, and a prioritized fix list.", numColor: "text-violet-400", border: "border-violet-500/20" },
  { num: "03", title: "Fix and recheck", desc: "Apply the prioritized suggestions, re-upload your resume, and watch your score climb.", numColor: "text-pink-400", border: "border-pink-500/20" },
];

const STATS = [
  { value: "100%", label: "Free forever" },
  { value: "<5s", label: "Analysis time" },
  { value: "92%", label: "Parse accuracy" },
  { value: "No", label: "Account needed" },
];

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
    text: "Jobscan charged me $50/month to tell me my score was 60%. This tool told me the same thing, free, with better suggestions. The recruiter readability score is genius — no other tool has that.",
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
  { feature: "Keyword match with synonyms", us: true, jobscan: false, resumeWorded: false },
  { feature: "Recruiter readability score", us: true, jobscan: false, resumeWorded: false },
  { feature: "No account required", us: true, jobscan: false, resumeWorded: false },
  { feature: "Always free (unlimited)", us: true, jobscan: false, resumeWorded: false },
  { feature: "Honest score calibration", us: true, jobscan: false, resumeWorded: true },
  { feature: "Section-by-section scoring", us: true, jobscan: true, resumeWorded: true },
  { feature: "Paste text (no upload needed)", us: true, jobscan: false, resumeWorded: false },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function HomePage() {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "ResumeATS",
    url: "https://resumeats.app",
    description: "Free ATS resume checker with keyword analysis, section scoring, and recruiter readability score.",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
  };

  return (
    <main className="flex flex-col min-h-screen bg-[#020817]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd).replace(/</g, "\\u003c") }}
      />
      <Navbar />

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        <div className="absolute inset-0 bg-grid" />
        <div className="absolute top-1/3 -left-20 w-[500px] h-[500px] bg-cyan-500/8 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/3 -right-20 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge */}
          <div className="animate-slide-up inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-8">
            <Zap className="w-3 h-3" />
            Free · Instant · No Account Required
          </div>

          {/* Headline */}
          <h1 className="animate-slide-up delay-100 text-5xl sm:text-6xl lg:text-[72px] font-bold text-white leading-[1.1] tracking-tight mb-6">
            Your Resume Has{" "}
            <span className="gradient-text">7 Seconds.</span>
            <br />
            Make Them Count.
          </h1>

          <p className="animate-slide-up delay-200 text-slate-400 text-lg sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Most resumes never reach a human. Our ATS analyzer tells you exactly why yours isn&apos;t
            getting callbacks — and gives you a prioritized fix list to change that.
          </p>

          {/* CTAs */}
          <div className="animate-slide-up delay-300 flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
            <Link href="/analyze" className="btn-primary flex items-center gap-2.5 px-8 py-4 rounded-xl text-base group">
              Analyze My Resume Free
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="flex items-center gap-4 text-slate-500 text-sm">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                PDF, DOCX, or paste text
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Results in 5 seconds
              </span>
            </div>
          </div>

          {/* Stats row */}
          <div className="animate-slide-up delay-400 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="glass rounded-xl p-3.5 text-center border border-white/5">
                <div className="text-xl font-bold text-white leading-none mb-1">{s.value}</div>
                <div className="text-slate-500 text-xs">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5 text-slate-600">
          <span className="text-[11px] uppercase tracking-widest">Scroll</span>
          <div className="w-4 h-7 rounded-full border border-white/10 flex items-start justify-center py-1">
            <div className="w-1 h-2 bg-cyan-400 rounded-full animate-bounce" />
          </div>
        </div>
      </section>

      {/* ── Problem Section ───────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-red-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">The Real Problem</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              Why your resume isn&apos;t working
            </h2>
            <p className="text-slate-400 max-w-lg mx-auto">
              It&apos;s probably not your experience — it&apos;s how your resume is presenting it.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PAIN_POINTS.map((p) => {
              const Icon = p.icon;
              return (
                <div key={p.title} className={`glass rounded-2xl p-6 border ${p.border} ${p.bg}`}>
                  <div className={`text-4xl font-black ${p.color} mb-3 font-mono`}>{p.stat}</div>
                  <h3 className="text-white font-semibold mb-2 leading-snug">{p.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{p.desc}</p>
                  <Icon className={`w-5 h-5 ${p.color} mt-4 opacity-50`} />
                </div>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              The good news: all three problems are fixable in under an hour with the right feedback.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────────── */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-cyan-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">3 Steps, Under 2 Minutes</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">How it works</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((step, i) => (
              <div key={step.num} className="relative">
                {i < STEPS.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-[calc(100%-12px)] w-[calc(100%-100%+88px)] h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
                )}
                <div className={`glass rounded-2xl p-6 border ${step.border} hover:scale-[1.02] transition-transform duration-300 cursor-default`}>
                  <div className={`text-5xl font-black ${step.numColor} opacity-20 mb-4 font-mono leading-none`}>
                    {step.num}
                  </div>
                  <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link href="/analyze" className="btn-primary inline-flex items-center gap-2 px-7 py-3.5 rounded-xl">
              Start Free Analysis
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-violet-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Built Different</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              More than a keyword counter
            </h2>
            <p className="text-slate-400 max-w-xl mx-auto">
              We built the tool we wished existed — honest scoring, smart matching, and feedback that actually makes sense.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((feat) => {
              const Icon = feat.icon;
              return (
                <div
                  key={feat.title}
                  className={`glass rounded-2xl p-6 border ${feat.border} hover:scale-[1.02] transition-all duration-300 group cursor-default`}
                >
                  <div className={`w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center mb-4 ${feat.color} group-hover:scale-110 transition-transform`}>
                    <Icon className="w-[18px] h-[18px]" />
                  </div>
                  <h3 className="text-white font-semibold mb-2 text-[15px]">{feat.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Comparison Table ──────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-900/4 to-transparent pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-pink-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Honest Comparison</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              We vs. the $50/month tools
            </h2>
          </div>

          <div className="glass rounded-2xl border border-white/8 overflow-hidden">
            <div className="grid grid-cols-4 border-b border-white/5 text-xs font-semibold uppercase tracking-wider text-slate-500">
              <div className="p-4 col-span-2">Feature</div>
              <div className="p-4 text-center text-cyan-400">ResumeATS</div>
              <div className="p-4 text-center">Jobscan / ResumeWorded</div>
            </div>

            {VS_COMPARISON.map((row, i) => (
              <div
                key={row.feature}
                className={`grid grid-cols-4 text-sm ${i < VS_COMPARISON.length - 1 ? "border-b border-white/4" : ""} hover:bg-white/2 transition-colors`}
              >
                <div className="p-4 col-span-2 text-slate-300">{row.feature}</div>
                <div className="p-4 flex justify-center">
                  {row.us ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="w-4 h-px bg-white/20 mt-2" />
                  )}
                </div>
                <div className="p-4 flex justify-center">
                  {(row.jobscan || row.resumeWorded) ? (
                    <CheckCircle2 className="w-4 h-4 text-slate-500" />
                  ) : (
                    <span className="text-red-500 text-lg leading-none">✗</span>
                  )}
                </div>
              </div>
            ))}

            <div className="p-4 bg-cyan-500/5 border-t border-cyan-500/15 text-center">
              <span className="text-slate-400 text-xs">Jobscan: $49.95/month · ResumeWorded: $19–49/month · </span>
              <span className="text-cyan-400 text-xs font-semibold">ResumeATS: Free. Always.</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────────── */}
      <section className="relative py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-emerald-400 text-xs font-semibold tracking-[0.2em] uppercase mb-3">Real Results</p>
            <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
              From &quot;no callbacks&quot; to &quot;3 interviews this week&quot;
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="glass rounded-2xl p-6 border border-white/6 hover:border-white/10 transition-colors flex flex-col">
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  ))}
                </div>

                <div className="flex items-center gap-2 mb-4 text-xs">
                  <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 border border-red-500/20 font-mono">
                    {t.score.from}
                  </span>
                  <ArrowRight className="w-3 h-3 text-slate-600" />
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                    {t.score.to}
                  </span>
                  <span className="text-slate-500">ATS score</span>
                </div>

                <p className="text-slate-300 text-sm leading-relaxed mb-5 flex-1">&quot;{t.text}&quot;</p>

                <div className="flex items-center gap-3 mt-auto">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-slate-500 text-xs">{t.role} · {t.company}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────────── */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-25" />
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/15 via-violet-900/15 to-pink-900/10" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-violet-500/6 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 max-w-2xl mx-auto px-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-emerald-400 text-xs font-medium mb-8">
            <Clock className="w-3 h-3" />
            Takes 2 minutes. Saves weeks of failed applications.
          </div>

          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            Stop guessing why<br />you&apos;re not getting{" "}
            <span className="gradient-text">callbacks.</span>
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

          <div className="flex items-center justify-center gap-6 mt-6 text-slate-500 text-xs">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No account</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> No credit card</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Instant results</span>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="text-slate-400 text-sm font-medium">
              Resume<span className="text-cyan-400">ATS</span>
            </span>
          </div>
          <p className="text-slate-600 text-xs text-center">
            Built to level the playing field. Your resume data is never stored.
          </p>
          <div className="flex gap-6 text-slate-600 text-xs">
            <Link href="/analyze" className="hover:text-slate-400 transition-colors">Analyze Resume</Link>
            <Link href="/tips" className="hover:text-slate-400 transition-colors">ATS Tips</Link>
            <Link href="/pricing" className="hover:text-slate-400 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
