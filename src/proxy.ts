import { NextRequest, NextResponse } from "next/server";

// Simple in-memory rate limiter for the analyze API
// For production scale, replace with Redis (Upstash) — this works for Vercel Serverless
const rateMap = new Map<string, { count: number; resetAt: number }>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS = 10;       // 10 analyze requests per minute per IP

export function proxy(req: NextRequest) {
  // Only rate-limit the analyze API endpoint
  if (!req.nextUrl.pathname.startsWith("/api/analyze")) {
    return NextResponse.next();
  }

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (entry.count >= MAX_REQUESTS) {
    return NextResponse.json(
      {
        error: "Too many requests. You can analyze up to 10 resumes per minute. Please wait a moment.",
        retryAfter: Math.ceil((entry.resetAt - now) / 1000),
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(Math.ceil((entry.resetAt - now) / 1000)),
          "X-RateLimit-Limit": String(MAX_REQUESTS),
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  entry.count += 1;
  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
