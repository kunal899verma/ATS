import { NextRequest, NextResponse } from "next/server";
import {
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

    // Only persist sign_in and analysis events to Blob to stay within operation limits.
    // Page views are logged to console only (visible in Vercel Logs).
    console.log("[PAGE_VIEW]", JSON.stringify({
      visitorId,
      pathname: pathname ?? "/",
      ...geo,
      browser,
      deviceType,
      os,
      userEmail: session?.user?.email ?? undefined,
    }));

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
