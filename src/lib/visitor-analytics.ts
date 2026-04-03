import { get, list, put } from "@vercel/blob";

export const VISITOR_COOKIE_NAME = "ats_visitor_id";
const ANALYTICS_PREFIX = "analytics/events";

export type AnalyticsEventType = "page_view" | "sign_in" | "analysis";

export interface AnalyticsEvent {
  id: string;
  type: AnalyticsEventType;
  createdAt: string;
  visitorId: string;
  pathname?: string;
  referrer?: string;
  title?: string;
  method?: string;
  country?: string;
  region?: string;
  city?: string;
  ip?: string;
  browser?: string;
  deviceType?: "mobile" | "tablet" | "desktop" | "bot" | "unknown";
  userAgent?: string;
  userEmail?: string;
  userName?: string;
  provider?: string;
  score?: number;
  grade?: string;
  detectedRole?: string;
  inputMode?: string;
}

export interface AnalyticsSnapshot {
  configured: boolean;
  recentEvents: AnalyticsEvent[];
  totalEvents: number;
  totalPageViews: number;
  uniqueVisitors: number;
  signedInUsers: number;
  analysesRun: number;
  signIns: number;
  topPages: Array<{ label: string; count: number }>;
  topLocations: Array<{ label: string; count: number }>;
  recentUsers: Array<{
    email: string;
    name: string;
    visits: number;
    analyses: number;
    lastSeen: string;
    location: string;
    providers: string[];
  }>;
}

function getBlobToken() {
  return process.env.BLOB_READ_WRITE_TOKEN;
}

export function isAnalyticsStorageConfigured() {
  return Boolean(getBlobToken());
}

export function createVisitorId() {
  return `v_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

export function isAdminEmail(email?: string | null) {
  if (!email) return false;
  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  const allowList = new Set(["admin@test.com", ...configured]);
  return allowList.has(email.toLowerCase());
}

export function getGeoDetails(headers: Headers) {
  return {
    country: headers.get("x-vercel-ip-country") ?? undefined,
    region: headers.get("x-vercel-ip-country-region") ?? undefined,
    city: headers.get("x-vercel-ip-city") ?? undefined,
  };
}

export function maskIp(headers: Headers) {
  const forwarded = headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const realIp = headers.get("x-real-ip")?.trim();
  const ip = forwarded || realIp;

  if (!ip) return undefined;

  if (ip.includes(":")) {
    const parts = ip.split(":").filter(Boolean);
    return `${parts.slice(0, 4).join(":")}:*`;
  }

  const octets = ip.split(".");
  if (octets.length === 4) {
    return `${octets[0]}.${octets[1]}.*.*`;
  }

  return undefined;
}

export function parseUserAgent(userAgent?: string | null) {
  const ua = userAgent ?? "";
  const lower = ua.toLowerCase();

  const browser = lower.includes("edg/")
    ? "Edge"
    : lower.includes("chrome/")
      ? "Chrome"
      : lower.includes("safari/") && !lower.includes("chrome/")
        ? "Safari"
        : lower.includes("firefox/")
          ? "Firefox"
          : lower.includes("bot") || lower.includes("crawler") || lower.includes("spider")
            ? "Bot"
            : "Unknown";

  const deviceType = lower.includes("bot") || lower.includes("crawler") || lower.includes("spider")
    ? "bot"
    : lower.includes("ipad") || lower.includes("tablet")
      ? "tablet"
      : lower.includes("mobi") || lower.includes("android")
        ? "mobile"
        : ua
          ? "desktop"
          : "unknown";

  return { browser, deviceType: deviceType as AnalyticsEvent["deviceType"] };
}

function buildEventPath(event: AnalyticsEvent) {
  const timestamp = event.createdAt.replace(/[:.]/g, "-");
  const date = new Date(event.createdAt);
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");

  return `${ANALYTICS_PREFIX}/${year}/${month}/${day}/${timestamp}-${event.id}.json`;
}

export async function writeAnalyticsEvent(event: AnalyticsEvent) {
  console.log("[ANALYTICS_EVENT]", JSON.stringify(event));

  const token = getBlobToken();
  if (!token) return;

  try {
    await put(buildEventPath(event), JSON.stringify(event), {
      access: "private",
      contentType: "application/json",
      token,
      addRandomSuffix: false,
      cacheControlMaxAge: 60,
    });
  } catch (error) {
    console.error("[ANALYTICS_STORAGE_ERROR]", error);
  }
}

async function readAnalyticsEvent(pathname: string) {
  const token = getBlobToken();
  if (!token) return null;

  try {
    const result = await get(pathname, {
      access: "private",
      token,
      useCache: false,
    });

    if (!result || result.statusCode !== 200 || !result.stream) {
      return null;
    }

    const raw = await new Response(result.stream).text();
    return JSON.parse(raw) as AnalyticsEvent;
  } catch (error) {
    console.error("[ANALYTICS_READ_ERROR]", { pathname, error });
    return null;
  }
}

export async function getRecentAnalyticsEvents(limit = 120) {
  const token = getBlobToken();
  if (!token) return [];

  const blobs = [];
  let cursor: string | undefined;

  while (blobs.length < limit) {
    const page = await list({
      token,
      prefix: `${ANALYTICS_PREFIX}/`,
      limit: Math.min(limit, 100),
      cursor,
    });

    blobs.push(...page.blobs);

    if (!page.hasMore || !page.cursor) break;
    cursor = page.cursor;
  }

  const recent = blobs
    .sort((a, b) => b.pathname.localeCompare(a.pathname))
    .slice(0, limit);

  const events = await Promise.all(recent.map((blob) => readAnalyticsEvent(blob.pathname)));
  return events.filter((event): event is AnalyticsEvent => Boolean(event));
}

function takeTopEntries(source: Map<string, number>, limit = 6) {
  return [...source.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([label, count]) => ({ label, count }));
}

function formatLocation(event: AnalyticsEvent) {
  return [event.city, event.region, event.country].filter(Boolean).join(", ") || "Unknown";
}

export async function getAnalyticsSnapshot(limit = 120): Promise<AnalyticsSnapshot> {
  const events = await getRecentAnalyticsEvents(limit);

  const visitorIds = new Set<string>();
  const signedInUsers = new Set<string>();
  const topPages = new Map<string, number>();
  const topLocations = new Map<string, number>();
  const users = new Map<string, AnalyticsSnapshot["recentUsers"][number]>();

  let totalPageViews = 0;
  let analysesRun = 0;
  let signIns = 0;

  for (const event of events) {
    visitorIds.add(event.visitorId);

    if (event.type === "page_view") {
      totalPageViews += 1;
      if (event.pathname) {
        topPages.set(event.pathname, (topPages.get(event.pathname) ?? 0) + 1);
      }
    }

    if (event.type === "analysis") analysesRun += 1;
    if (event.type === "sign_in") signIns += 1;

    const location = formatLocation(event);
    topLocations.set(location, (topLocations.get(location) ?? 0) + 1);

    if (event.userEmail) {
      signedInUsers.add(event.userEmail);
      const existing = users.get(event.userEmail);

      if (existing) {
        existing.visits += event.type === "page_view" ? 1 : 0;
        existing.analyses += event.type === "analysis" ? 1 : 0;
        existing.lastSeen = event.createdAt > existing.lastSeen ? event.createdAt : existing.lastSeen;
        existing.location = location !== "Unknown" ? location : existing.location;
        if (event.provider && !existing.providers.includes(event.provider)) {
          existing.providers.push(event.provider);
        }
      } else {
        users.set(event.userEmail, {
          email: event.userEmail,
          name: event.userName || event.userEmail,
          visits: event.type === "page_view" ? 1 : 0,
          analyses: event.type === "analysis" ? 1 : 0,
          lastSeen: event.createdAt,
          location,
          providers: event.provider ? [event.provider] : [],
        });
      }
    }
  }

  return {
    configured: isAnalyticsStorageConfigured(),
    recentEvents: events,
    totalEvents: events.length,
    totalPageViews,
    uniqueVisitors: visitorIds.size,
    signedInUsers: signedInUsers.size,
    analysesRun,
    signIns,
    topPages: takeTopEntries(topPages),
    topLocations: takeTopEntries(topLocations),
    recentUsers: [...users.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)).slice(0, 12),
  };
}
