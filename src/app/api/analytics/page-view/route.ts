import { after } from "next/server";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import {
  createVisitorId,
  getGeoDetails,
  maskIp,
  parseUserAgent,
  VISITOR_COOKIE_NAME,
  writeAnalyticsEvent,
} from "@/lib/visitor-analytics";

export const runtime = "nodejs";

interface PageViewPayload {
  pathname?: string;
  referrer?: string;
  title?: string;
}

export async function POST(req: NextRequest) {
  let payload: PageViewPayload = {};

  try {
    payload = (await req.json()) as PageViewPayload;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid analytics payload." }, { status: 400 });
  }

  const pathname = typeof payload.pathname === "string" ? payload.pathname : "/";
  if (!pathname.startsWith("/") || pathname.startsWith("/api")) {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const visitorId = req.cookies.get(VISITOR_COOKIE_NAME)?.value ?? createVisitorId();
  const session = await auth();
  const userAgent = req.headers.get("user-agent");
  const geo = getGeoDetails(req.headers);
  const ua = parseUserAgent(userAgent);

  after(() =>
    writeAnalyticsEvent({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "page_view",
      createdAt: new Date().toISOString(),
      visitorId,
      pathname,
      referrer: payload.referrer || req.headers.get("referer") || undefined,
      title: payload.title,
      method: req.method,
      country: geo.country,
      region: geo.region,
      city: geo.city,
      ip: maskIp(req.headers),
      browser: ua.browser,
      deviceType: ua.deviceType,
      userAgent: userAgent ?? undefined,
      userEmail: session?.user?.email ?? undefined,
      userName: session?.user?.name ?? undefined,
      userImage: session?.user?.image ?? undefined,
      userPhone: (session?.user as { phone?: string | null } | undefined)?.phone ?? undefined,
      provider: (session?.user as { provider?: string } | undefined)?.provider,
    })
  );

  const response = NextResponse.json({ ok: true });

  if (!req.cookies.get(VISITOR_COOKIE_NAME)?.value) {
    response.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
      httpOnly: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
      path: "/",
    });
  }

  return response;
}
