import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/layout/Footer";
import InterviewPrepTool from "@/components/ai/InterviewPrepTool";
import { CheckCircle2, MessageSquare, Sparkles } from "lucide-react";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title:
    "AI Interview Question Generator — Practice with AI Coach | ResumeATS",
  description:
    "Get AI-generated interview questions tailored to your resume and target role. Practice with an AI coach that gives personalized feedback — free.",
  path: "/interview-prep",
});

export default function InterviewPrepPage() {
  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      {/* Ambient background effects */}
      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="fixed top-1/4 left-1/3 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero header */}
      <section className="page-shell pt-24 sm:pt-28 pb-8">
        <div className="page-hero page-hero-compact">
        <div className="page-eyebrow mb-5">
          <Sparkles className="h-3 w-3" />
          AI-Powered Interview Coach
        </div>
        <h1
          className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Nail Your Next Interview
        </h1>
        <p className="text-slate-400 text-base sm:text-lg max-w-xl mx-auto leading-relaxed">
          Get AI-generated interview questions tailored to your resume and
          target role. Practice with answer frameworks that help you stand out.
        </p>
        <div className="page-meta-row">
          <span className="page-meta-pill">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            Auto-loads your last resume
          </span>
          <span className="page-meta-pill">
            <MessageSquare className="h-3.5 w-3.5 text-indigo-400" />
            Structured answer guides
          </span>
        </div>
        </div>
      </section>

      {/* Tool */}
      <section className="relative z-10 pb-24">
        <InterviewPrepTool />
      </section>

      <Footer />
    </main>
  );
}
