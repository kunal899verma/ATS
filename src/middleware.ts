import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

// Routes that never require authentication
const PUBLIC_PREFIXES = [
  "/api/auth",          // NextAuth endpoints
  "/api/analytics",    // analytics beacon
  "/_next",            // Next.js internals
  "/favicon",
  "/robots",
  "/sitemap",
  "/og",
  "/login",
];

const PUBLIC_EXACT = ["/"];

function isPublic(pathname: string): boolean {
  if (PUBLIC_EXACT.includes(pathname)) return true;
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isLocalhost(req: NextRequest): boolean {
  const host = req.headers.get("host") ?? "";
  return host.startsWith("localhost") || host.startsWith("127.0.0.1");
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow public routes
  if (isPublic(pathname)) return NextResponse.next();

  // On localhost — no auth required for any route
  if (isLocalhost(req)) return NextResponse.next();

  // On live server — check session
  const session = await auth();
  if (!session?.user) {
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!_next/static|_next/image|favicon\\.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?)).*)",
  ],
};
