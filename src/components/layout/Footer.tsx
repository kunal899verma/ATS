"use client";

import Link from "next/link";
import { Zap, Github, Twitter, Linkedin } from "lucide-react";

const PRODUCT_LINKS = [
  { href: "/analyze", label: "Analyze Resume" },
  { href: "/cover-letter", label: "Cover Letter Generator" },
  { href: "/interview-prep", label: "Interview Prep" },
  { href: "/templates", label: "Resume Templates" },
  { href: "/recruiter", label: "Recruiter Dashboard" },
];

const RESOURCE_LINKS = [
  { href: "/tips", label: "ATS Tips Guide" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
];

const LEGAL_LINKS = [
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/terms", label: "Terms of Service" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0a0a0f] print:hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 md:gap-8">

          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-lg text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Resume<span className="text-indigo-400">ATS</span>
              </span>
            </Link>
            <p className="text-slate-500 text-sm leading-relaxed mb-5 max-w-[240px]">
              The #1 free AI-powered career platform. ATS scoring, cover letters, interview prep — all free, forever.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://github.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                aria-label="GitHub"
              >
                <Github className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/[0.08] transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product column */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Product</h3>
            <ul className="space-y-2.5">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources column */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Resources</h3>
            <ul className="space-y-2.5">
              {RESOURCE_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal column */}
          <div>
            <h3 className="text-white text-sm font-semibold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Legal</h3>
            <ul className="space-y-2.5">
              {LEGAL_LINKS.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-slate-500 hover:text-slate-300 text-sm transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-600 text-xs">
            &copy; {new Date().getFullYear()} ResumeATS. Made with care for job seekers everywhere.
          </p>
          <div className="flex items-center gap-2 text-slate-600 text-xs">
            <span>Built with Next.js, React 19 & Gemini AI</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
