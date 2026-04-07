import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "Resume Analysis Results | ResumeATS",
  description: "Private ATS resume analysis results generated for your uploaded resume.",
  path: "/results",
  noIndex: true,
});

export default function ResultsLayout({ children }: LayoutProps<"/results">) {
  return children;
}
