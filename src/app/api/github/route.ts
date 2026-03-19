import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

interface GitHubUser {
  login: string;
  name: string | null;
  bio: string | null;
  blog: string | null;
  company: string | null;
  public_repos: number;
  followers: number;
  following: number;
  public_gists: number;
  created_at: string;
}

interface GitHubRepo {
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  fork: boolean;
  updated_at: string;
}

export interface GitHubAnalysis {
  username: string;
  profileUrl: string;
  score: number;
  stats: {
    totalRepos: number;
    originalRepos: number;
    followers: number;
    totalStars: number;
    languages: string[];
    bio: string | null;
    name: string | null;
  };
  breakdown: {
    repos: number;
    followers: number;
    stars: number;
    profile: number;
    diversity: number;
  };
}

function extractUsername(raw: string): string | null {
  const url = raw.trim().replace(/\/$/, "");
  const match = url.match(/(?:github\.com\/)([a-zA-Z0-9_.-]+)/i);
  if (match) return match[1];
  if (/^[a-zA-Z0-9_.-]+$/.test(url)) return url;
  return null;
}

export async function GET(req: NextRequest) {
  const raw = req.nextUrl.searchParams.get("url") ?? "";
  const username = extractUsername(raw);

  if (!username) {
    return NextResponse.json({ error: "Invalid GitHub URL or username." }, { status: 400 });
  }

  const headers: HeadersInit = {
    Accept: "application/vnd.github.v3+json",
    "User-Agent": "ResumeATS-Analyzer",
  };
  if (process.env.GITHUB_API_TOKEN) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${process.env.GITHUB_API_TOKEN}`;
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers }),
      fetch(`https://api.github.com/users/${username}/repos?sort=pushed&per_page=30`, { headers }),
    ]);

    if (userRes.status === 404) {
      return NextResponse.json({ error: `GitHub user "${username}" not found.` }, { status: 404 });
    }
    if (userRes.status === 403 || userRes.status === 429) {
      return NextResponse.json({ error: "GitHub API rate limit reached. Try again in a few minutes." }, { status: 429 });
    }
    if (!userRes.ok) {
      return NextResponse.json({ error: "Failed to fetch GitHub profile." }, { status: 502 });
    }

    const user: GitHubUser = await userRes.json();
    const repos: GitHubRepo[] = reposRes.ok ? await reposRes.json() : [];
    const originals = repos.filter((r) => !r.fork);

    // ── Score calculation (total 100) ──────────────────────────────────────────
    // Repos: max 25
    let reposScore = 0;
    if (originals.length >= 20) reposScore = 25;
    else if (originals.length >= 10) reposScore = 18;
    else if (originals.length >= 5)  reposScore = 12;
    else if (originals.length >= 2)  reposScore = 6;
    else if (originals.length >= 1)  reposScore = 3;

    // Followers: max 20
    let followersScore = 0;
    if (user.followers >= 500)      followersScore = 20;
    else if (user.followers >= 100) followersScore = 15;
    else if (user.followers >= 30)  followersScore = 10;
    else if (user.followers >= 10)  followersScore = 6;
    else if (user.followers >= 1)   followersScore = 3;

    // Stars across original repos: max 25
    const totalStars = originals.reduce((s, r) => s + r.stargazers_count, 0);
    let starsScore = 0;
    if (totalStars >= 500)      starsScore = 25;
    else if (totalStars >= 100) starsScore = 18;
    else if (totalStars >= 25)  starsScore = 12;
    else if (totalStars >= 5)   starsScore = 6;
    else if (totalStars >= 1)   starsScore = 3;

    // Profile completeness: max 15
    let profileScore = 5; // base for having a profile
    if (user.bio && user.bio.length > 10) profileScore += 5;
    if (user.blog)    profileScore += 3;
    if (user.company) profileScore += 2;

    // Language diversity: max 15
    const languages = [...new Set(repos.map((r) => r.language).filter((l): l is string => !!l))];
    let diversityScore = 0;
    if (languages.length >= 6)      diversityScore = 15;
    else if (languages.length >= 4) diversityScore = 11;
    else if (languages.length >= 2) diversityScore = 7;
    else if (languages.length >= 1) diversityScore = 4;

    const totalScore = Math.min(100, reposScore + followersScore + starsScore + profileScore + diversityScore);

    const analysis: GitHubAnalysis = {
      username,
      profileUrl: `https://github.com/${username}`,
      score: totalScore,
      stats: {
        totalRepos: user.public_repos,
        originalRepos: originals.length,
        followers: user.followers,
        totalStars,
        languages,
        bio: user.bio,
        name: user.name,
      },
      breakdown: {
        repos: reposScore,
        followers: followersScore,
        stars: starsScore,
        profile: profileScore,
        diversity: diversityScore,
      },
    };

    return NextResponse.json(analysis, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch (err) {
    console.error("[GitHub Analysis Error]", err);
    return NextResponse.json({ error: "Failed to analyze GitHub profile." }, { status: 500 });
  }
}
