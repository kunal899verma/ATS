import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "https://resumeats.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  return [
    { url: BASE, lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE}/analyze`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE}/tips`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/recruiter`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${BASE}/templates`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${BASE}/pricing`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE}/blog/how-to-beat-ats-resume-scanners`, lastModified: new Date("2026-03-10"), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/blog/ats-resume-keywords-guide`, lastModified: new Date("2026-03-10"), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/blog/what-is-ats-score`, lastModified: new Date("2026-03-10"), changeFrequency: "monthly", priority: 0.75 },
    { url: `${BASE}/blog/resume-formatting-for-ats`, lastModified: new Date("2026-03-10"), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE}/blog/jobscan-alternatives-free`, lastModified: new Date("2026-03-10"), changeFrequency: "monthly", priority: 0.7 },
  ];
}
