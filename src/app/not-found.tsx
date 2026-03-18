import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import { Zap, ArrowRight, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "404 — Page Not Found | ResumeATS",
  description: "The page you were looking for does not exist.",
  robots: "noindex",
};

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 text-center">
        {/* Icon */}
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-white/8 flex items-center justify-center mb-6">
          <Zap className="w-7 h-7 text-cyan-400" />
        </div>

        {/* 404 */}
        <div className="text-8xl font-black gradient-text leading-none mb-4 font-mono">
          404
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Page not found</h1>
        <p className="text-slate-400 max-w-sm mb-10 leading-relaxed">
          The page you&apos;re looking for doesn&apos;t exist or has been moved.
          Let&apos;s get you back on track.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <Link
            href="/analyze"
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
          >
            <Zap className="w-4 h-4" /> Analyze My Resume
          </Link>
          <Link
            href="/"
            className="btn-ghost flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
          >
            <Home className="w-4 h-4" /> Go Home
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </main>
  );
}
