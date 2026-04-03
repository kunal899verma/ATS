/**
 * User data store — works immediately via Vercel logs.
 * For a richer owner dashboard, analytics events are also mirrored to Blob storage
 * when BLOB_READ_WRITE_TOKEN is configured.
 */

import { createVisitorId, writeAnalyticsEvent } from "@/lib/visitor-analytics";

export interface UserRecord {
  name: string;
  email: string;
  image: string;
  phone?: string;
  provider: string;
  signedUpAt: string;
}

export interface AnalysisRecord {
  email: string;
  score: number;
  grade: string;
  detectedRole: string;
  inputMode: string;
  analyzedAt: string;
}

/** Called on every new sign-in. Logs to Vercel deployment logs. */
export async function saveUser(user: UserRecord): Promise<void> {
  // Visible in Vercel Dashboard → Logs → search "NEW_USER"
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
  });

  // ── Example persistent storage adapters (optional) ────────────────────────
  // import { kv } from "@vercel/kv";
  // const key = `user:${user.email}`;
  // const existing = await kv.hget(key, "email");
  // if (!existing) {
  //   await kv.hset(key, { ...user, analysisCount: 0 });
  //   await kv.zadd("users:by_signup", { score: Date.now(), member: user.email });
  // }

  // ── Supabase (uncomment after: npm i @supabase/supabase-js) ───────────────
  // import { createClient } from "@supabase/supabase-js";
  // const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_KEY!);
  // await supabase.from("users").upsert(user, { onConflict: "email" });
}

/** Called after each resume analysis (for logged-in users). */
export async function trackAnalysis(record: AnalysisRecord): Promise<void> {
  // Visible in Vercel Dashboard → Logs → search "USER_ANALYSIS"
  console.log("[USER_ANALYSIS]", JSON.stringify(record));
  await writeAnalyticsEvent({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    type: "analysis",
    createdAt: record.analyzedAt,
    visitorId: createVisitorId(),
    userEmail: record.email,
    userName: record.email,
    score: record.score,
    grade: record.grade,
    detectedRole: record.detectedRole,
    inputMode: record.inputMode,
  });

  // ── Example persistent storage adapter ────────────────────────────────────
  // const key = `user:${record.email}`;
  // await kv.hincrby(key, "analysisCount", 1);
  // await kv.hset(key, { lastAnalysisAt: record.analyzedAt, lastScore: record.score, lastRole: record.detectedRole });
}
