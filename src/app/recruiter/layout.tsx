import type { ReactNode } from "react";
import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Recruiter Batch Resume Analysis — Compare Candidates Faster | ResumeATS",
  description:
    "Upload multiple resumes, compare ATS scores, sort candidates, and review keyword alignment from a recruiter-friendly dashboard.",
  path: "/recruiter",
  keywords: [
    "recruiter resume analysis",
    "batch ATS checker",
    "candidate comparison tool",
    "resume screening tool",
    "resume ranking software",
  ],
});

export default function RecruiterLayout({ children }: { children: ReactNode }) {
  return children;
}
