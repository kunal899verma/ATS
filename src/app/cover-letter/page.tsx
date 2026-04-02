import type { Metadata } from "next";
import Navbar from "@/components/ui/Navbar";
import Footer from "@/components/layout/Footer";
import CoverLetterGenerator from "@/components/ai/CoverLetterGenerator";
import { FadeIn } from "@/components/ui/FadeIn";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";
import { CheckCircle2, FileText, Sparkles } from "lucide-react";

export const metadata: Metadata = {
  title: "Free AI Cover Letter Generator — Tailored to Any Job | ResumeATS",
  description:
    "Generate a tailored, ATS-optimized cover letter in 30 seconds. Paste a job description, choose your tone, and let AI craft the perfect cover letter — free.",
  keywords: [
    "AI cover letter generator",
    "free cover letter",
    "cover letter builder",
    "ATS cover letter",
    "job application cover letter",
    "tailored cover letter",
  ],
};

export default function CoverLetterPage() {
  return (
    <main
      id="main-content"
      className="flex flex-col min-h-screen bg-[var(--bg-primary)]"
    >
      <Navbar />
      <div className="pt-24 sm:pt-28 pb-14 sm:pb-16 flex-1 relative">
        <FloatingOrbs />

        <div className="page-shell">
          {/* Hero header */}
          <FadeIn direction="up" className="page-hero page-hero-compact">
            <div className="page-eyebrow mb-5 sm:mb-6">
              <Sparkles className="h-3 w-3" />
              AI-Powered Cover Letters
            </div>
            <h1
              className="text-3xl sm:text-5xl lg:text-6xl font-bold mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              <span className="text-white">Generate a </span>
              <span className="bg-gradient-to-r from-indigo-500 to-violet-600 bg-clip-text text-transparent">
                Tailored Cover Letter
              </span>
              <span className="text-white"> in Seconds</span>
            </h1>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Paste a job description, choose your tone, and let AI craft a
              compelling, ATS-optimized cover letter matched to your resume.
            </p>
            <div className="page-meta-row">
              <span className="page-meta-pill">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                Reuses your latest resume
              </span>
              <span className="page-meta-pill">
                <FileText className="h-3.5 w-3.5 text-violet-400" />
                Copy, regenerate, or download
              </span>
            </div>
          </FadeIn>

          <CoverLetterGenerator />
        </div>
      </div>
      <Footer />
    </main>
  );
}
