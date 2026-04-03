import { NextRequest, NextResponse } from "next/server";

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
// NextAuth v5 uses JWE-encrypted tokens — getToken() from next-auth/jwt (v4)
// cannot decrypt them. We check cookie presence here; the real session
// validation (isAdminEmail, etc.) still happens inside each page via auth().
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

function hasSessionCookie(req: NextRequest): boolean {
  // NextAuth v5 uses __Secure-authjs.session-token on HTTPS (production)
  // and authjs.session-token on HTTP (development)
  return (
    req.cookies.has("__Secure-authjs.session-token") ||
    req.cookies.has("authjs.session-token")
  );
}

function applyAuthGuard(req: NextRequest): NextResponse | null {
  const { pathname } = req.nextUrl;

  if (isPublic(pathname)) return null;
  if (isLocalhost(req)) return null;
  if (hasSessionCookie(req)) return null;

  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  loginUrl.searchParams.set("callbackUrl", pathname);
  return NextResponse.redirect(loginUrl);
}

// ── Main proxy export ─────────────────────────────────────────────────────────
export function proxy(req: NextRequest) {
  const rateLimitRes = applyRateLimit(req);
  if (rateLimitRes) return rateLimitRes;

  const authRes = applyAuthGuard(req);
  if (authRes) return authRes;

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)).*)",
  ],
};
