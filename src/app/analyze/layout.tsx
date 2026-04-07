import type { ReactNode } from "react";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Free ATS Resume Checker — Upload Resume and Get Score | ResumeATS",
  description:
    "Upload your resume or paste the text to get an instant ATS score, keyword match analysis, and prioritized fixes. Free, fast, and no account required.",
  path: "/analyze",
  keywords: [
    "free ATS resume checker",
    "ATS score checker",
    "resume analysis",
    "resume keyword scanner",
    "resume score checker",
  ],
});

export default function AnalyzeLayout({ children }: { children: ReactNode }) {
  return children;
}
