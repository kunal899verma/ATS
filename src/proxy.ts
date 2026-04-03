import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

// ── Rate limiter for /api/analyze ────────────────────────────────────────────
const rateMap = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 60 * 1000;
const MAX_REQUESTS = 10;

function applyRateLimit(req: NextRequest): NextResponse | null {
  if (!req.nextUrl.pathname.startsWith("/api/analyze")) return null;

  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown";

  const now = Date.now();
  const entry = rateMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return null;
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
  return null;
}

// ── Auth guard (production only) ─────────────────────────────────────────────
const PUBLIC_PREFIXES = [
  "/api/auth",
  "/api/analytics",
  "/_next",
  "/favicon",
  "/robots",
  "/sitemap",
  "/og",
  "/login",
];
const PUBLIC_EXACT = ["/"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((p) => pathname.startsWith(p));
}

function isLocalhost(req: NextRequest): boolean {
  const host = req.headers.get("host") ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

async function applyAuthGuard(req: NextRequest): Promise<NextResponse | null> {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return null;
  if (isLocalhost(req)) return null;

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName: "__Secure-authjs.session-token",
    secureCookie: true,
  });

  if (!token) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return null;
}

// ── Main proxy export ─────────────────────────────────────────────────────────
export async function proxy(req: NextRequest) {
  const rateLimitRes = applyRateLimit(req);
  if (rateLimitRes) return rateLimitRes;

  const authRes = await applyAuthGuard(req);
  if (authRes) return authRes;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)).*)",
  ],
};
