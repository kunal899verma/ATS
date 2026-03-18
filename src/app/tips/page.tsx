import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { ArrowRight, CheckCircle2, XCircle, Zap, AlertTriangle, Target, Brain } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ATS Resume Tips — How to Beat Applicant Tracking Systems",
  description:
    "Practical, research-backed tips to get your resume past ATS filters and into recruiter hands. Keyword strategies, formatting rules, section guidance, and common mistakes.",
  keywords: [
    "ATS tips", "beat ATS", "ATS resume tips", "applicant tracking system tips",
    "resume keywords", "ATS formatting", "resume optimization", "ATS resume guide",
  ],
};

const TIPS = [
  {
    category: "Keywords",
    color: "cyan",
    iconBg: "bg-cyan-500/15",
    iconText: "text-cyan-400",
    border: "border-cyan-500/20",
    bg: "bg-cyan-500/5",
    icon: Brain,
    items: [
      {
        title: "Mirror the exact language in the job description",
        desc: "ATS systems often do exact-string matching. If the JD says 'Python' and your resume says 'Python programming', some systems will miss it. Use the exact phrasing.",
        good: "Developed Python scripts to automate data pipelines",
        bad: "Created automation scripts using programming languages",
      },
      {
        title: "Use both spelled-out and abbreviated forms",
        desc: "Include both 'Machine Learning' and 'ML', both 'JavaScript' and 'JS'. ResumeATS handles synonyms, but many corporate ATS systems don't.",
        good: "Machine Learning (ML) models, Natural Language Processing (NLP)",
        bad: "ML and NLP work — assumes the system knows abbreviations",
      },
      {
        title: "Place keywords in context, not just in a skills list",
        desc: "Modern ATS systems give more weight to keywords that appear in context (under a job title) vs. a standalone skills section.",
        good: "Led development of React-based frontend for internal dashboard",
        bad: "Skills: React, TypeScript, Node.js (listed without context)",
      },
      {
        title: "Don't keyword stuff — it triggers penalties",
        desc: "Adding 20 mentions of 'Python' in your resume to boost score will actually hurt you. Both ATS systems and human reviewers penalize it. ResumeATS detects keyword stuffing.",
        good: "2–4 uses of a key technology across your experience section",
        bad: "Python Python Python | expert Python developer | Python Python",
      },
    ],
  },
  {
    category: "Formatting",
    color: "violet",
    iconBg: "bg-violet-500/15",
    iconText: "text-violet-400",
    border: "border-violet-500/20",
    bg: "bg-violet-500/5",
    icon: Target,
    items: [
      {
        title: "Use a single-column layout — never multi-column",
        desc: "ATS parsers read left-to-right, top-to-bottom. Two-column resumes cause parsers to mix up text from different sections, corrupting your data.",
        good: "Single column: Contact → Summary → Experience → Skills → Education",
        bad: "Two columns where skills are next to experience — parsers merge them",
      },
      {
        title: "No tables, text boxes, or headers/footers",
        desc: "Content inside tables and text boxes is often completely ignored by ATS parsers. Headers and footers get stripped in many systems.",
        good: "All content in the main document body as regular text",
        bad: "Contact info in header, skills in a sidebar table",
      },
      {
        title: "Use standard section headers",
        desc: "ATS systems look for specific section names. Creative headers like 'My Journey' or 'Where I've Been' won't be detected.",
        good: "Experience / Work Experience / Professional Experience",
        bad: "My Journey / Career Story / Where I've Been",
      },
      {
        title: "Save as .docx for maximum compatibility",
        desc: "DOCX is the most reliably parsed format across all ATS systems. Some PDF parsers fail on complex layouts. If submitting PDF, use a text-based (not scanned) PDF.",
        good: "Text-based PDF or .docx saved from Word/Google Docs",
        bad: "Scanned PDF, image-based PDF, or designer resume from Canva/Figma",
      },
    ],
  },
  {
    category: "Content Strategy",
    color: "pink",
    iconBg: "bg-pink-500/15",
    iconText: "text-pink-400",
    border: "border-pink-500/20",
    bg: "bg-pink-500/5",
    icon: CheckCircle2,
    items: [
      {
        title: "Quantify every achievement you can",
        desc: "Numbers dramatically increase ATS scores and recruiter engagement. They signal impact, not just activity. Even rough estimates are better than nothing.",
        good: "Reduced API response time by 40% by implementing Redis caching",
        bad: "Improved API performance",
      },
      {
        title: "Lead every bullet with a strong action verb",
        desc: "ATS systems and recruiters both respond better to action-forward bullets. Avoid passive constructions like 'responsible for' or 'worked on'.",
        good: "Designed, Built, Led, Reduced, Increased, Launched, Managed",
        bad: "Responsible for, Worked on, Helped with, Assisted in",
      },
      {
        title: "Keep your resume to 1–2 pages maximum",
        desc: "ATS systems don't care about length — but after passing ATS, a recruiter reviews it. Standard is 1 page for under 5 years experience, 2 pages for senior roles.",
        good: "350–750 words for 1-page, 550–1000 words for 2-page",
        bad: "3+ page resumes are almost never read fully by human reviewers",
      },
      {
        title: "Tailor your resume to each job — at minimum, the skills section",
        desc: "A generic resume gets a generic score. The single highest-leverage action you can take is to update your skills section and summary to match each JD.",
        good: "Adjust top 5–8 skills and first 2 bullet points per application",
        bad: "Sending the same resume to 50 different roles",
      },
    ],
  },
];

const QUICK_WINS = [
  "Add contact info (email, phone, LinkedIn) at the very top",
  "Include a 2–3 sentence summary tailored to the role",
  "Use the exact job title from the posting in your summary",
  "Add your most important skills within the first half of the resume",
  "Use consistent date formatting (Jan 2022 – Present, not 01/22–now)",
  "Remove 'References available upon request' — it wastes space",
  "Don't use pronouns — 'Led a team' not 'I led a team'",
  "Check spelling — ATS systems don't fix typos in keyword matching",
];

const MYTHS = [
  {
    myth: "White text tricks ATS",
    reality: "Modern ATS systems extract all text including white/invisible text. This can flag your resume as deceptive and disqualify you instantly.",
  },
  {
    myth: "Fancy resume designs score higher",
    reality: "Design-heavy resumes (Canva, Figma exports, graphic templates) consistently score lower because parsers struggle with them. Simplicity wins.",
  },
  {
    myth: "Adding more keywords always helps",
    reality: "Keyword stuffing is detected and penalized. Quality context matters more than quantity. 3 in-context uses beat 15 list mentions.",
  },
  {
    myth: "ATS is the only gatekeeper",
    reality: "After passing ATS, a human reviews your resume in 6–10 seconds. Both the bot score AND human readability matter. Our Recruiter Readability Score addresses this.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    ...TIPS.flatMap((section) =>
      section.items.map((tip) => ({
        "@type": "Question",
        name: tip.title,
        acceptedAnswer: { "@type": "Answer", text: tip.desc },
      }))
    ),
    ...MYTHS.map((m) => ({
      "@type": "Question",
      name: `Is it true that "${m.myth}"?`,
      acceptedAnswer: { "@type": "Answer", text: m.reality },
    })),
  ],
};

export default function TipsPage() {
  return (
    <main className="min-h-screen bg-[#020817]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd).replace(/</g, "\\u003c") }}
      />
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Header */}
        <div className="mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-5">
            <Brain className="w-3 h-3" />
            Research-backed · Updated 2025
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-5 leading-tight">
            How to beat ATS<br />
            <span className="gradient-text">and get the callback.</span>
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
            75% of resumes never reach a human. Here&apos;s exactly what separates the ones that do —
            keyword strategies, formatting rules, and the myths that are actively hurting your score.
          </p>
        </div>

        {/* Quick wins */}
        <div className="glass rounded-2xl border border-emerald-500/15 bg-emerald-500/3 p-6 mb-12">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-emerald-400" />
            <h2 className="text-white font-bold">Quick wins — do these first</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {QUICK_WINS.map((win) => (
              <div key={win} className="flex items-start gap-2 text-sm text-slate-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                {win}
              </div>
            ))}
          </div>
        </div>

        {/* Main tips */}
        {TIPS.map((section) => {
          const SectionIcon = section.icon;
          return (
            <div key={section.category} className="mb-12">
              <div className="flex items-center gap-2.5 mb-6">
                <div className={`w-8 h-8 rounded-lg ${section.iconBg} flex items-center justify-center`}>
                  <SectionIcon className={`w-4 h-4 ${section.iconText}`} />
                </div>
                <h2 className="text-2xl font-bold text-white">{section.category}</h2>
              </div>

              <div className="space-y-5">
                {section.items.map((tip, idx) => (
                  <div key={idx} className={`glass rounded-2xl border ${section.border} p-6`}>
                    <h3 className="text-white font-semibold text-[15px] mb-2">{tip.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">{tip.desc}</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="rounded-xl bg-emerald-500/6 border border-emerald-500/15 p-3.5">
                        <p className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider mb-2">✓ Do this</p>
                        <p className="text-slate-300 text-xs leading-relaxed font-mono">{tip.good}</p>
                      </div>
                      <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-3.5">
                        <p className="text-[10px] text-red-400 font-semibold uppercase tracking-wider mb-2">✗ Not this</p>
                        <p className="text-slate-400 text-xs leading-relaxed font-mono">{tip.bad}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Myths */}
        <div className="mb-14">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-8 h-8 rounded-lg bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4 text-red-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">ATS Myths That Are Hurting You</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {MYTHS.map((m) => (
              <div key={m.myth} className="glass rounded-2xl border border-white/7 p-5">
                <div className="flex items-start gap-2 mb-2">
                  <XCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-400 font-semibold text-sm">&quot;{m.myth}&quot;</p>
                </div>
                <p className="text-slate-400 text-sm leading-relaxed pl-6">{m.reality}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass rounded-2xl border border-cyan-500/20 bg-cyan-500/3 p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Put these tips to the test</h2>
          <p className="text-slate-400 mb-7 max-w-md mx-auto">
            Apply one tip, re-analyze your resume, and see your score move. Free, no account required.
          </p>
          <Link
            href="/analyze"
            className="btn-primary inline-flex items-center gap-3 px-8 py-4 rounded-xl font-semibold group"
          >
            Check My Resume Now
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
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
          <p className="text-slate-600 text-xs text-center">Free ATS resume checker. Your data is never stored.</p>
          <div className="flex gap-6 text-slate-600 text-xs">
            <Link href="/analyze" className="hover:text-slate-400 transition-colors">Analyze Resume</Link>
            <Link href="/pricing" className="hover:text-slate-400 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
