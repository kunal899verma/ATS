"use client";

import { useEffect } from "react";
import "./globals.css";

export default function GlobalError({
  error,
  unstable_retry,
}: {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}) {
  useEffect(() => {
    console.error("[ResumeATS GlobalError]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#020817] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚡</div>
          <h1 className="text-2xl font-bold text-white mb-3">
            Resume<span className="text-cyan-400">ATS</span> — Critical Error
          </h1>
          <p className="text-slate-400 mb-6 leading-relaxed">
            Something went wrong at the application level. Please try again.
          </p>
          {error.digest && (
            <p className="text-slate-600 text-xs font-mono mb-6">
              Digest: {error.digest}
            </p>
          )}
          <button
            onClick={unstable_retry}
            className="btn-primary px-6 py-3 rounded-xl font-semibold"
          >
            Reload Application
          </button>
        </div>
      </body>
    </html>
  );
}
