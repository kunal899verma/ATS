import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPosts, getPost } from "@/lib/blog";
import { ArrowLeft, Clock, ArrowRight, Zap } from "lucide-react";

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  try {
    const { metadata: meta } = await getPost(slug);
    return {
      title: `${meta.title} | ResumeATS`,
      description: meta.description,
      openGraph: {
        title: meta.title,
        description: meta.description,
        type: "article",
        publishedTime: meta.publishedAt,
      },
      twitter: {
        card: "summary_large_image",
        title: meta.title,
        description: meta.description,
      },
    };
  } catch {
    return { title: "Blog | ResumeATS" };
  }
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  let post;
  try {
    post = await getPost(slug);
  } catch {
    notFound();
  }

  const { metadata: meta, Content } = post;

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: meta.title,
    description: meta.description,
    datePublished: meta.publishedAt,
    author: { "@type": "Organization", name: "ResumeATS", url: "https://resumeats.app" },
    publisher: { "@type": "Organization", name: "ResumeATS", url: "https://resumeats.app" },
  };

  return (
    <main className="relative z-10 max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd).replace(/</g, "\\u003c"),
        }}
      />

      {/* Back link */}
      <Link
        href="/blog"
        className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors mb-8"
      >
        <ArrowLeft className="w-3.5 h-3.5" /> Back to Blog
      </Link>

      {/* Post header */}
      <header className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <span className="tag border text-xs text-violet-400 bg-violet-500/10 border-violet-500/20">
            {meta.category}
          </span>
          <span className="flex items-center gap-1 text-slate-500 text-xs">
            <Clock className="w-3 h-3" /> {meta.readingTime}
          </span>
          <span className="text-slate-600 text-xs">{formatDate(meta.publishedAt)}</span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight mb-4">
          {meta.title}
        </h1>
        <p className="text-slate-400 text-lg leading-relaxed">
          {meta.description}
        </p>
      </header>

      <hr className="border-white/8 mb-10" />

      {/* MDX Content */}
      <article>
        <Content />
      </article>

      <hr className="border-white/8 mt-12 mb-10" />

      {/* CTA */}
      <div className="glass rounded-2xl border border-cyan-500/15 bg-cyan-500/3 p-7 text-center">
        <Zap className="w-5 h-5 text-cyan-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">
          Put this into practice
        </h2>
        <p className="text-slate-400 text-sm mb-6">
          Apply these tips to your resume — free ATS analysis in 5 seconds.
        </p>
        <Link
          href="/analyze"
          className="btn-primary inline-flex items-center gap-2 px-7 py-3 rounded-xl font-semibold group"
        >
          Check My Resume Free
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </main>
  );
}
