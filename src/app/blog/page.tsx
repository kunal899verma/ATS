import type { Metadata } from "next";
import Link from "next/link";
import { getAllPosts } from "@/lib/blog";
import { ArrowRight, Clock, Zap, BookOpen } from "lucide-react";

export const metadata: Metadata = {
  title: "ATS Resume Blog — Tips, Guides & Strategies | ResumeATS",
  description:
    "Expert guides on beating ATS systems, resume formatting, keyword strategy, and landing more interviews. Free, research-backed advice.",
  keywords: [
    "ATS tips", "resume guide", "beat ATS", "resume keywords", "job search tips",
    "ATS resume format", "resume optimization guide",
  ],
};

const CATEGORY_COLORS: Record<string, string> = {
  Strategy:  "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  Keywords:  "text-violet-400 bg-violet-500/10 border-violet-500/20",
  Formatting:"text-amber-400 bg-amber-500/10 border-amber-500/20",
  Comparison:"text-pink-400 bg-pink-500/10 border-pink-500/20",
  Basics:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  return (
    <main className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
      {/* Header */}
      <div className="mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/5 text-violet-400 text-xs font-medium mb-5">
          <BookOpen className="w-3 h-3" />
          Research-backed guides · Free
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
          ATS Resume{" "}
          <span className="gradient-text">Blog</span>
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
          Practical guides to beat ATS systems, write better resumes, and land
          more interviews — written by people who built the analyzer.
        </p>
      </div>

      {/* Featured post */}
      {posts[0] && (
        <Link
          href={`/blog/${posts[0].slug}`}
          className="glass rounded-2xl border border-white/8 p-7 mb-8 block hover:border-white/14 transition-all group"
        >
          <div className="flex flex-col sm:flex-row sm:items-start gap-5">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3">
                <span className={`tag border text-xs ${CATEGORY_COLORS[posts[0].category] ?? "text-slate-400 bg-white/5 border-white/10"}`}>
                  {posts[0].category}
                </span>
                <span className="text-slate-600 text-xs">Featured</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors leading-snug">
                {posts[0].title}
              </h2>
              <p className="text-slate-400 leading-relaxed mb-4">{posts[0].description}</p>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {posts[0].readingTime}
                </span>
                <span>{formatDate(posts[0].publishedAt)}</span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-cyan-400 text-sm font-medium flex-shrink-0 group-hover:gap-2 transition-all">
              Read article <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </Link>
      )}

      {/* Post grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {posts.slice(1).map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}`}
            className="glass rounded-2xl border border-white/7 p-6 hover:border-white/13 transition-all group"
          >
            <span className={`tag border text-xs mb-3 inline-flex ${CATEGORY_COLORS[post.category] ?? "text-slate-400 bg-white/5 border-white/10"}`}>
              {post.category}
            </span>
            <h2 className="text-white font-semibold text-[15px] mb-2 leading-snug group-hover:text-cyan-400 transition-colors">
              {post.title}
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-2">
              {post.description}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs text-slate-600">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {post.readingTime}
                </span>
                <span>{formatDate(post.publishedAt)}</span>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-cyan-400 transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      {/* CTA */}
      <div className="mt-14 glass rounded-2xl border border-cyan-500/15 bg-cyan-500/3 p-7 text-center">
        <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">
          Ready to check your resume?
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Apply what you learned — free ATS analysis in 5 seconds.
        </p>
        <Link
          href="/analyze"
          className="btn-primary inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold"
        >
          Analyze My Resume Free <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Footer */}
      <footer className="border-t border-white/5 mt-14 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center">
            <Zap className="w-2.5 h-2.5 text-white" />
          </div>
          <span className="text-slate-400 text-sm font-medium">
            Resume<span className="text-cyan-400">ATS</span>
          </span>
        </div>
        <div className="flex gap-5 text-slate-600 text-xs">
          <Link href="/analyze" className="hover:text-slate-400 transition-colors">Analyze Resume</Link>
          <Link href="/tips" className="hover:text-slate-400 transition-colors">ATS Tips</Link>
          <Link href="/pricing" className="hover:text-slate-400 transition-colors">Pricing</Link>
        </div>
      </footer>
    </main>
  );
}
