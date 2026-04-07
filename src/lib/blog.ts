import type { ComponentType } from "react";

export interface BlogPost {
  slug: string;
  title: string;
  description: string;
  publishedAt: string;
  readingTime: string;
  category: string;
}

interface MDXModule {
  default: ComponentType;
  metadata: Omit<BlogPost, "slug">;
}

// Static map — Turbopack requires statically-analyzable imports (no template literals)
async function loadMDX(slug: string): Promise<MDXModule> {
  switch (slug) {
    case "how-to-beat-ats-resume-scanners":
      return import("../content/blog/how-to-beat-ats-resume-scanners.mdx") as Promise<MDXModule>;
    case "ats-resume-keywords-guide":
      return import("../content/blog/ats-resume-keywords-guide.mdx") as Promise<MDXModule>;
    case "what-is-ats-score":
      return import("../content/blog/what-is-ats-score.mdx") as Promise<MDXModule>;
    case "resume-formatting-for-ats":
      return import("../content/blog/resume-formatting-for-ats.mdx") as Promise<MDXModule>;
    case "jobscan-alternatives-free":
      return import("../content/blog/jobscan-alternatives-free.mdx") as Promise<MDXModule>;
    default:
      throw new Error(`Unknown blog slug: ${slug}`);
  }
}

const SLUGS = [
  "how-to-beat-ats-resume-scanners",
  "ats-resume-keywords-guide",
  "what-is-ats-score",
  "resume-formatting-for-ats",
  "jobscan-alternatives-free",
] as const;

export async function getAllPosts(): Promise<BlogPost[]> {
  const posts = await Promise.all(
    SLUGS.map(async (slug) => {
      const mod = await loadMDX(slug);
      return { slug, ...mod.metadata };
    })
  );
  return posts.sort(
    (a, b) =>
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  );
}

export async function getPost(
  slug: string
): Promise<{ metadata: BlogPost; Content: ComponentType }> {
  const mod = await loadMDX(slug);
  return {
    metadata: { slug, ...mod.metadata },
    Content: mod.default,
  };
}
