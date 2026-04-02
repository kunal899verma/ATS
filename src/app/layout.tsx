import type { Metadata, Viewport } from "next";
import { Space_Grotesk, DM_Sans, JetBrains_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Providers from "@/components/Providers";
import { ToastProvider } from "@/components/ui/Toast";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ResumeATS — Free AI Resume Checker, Cover Letter Generator & ATS Score Analyzer",
  description:
    "Get your resume's ATS compatibility score in 5 seconds. AI-powered keyword analysis, cover letter generation, interview prep, section scoring, recruiter readability — all free, no account needed.",
  keywords: [
    "ATS resume checker", "ATS score", "resume scanner", "keyword analysis",
    "resume optimizer", "job application", "ATS compatibility", "resume score",
    "free resume checker", "applicant tracking system", "AI cover letter generator",
    "interview prep", "resume builder", "AI resume coach",
  ],
  authors: [{ name: "ResumeATS" }],
  robots: "index, follow",
  openGraph: {
    title: "ResumeATS — Free AI Resume Checker & Career Platform",
    description: "AI-powered ATS scoring, cover letter generation, interview prep, and resume building. Free, instant, no account required.",
    type: "website",
    siteName: "ResumeATS",
  },
  twitter: {
    card: "summary_large_image",
    title: "ResumeATS — Free AI Resume Checker & Career Platform",
    description: "ATS score, AI cover letters, interview prep — all free, in seconds.",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0a0a0f",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${dmSans.variable} ${jetbrainsMono.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <a href="#main-content" className="skip-link">Skip to main content</a>
        <Providers>
          <ToastProvider>
            {children}
          </ToastProvider>
        </Providers>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
