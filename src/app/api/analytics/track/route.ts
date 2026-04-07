import { NextRequest, NextResponse } from "next/server";
import {
  writeAnalyticsEvent,
  getGeoDetails,
  maskIp,
  parseUserAgent,
  createVisitorId,
  VISITOR_COOKIE_NAME,
} from "@/lib/visitor-analytics";
import { auth } from "@/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const body = await req.json().catch(() => ({}));
    const { pathname, referrer, title, screenResolution, timezone, language } = body as Record<string, string>;

    const geo = getGeoDetails(req.headers);
    const ip = maskIp(req.headers);
    const ua = req.headers.get("user-agent");
    const { browser, deviceType, os } = parseUserAgent(ua);

    const existingVisitorId = req.cookies.get(VISITOR_COOKIE_NAME)?.value;
    const visitorId = existingVisitorId ?? createVisitorId();

    await writeAnalyticsEvent({
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: "page_view",
      createdAt: new Date().toISOString(),
      visitorId,
      pathname: pathname ?? "/",
      referrer: referrer || undefined,
      title: title || undefined,
      ...geo,
      ip,
      browser,
      deviceType,
      os,
      userAgent: ua ?? undefined,
      userEmail: session?.user?.email ?? undefined,
      userName: session?.user?.name ?? undefined,
      screenResolution: screenResolution || undefined,
      timezone: timezone || undefined,
      language: language || undefined,
    });

    const res = NextResponse.json({ ok: true });

    if (!existingVisitorId) {
      res.cookies.set(VISITOR_COOKIE_NAME, visitorId, {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: "lax",
        path: "/",
      });
    }

    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
