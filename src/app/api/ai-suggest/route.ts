import { NextRequest, NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import type { AIResponse } from "@/types";

export const runtime = "nodejs";

// ─── Rate limiting (3 req/min per IP) ────────────────────────────────────────
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const window = 60_000; // 1 minute
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
  // Try to find JSON block in the response
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in response");
  const parsed = JSON.parse(jsonMatch[0]);

  // Validate required keys
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
  // 1. API key check
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI suggestions unavailable — missing API key" },
      { status: 503 }
    );
  }

  // 2. Rate limit
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown";

  if (!checkRateLimit(ip)) {
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

  if (!resumeText || !jobDescription) {
    return NextResponse.json(
      { error: "resumeText and jobDescription are required" },
      { status: 400 }
    );
  }

  // 4. Build prompt
  const prompt = `You are an expert resume coach. A candidate has received an ATS score of ${atsScore}/100.
Missing keywords: ${missingKeywords.join(", ") || "none"}.
Score breakdown: ${JSON.stringify(scoreBreakdown)}.

Analyze the resume against the job description and respond ONLY with a valid JSON object matching this exact shape:

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
- bulletImprovements: 3–5 items. Take weak bullets from the resume and rewrite them to be stronger, more specific, and keyword-rich.
- skillGaps: 3–4 items. Skills from the JD that are missing or weak in the resume.
- summaryRewrite: A 2–3 sentence professional summary optimized for this specific role.
- quickWins: Exactly 3 specific actions the candidate can complete in under 15 minutes each.
- Do not include any text outside the JSON.

RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}`;

  // 5. Call Claude
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let aiText: string;
  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1500,
      messages: [{ role: "user", content: prompt }],
    });
    const content = response.content[0];
    if (content.type !== "text") throw new Error("Unexpected response type");
    aiText = content.text;
  } catch (err) {
    console.error("Claude API error:", err);
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
      const retryResponse = await client.messages.create({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [
          { role: "user", content: prompt },
          { role: "assistant", content: aiText },
          { role: "user", content: "Please respond with only the JSON object, no other text." },
        ],
      });
      const retryContent = retryResponse.content[0];
      if (retryContent.type !== "text") throw new Error("Unexpected type");
      result = extractJSON(retryContent.text);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response — please try again" },
        { status: 422 }
      );
    }
  }

  return NextResponse.json(result);
}
