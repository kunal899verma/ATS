import { createClient } from "@/utils/supabase/server";

export const VISITOR_COOKIE_NAME = "ats_visitor_id";

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
  isAnonymous?: boolean;
}

export interface AnalyticsSnapshot {
  configured: boolean;
  storageError?: string;
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
  unregisteredUsers: Array<{
    visitorId: string;
    name?: string;
    email?: string;
    phone?: string;
    analyses: number;
    lastSeen: string;
    firstSeen: string;
    location: string;
    lastDevice: string;
    lastBrowser: string;
    os: string[];
    lastScore?: number;
    lastGrade?: string;
    lastRole?: string;
    timezone?: string;
    language?: string;
    screenResolution?: string;
  }>;
}

function createEmptySnapshot(configured = isAnalyticsStorageConfigured(), storageError?: string): AnalyticsSnapshot {
  return {
    configured,
    storageError,
    recentEvents: [],
    totalEvents: 0,
    totalPageViews: 0,
    uniqueVisitors: 0,
    signedInUsers: 0,
    analysesRun: 0,
    signIns: 0,
    topPages: [],
    topLocations: [],
    recentUsers: [],
    unregisteredUsers: [],
  };
}

export function isAnalyticsStorageConfigured() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
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

export async function writeAnalyticsEvent(event: AnalyticsEvent) {
  console.log("[ANALYTICS_EVENT]", JSON.stringify(event));

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("analytics_events").insert({
      id: event.id,
      type: event.type,
      created_at: event.createdAt,
      visitor_id: event.visitorId,
      pathname: event.pathname,
      referrer: event.referrer,
      title: event.title,
      country: event.country,
      region: event.region,
      city: event.city,
      ip: event.ip,
      browser: event.browser,
      device_type: event.deviceType,
      user_agent: event.userAgent,
      os: event.os,
      user_email: event.userEmail,
      user_name: event.userName,
      user_image: event.userImage,
      user_phone: event.userPhone,
      provider: event.provider,
      score: event.score,
      grade: event.grade,
      detected_role: event.detectedRole,
      input_mode: event.inputMode,
      language: event.language,
      timezone: event.timezone,
      screen_resolution: event.screenResolution,
      sign_up_at: event.signUpAt,
      is_anonymous: event.isAnonymous,
    });
    if (error) console.error("[ANALYTICS_STORAGE_ERROR]", error);
  } catch (error) {
    console.error("[ANALYTICS_STORAGE_ERROR]", error);
  }
}

export async function getRecentAnalyticsEvents(limit = 200) {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from("analytics_events")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[ANALYTICS_LIST_ERROR]", error);
      return [];
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      type: row.type as AnalyticsEventType,
      createdAt: row.created_at,
      visitorId: row.visitor_id,
      pathname: row.pathname,
      referrer: row.referrer,
      title: row.title,
      country: row.country,
      region: row.region,
      city: row.city,
      ip: row.ip,
      browser: row.browser,
      deviceType: row.device_type,
      userAgent: row.user_agent,
      os: row.os,
      userEmail: row.user_email,
      userName: row.user_name,
      userImage: row.user_image,
      userPhone: row.user_phone,
      provider: row.provider,
      score: row.score,
      grade: row.grade,
      detectedRole: row.detected_role,
      inputMode: row.input_mode,
      language: row.language,
      timezone: row.timezone,
      screenResolution: row.screen_resolution,
      signUpAt: row.sign_up_at,
      isAnonymous: row.is_anonymous,
    })) as AnalyticsEvent[];
  } catch (error) {
    console.error("[ANALYTICS_LIST_ERROR]", error);
    return [];
  }
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

// Cache snapshot for 5 minutes to avoid re-reading all blobs on every dashboard visit
let snapshotCache: { snapshot: AnalyticsSnapshot; expiresAt: number } | null = null;

export async function getAnalyticsSnapshot(limit = 120): Promise<AnalyticsSnapshot> {
  if (snapshotCache && Date.now() < snapshotCache.expiresAt) {
    return snapshotCache.snapshot;
  }

  try {
    const events = await getRecentAnalyticsEvents(limit);

    const visitorIds = new Set<string>();
    const signedInUsers = new Set<string>();
    const topPages = new Map<string, number>();
    const topLocations = new Map<string, number>();
    const users = new Map<string, AnalyticsSnapshot["recentUsers"][number]>();
    const unregistered = new Map<string, AnalyticsSnapshot["unregisteredUsers"][number]>();

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

      // Aggregate anonymous resume uploaders (non-logged-in users who uploaded a resume)
      if (event.isAnonymous && event.type === "analysis") {
        const key = event.visitorId;
        const existing = unregistered.get(key);
        if (existing) {
          existing.analyses += 1;
          existing.lastSeen = event.createdAt > existing.lastSeen ? event.createdAt : existing.lastSeen;
          existing.firstSeen = event.createdAt < existing.firstSeen ? event.createdAt : existing.firstSeen;
          if (!existing.name && event.userName) existing.name = event.userName;
          if (!existing.email && event.userEmail) existing.email = event.userEmail;
          if (!existing.phone && event.userPhone) existing.phone = event.userPhone;
          const loc = formatLocation(event);
          if (loc !== "Unknown") existing.location = loc;
          const dev = formatDevice(event);
          if (dev !== "Unknown") {
            existing.lastDevice = dev;
            existing.lastBrowser = event.browser || existing.lastBrowser;
          }
          if (event.os && !existing.os.includes(event.os)) existing.os.push(event.os);
          existing.lastScore = event.score ?? existing.lastScore;
          existing.lastGrade = event.grade ?? existing.lastGrade;
          existing.lastRole = event.detectedRole ?? existing.lastRole;
          existing.timezone = event.timezone ?? existing.timezone;
          existing.language = event.language ?? existing.language;
          existing.screenResolution = event.screenResolution ?? existing.screenResolution;
        } else {
          unregistered.set(key, {
            visitorId: key,
            name: event.userName,
            email: event.userEmail,
            phone: event.userPhone,
            analyses: 1,
            lastSeen: event.createdAt,
            firstSeen: event.createdAt,
            location: formatLocation(event),
            lastDevice: formatDevice(event),
            lastBrowser: event.browser || "Unknown",
            os: event.os ? [event.os] : [],
            lastScore: event.score,
            lastGrade: event.grade,
            lastRole: event.detectedRole,
            timezone: event.timezone,
            language: event.language,
            screenResolution: event.screenResolution,
          });
        }
      }

      if (event.userEmail && !event.isAnonymous) {
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

    const snapshot: AnalyticsSnapshot = {
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
      unregisteredUsers: [...unregistered.values()].sort((a, b) => b.lastSeen.localeCompare(a.lastSeen)).slice(0, 50),
    };
    snapshotCache = { snapshot, expiresAt: Date.now() + 5 * 60 * 1000 };
    return snapshot;
  } catch (error) {
    console.error("[ANALYTICS_SNAPSHOT_ERROR]", error);
    return createEmptySnapshot(isAnalyticsStorageConfigured(), "Analytics storage is temporarily unavailable.");
  }
}
