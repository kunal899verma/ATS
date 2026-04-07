/**
 * User data store — analytics events are written to Supabase.
 */

import { createVisitorId, writeAnalyticsEvent } from "@/lib/visitor-analytics";
import type { AnalyticsEvent } from "@/lib/visitor-analytics";

export interface UserRecord {
  name: string;
  email: string;
  image: string;
  phone?: string;
  provider: string;
  signedUpAt: string;
  country?: string;
  region?: string;
  city?: string;
  browser?: string;
  deviceType?: AnalyticsEvent["deviceType"];
  os?: string;
  ip?: string;
}

export interface AnalysisRecord {
  email: string;
  score: number;
  grade: string;
  detectedRole: string;
  inputMode: string;
  analyzedAt: string;
  visitorId?: string;
  country?: string;
  region?: string;
  city?: string;
  browser?: string;
  deviceType?: AnalyticsEvent["deviceType"];
  os?: string;
  timezone?: string;
  language?: string;
  screenResolution?: string;
}

/** Called on every new sign-in. Logs to Vercel deployment logs. */
export async function saveUser(user: UserRecord): Promise<void> {
  console.log("[NEW_USER]", JSON.stringify(user));
  await writeAnalyticsEvent({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "sign_in",
    createdAt: new Date().toISOString(),
    visitorId: createVisitorId(),
    userEmail: user.email,
    userName: user.name,
    userImage: user.image,
    userPhone: user.phone,
    provider: user.provider,
    signUpAt: user.signedUpAt,
    country: user.country,
    region: user.region,
    city: user.city,
    browser: user.browser,
    deviceType: user.deviceType,
    os: user.os,
    ip: user.ip,
  });

}

/**
 * Extracts name, email, and phone from raw resume text.
 * Used to identify anonymous (not logged-in) users who upload resumes.
 */
export function extractContactFromResume(resumeText: string): {
  name?: string;
  email?: string;
  phone?: string;
} {
  // Email: first match in the document
  const emailMatch = resumeText.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/);
  const email = emailMatch?.[0]?.toLowerCase();

  // Phone: 10–15 digit patterns, optional leading ( or +
  const phoneMatch = resumeText.match(
    /(\+?[(]?\d[\d\s\-().]{8,14}\d)/
  );
  const phone = phoneMatch?.[0]?.replace(/\s+/g, " ").trim();

  // Name: scan first 8 non-empty lines for the most name-like line
  const lines = resumeText.split("\n").map((l) => l.trim()).filter(Boolean);
  let name: string | undefined;
  for (const line of lines.slice(0, 8)) {
    if (line.includes("@")) continue;           // email line
    if ((line.match(/\d/g) ?? []).length > 3) continue; // phone / date-heavy
    if (/https?:|www\.|linkedin|github/i.test(line)) continue;
    if (line.length < 2 || line.length > 55) continue;
    // Looks like a name: starts uppercase, only letters/spaces/hyphens/apostrophes
    if (/^[A-Z][a-zA-Z'-]+([\s][A-Z][a-zA-Z'-]+)+$/.test(line)) {
      name = line;
      break;
    }
  }

  return { name, email, phone };
}

export interface AnonymousAnalysisRecord {
  visitorId: string;
  score: number;
  grade: string;
  detectedRole: string;
  inputMode: string;
  analyzedAt: string;
  extractedName?: string;
  extractedEmail?: string;
  extractedPhone?: string;
  country?: string;
  region?: string;
  city?: string;
  browser?: string;
  deviceType?: AnalyticsEvent["deviceType"];
  os?: string;
  timezone?: string;
  language?: string;
  screenResolution?: string;
}

/** Called after each resume analysis for non-logged-in users. Stores resume-extracted contact info. */
export async function trackAnonymousAnalysis(record: AnonymousAnalysisRecord): Promise<void> {
  console.log("[ANONYMOUS_ANALYSIS]", JSON.stringify(record));
  await writeAnalyticsEvent({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "analysis",
    createdAt: record.analyzedAt,
    visitorId: record.visitorId,
    userEmail: record.extractedEmail,
    userName: record.extractedName,
    userPhone: record.extractedPhone,
    score: record.score,
    grade: record.grade,
    detectedRole: record.detectedRole,
    inputMode: record.inputMode,
    isAnonymous: true,
    country: record.country,
    region: record.region,
    city: record.city,
    browser: record.browser,
    deviceType: record.deviceType,
    os: record.os,
    timezone: record.timezone,
    language: record.language,
    screenResolution: record.screenResolution,
  });
}

/** Called after each resume analysis (for logged-in users). */
export async function trackAnalysis(record: AnalysisRecord): Promise<void> {
  console.log("[USER_ANALYSIS]", JSON.stringify(record));
  await writeAnalyticsEvent({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "analysis",
    createdAt: record.analyzedAt,
    visitorId: record.visitorId ?? createVisitorId(),
    userEmail: record.email,
    userName: record.email,
    score: record.score,
    grade: record.grade,
    detectedRole: record.detectedRole,
    inputMode: record.inputMode,
    country: record.country,
    region: record.region,
    city: record.city,
    browser: record.browser,
    deviceType: record.deviceType,
    os: record.os,
    timezone: record.timezone,
    language: record.language,
    screenResolution: record.screenResolution,
  });

  // ── Example persistent storage adapter ────────────────────────────────────
  // const key = `user:${record.email}`;
  // await kv.hincrby(key, "analysisCount", 1);
  // await kv.hset(key, { lastAnalysisAt: record.analyzedAt, lastScore: record.score, lastRole: record.detectedRole });
}
