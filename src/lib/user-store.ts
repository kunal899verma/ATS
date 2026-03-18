/**
 * User data store — works immediately via Vercel logs.
 * To add persistent storage, uncomment the Vercel KV section below
 * and add @vercel/kv to your project.
 */

export interface UserRecord {
  name: string;
  email: string;
  image: string;
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

  // ── Vercel KV (uncomment after running: npm i @vercel/kv) ─────────────────
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

  // ── Vercel KV ──────────────────────────────────────────────────────────────
  // const key = `user:${record.email}`;
  // await kv.hincrby(key, "analysisCount", 1);
  // await kv.hset(key, { lastAnalysisAt: record.analyzedAt, lastScore: record.score, lastRole: record.detectedRole });
}
