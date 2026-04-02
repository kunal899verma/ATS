import { NextRequest, NextResponse } from "next/server";
import { generateWithFallback } from "@/lib/ai/provider";
import type { AIResponse } from "@/types";

export const runtime = "nodejs";

// ─── Rate limiting (3 req/min per IP) ────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRL(ip: string): boolean {
  const now = Date.now();
  const window = 60_000;
  const limit = 3;

  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + window });
    return true;
  }
  if (entry.count >= limit) return false;
  entry.count++;
  return true;
}

// ─── JSON extraction helper ───────────────────────────────────────────────────
function extractJSON(text: string): AIResponse {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");
  const parsed = JSON.parse(jsonMatch[0]);

  if (
    !Array.isArray(parsed.bulletImprovements) ||
    !Array.isArray(parsed.skillGaps) ||
    typeof parsed.summaryRewrite !== "string" ||
    !Array.isArray(parsed.quickWins)
  ) {
    throw new Error("Invalid AI response structure");
  }

  return parsed as AIResponse;
}

// ─── POST handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  // 1. Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRL(ip)) {
    return NextResponse.json(
      { error: "Too many requests — try again in a minute" },
      { status: 429 }
    );
  }

  // 3. Parse + validate body
  let resumeText: string;
  let jobDescription: string;
  let atsScore: number;
  let missingKeywords: string[];
  let scoreBreakdown: Record<string, number>;

  try {
    const body = await req.json();
    resumeText = String(body.resumeText ?? "").slice(0, 8000);
    jobDescription = String(body.jobDescription ?? "").slice(0, 4000);
    atsScore = Number(body.atsScore ?? 0);
    missingKeywords = Array.isArray(body.missingKeywords)
      ? (body.missingKeywords as string[]).slice(0, 20)
      : [];
    scoreBreakdown = body.scoreBreakdown ?? {};
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  if (!resumeText) {
    return NextResponse.json(
      { error: "resumeText is required" },
      { status: 400 }
    );
  }

  // 4. Build prompt
  const hasJD = jobDescription && jobDescription.trim().length > 10;
  const prompt = `You are an expert resume coach and ATS optimization specialist. A candidate has received an ATS score of ${atsScore}/100.
Missing keywords: ${missingKeywords.join(", ") || "none"}.
Score breakdown: ${JSON.stringify(scoreBreakdown)}.
${hasJD ? `\nJob Description provided — tailor suggestions to match this specific role.` : `\nNo job description provided — give general ATS optimization suggestions to make this resume stronger, more impactful, and ATS-friendly.`}

Analyze the resume${hasJD ? " against the job description" : ""} and respond ONLY with a valid JSON object matching this exact shape:

{
  "bulletImprovements": [
    { "original": "...", "improved": "...", "reason": "..." }
  ],
  "skillGaps": [
    { "skill": "...", "context": "...", "howToAddressIt": "..." }
  ],
  "summaryRewrite": "...",
  "quickWins": ["...", "...", "..."]
}

Rules:
- bulletImprovements: 3–5 items. Take weak bullets from the resume and rewrite them to be stronger, more specific, and keyword-rich with quantified achievements.
- skillGaps: 3–4 items. ${hasJD ? "Skills from the JD that are missing or weak in the resume." : "Important industry skills that are missing or underrepresented in the resume based on the candidate's role and experience level."}
- summaryRewrite: A 2–3 sentence professional summary optimized for ${hasJD ? "this specific role" : "the candidate's target role based on their experience"}.
- quickWins: Exactly 3 specific actions the candidate can complete in under 15 minutes each to improve their ATS score.
- Do not include any text outside the JSON.

RESUME:
${resumeText}
${hasJD ? `\nJOB DESCRIPTION:\n${jobDescription}` : ""}`;

  // 5. Call Gemini via Vercel AI SDK
  let aiText: string;
  try {
    const { text } = await generateWithFallback({
      prompt,
      maxOutputTokens: 8000,
      temperature: 0.7,
    });
    aiText = text;
  } catch (err) {
    console.error("Gemini API error:", err);
    return NextResponse.json(
      { error: "AI service error — please try again" },
      { status: 502 }
    );
  }

  // 6. Parse JSON (retry once on failure)
  let result: AIResponse;
  try {
    result = extractJSON(aiText);
  } catch {
    // Retry with explicit JSON instruction
    try {
      const { text: retryText } = await generateWithFallback({
        prompt: `${prompt}\n\nIMPORTANT: Respond with ONLY the JSON object. No markdown, no explanations, just the JSON.`,
        maxOutputTokens: 8000,
        temperature: 0.5,
      });
      result = extractJSON(retryText);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response — please try again" },
        { status: 422 }
      );
    }
  }

  return NextResponse.json(result);
}
