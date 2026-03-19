import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import Providers from "@/components/Providers";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ResumeATS — Free ATS Resume Checker & Score Analyzer",
  description:
    "Get your resume's ATS compatibility score in 5 seconds. Keyword gap analysis, section-by-section scoring, recruiter readability score, and actionable fixes — all free, no account needed.",
  keywords: [
    "ATS resume checker", "ATS score", "resume scanner", "keyword analysis",
    "resume optimizer", "job application", "ATS compatibility", "resume score",
    "free resume checker", "applicant tracking system",
  ],
  authors: [{ name: "ResumeATS" }],
  robots: "index, follow",
  openGraph: {
    title: "ResumeATS — Free ATS Resume Checker",
    description: "Check your resume's ATS score, find missing keywords, and get specific improvements. Free, instant, no account required.",
    type: "website",
    siteName: "ResumeATS",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeATS — Free ATS Resume Checker",
    description: "ATS score, keyword gaps, and actionable suggestions in 5 seconds.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#020817",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="min-h-full flex flex-col font-[var(--font-inter)]">
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
        <Analytics />
      </body>
    </html>
  );
}
