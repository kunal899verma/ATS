import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/blog";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await getAllPosts();

  return [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/analyze"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/cover-letter"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/interview-prep"), lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: absoluteUrl("/templates"), lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: absoluteUrl("/recruiter"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/tips"), lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: absoluteUrl("/pricing"), lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: absoluteUrl("/blog"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.75,
    })),
  ];
}
