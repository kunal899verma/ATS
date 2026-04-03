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
  userImage?: string;
  userPhone?: string;
  provider?: string;
  score?: number;
  grade?: string;
  detectedRole?: string;
  inputMode?: string;
  os?: string;
  language?: string;
  timezone?: string;
  screenResolution?: string;
  signUpAt?: string;
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
    image?: string;
    phone?: string;
    visits: number;
    analyses: number;
    signIns: number;
    lastSeen: string;
    firstSeen: string;
    signUpAt?: string;
    location: string;
    lastDevice: string;
    lastBrowser: string;
    providers: string[];
    devices: string[];
    browsers: string[];
    lastScore?: number;
    lastGrade?: string;
    lastRole?: string;
    os: string[];
    timezone?: string;
    language?: string;
    screenResolution?: string;
    pagesVisited: string[];
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
  const normalize = (value: string) => {
    const trimmed = value.trim().toLowerCase();
    const [localPart, domain = ""] = trimmed.split("@");
    const normalizedLocal = localPart.includes("+")
      ? localPart.split("+")[0]
      : localPart;
    return domain ? `${normalizedLocal}@${domain}` : trimmed;
  };

  const configured = (process.env.ADMIN_EMAILS ?? "")
    .split(/[,\n]/)
    .map((value) => normalize(value))
    .filter(Boolean);

  const allowList = new Set(configured);
  return allowList.has(normalize(email));
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

  const os = lower.includes("windows") ? "Windows"
    : lower.includes("iphone") || lower.includes("ipad") ? "iOS"
    : lower.includes("android") ? "Android"
    : lower.includes("mac os x") || lower.includes("macos") ? "macOS"
    : lower.includes("cros") || lower.includes("chromeos") ? "ChromeOS"
    : lower.includes("linux") ? "Linux"
    : "Unknown";

  return { browser, deviceType: deviceType as AnalyticsEvent["deviceType"], os };
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

function formatDevice(event: AnalyticsEvent) {
  return [event.browser, event.deviceType].filter(Boolean).join(" · ") || "Unknown";
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
        existing.signIns += event.type === "sign_in" ? 1 : 0;
        existing.lastSeen = event.createdAt > existing.lastSeen ? event.createdAt : existing.lastSeen;
        existing.firstSeen = event.createdAt < existing.firstSeen ? event.createdAt : existing.firstSeen;
        existing.location = location !== "Unknown" ? location : existing.location;
        existing.lastDevice = formatDevice(event) !== "Unknown" ? formatDevice(event) : existing.lastDevice;
        existing.lastBrowser = event.browser || existing.lastBrowser;
        existing.image = event.userImage || existing.image;
        existing.phone = event.userPhone || existing.phone;
        if (event.provider && !existing.providers.includes(event.provider)) {
          existing.providers.push(event.provider);
        }
        if (event.deviceType && !existing.devices.includes(event.deviceType)) {
          existing.devices.push(event.deviceType);
        }
        if (event.browser && !existing.browsers.includes(event.browser)) {
          existing.browsers.push(event.browser);
        }
        if (event.type === "analysis") {
          existing.lastScore = event.score ?? existing.lastScore;
          existing.lastGrade = event.grade ?? existing.lastGrade;
          existing.lastRole = event.detectedRole ?? existing.lastRole;
        }
        if (event.type === "sign_in" && event.signUpAt) {
          existing.signUpAt = event.signUpAt;
        }
        if (event.os && !existing.os.includes(event.os)) {
          existing.os.push(event.os);
        }
        existing.timezone = event.timezone ?? existing.timezone;
        existing.language = event.language ?? existing.language;
        existing.screenResolution = event.screenResolution ?? existing.screenResolution;
        if (event.type === "page_view" && event.pathname) {
          if (!existing.pagesVisited.includes(event.pathname)) {
            existing.pagesVisited = [...existing.pagesVisited, event.pathname].slice(0, 10);
          }
        }
      } else {
        users.set(event.userEmail, {
          email: event.userEmail,
          name: event.userName || event.userEmail,
          image: event.userImage,
          phone: event.userPhone,
          visits: event.type === "page_view" ? 1 : 0,
          analyses: event.type === "analysis" ? 1 : 0,
          signIns: event.type === "sign_in" ? 1 : 0,
          lastSeen: event.createdAt,
          firstSeen: event.createdAt,
          signUpAt: event.type === "sign_in" ? event.signUpAt : undefined,
          location,
          lastDevice: formatDevice(event),
          lastBrowser: event.browser || "Unknown",
          providers: event.provider ? [event.provider] : [],
          devices: event.deviceType ? [event.deviceType] : [],
          browsers: event.browser ? [event.browser] : [],
          lastScore: event.type === "analysis" ? event.score : undefined,
          lastGrade: event.type === "analysis" ? event.grade : undefined,
          lastRole: event.type === "analysis" ? event.detectedRole : undefined,
          os: event.os ? [event.os] : [],
          timezone: event.timezone,
          language: event.language,
          screenResolution: event.screenResolution,
          pagesVisited: event.type === "page_view" && event.pathname ? [event.pathname] : [],
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
