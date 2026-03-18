"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function Error({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[ResumeATS Error]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 text-center max-w-md">
        <div className="w-14 h-14 rounded-2xl bg-red-500/15 border border-red-500/25 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-6 h-6 text-red-400" />
        </div>

        <h1 className="text-2xl font-bold text-white mb-3">Something went wrong</h1>
        <p className="text-slate-400 mb-2 leading-relaxed">
          An unexpected error occurred. Try again — if the problem persists, refresh the page.
        </p>

        {error.digest && (
          <p className="text-slate-600 text-xs font-mono mb-8">
            Error ID: {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-6">
          <button
            onClick={unstable_retry}
            className="btn-primary flex items-center gap-2 px-6 py-3 rounded-xl font-semibold"
          >
            <RefreshCw className="w-4 h-4" /> Try Again
          </button>
          <Link
            href="/"
            className="btn-ghost flex items-center gap-2 px-6 py-3 rounded-xl text-sm"
          >
            <Home className="w-4 h-4" /> Go Home
          </Link>
        </div>
      </div>
    </main>
  );
}
