import type { Metadata } from "next";
import { createPageMetadata } from "@/lib/seo";

export const metadata: Metadata = createPageMetadata({
  title: "ATS Resume Templates — Build and Export an ATS-Friendly Resume | ResumeATS",
  description:
    "Choose from ATS-friendly resume templates, edit your content, and export a cleaner resume built for parsing and recruiter readability.",
  path: "/templates",
  keywords: [
    "ATS resume templates",
    "resume builder",
    "resume template editor",
    "ATS friendly resume format",
    "resume PDF builder",
  ],
});

export default function TemplatesLayout({ children }: LayoutProps<"/templates">) {
  return children;
}
