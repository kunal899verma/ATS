import { generateWithFallback } from '@/lib/ai/provider';
import { RESUME_COACH_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown';

  const { allowed, retryAfterMs } = checkRateLimit(ip, 'coach', 3, 60000);
  if (!allowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const { messages, context } = await req.json();

  if (!messages || !Array.isArray(messages)) {
    return Response.json({ error: 'Messages array is required.' }, { status: 400 });
  }

  const contextString = context
    ? `ATS Score: ${context.score ?? 'N/A'}
Matched Keywords: ${context.matchedKeywords?.join(', ') ?? 'N/A'}
Missing Keywords: ${context.missingKeywords?.join(', ') ?? 'N/A'}
Suggestions: ${context.suggestions?.join('\n') ?? 'N/A'}
Resume Text: ${context.resumeText ?? 'N/A'}`
    : 'No analysis context provided.';

  const prompt = messages.map((m: { role: string; content: string }) => `${m.role}: ${m.content}`).join('\n');

  try {
    const { text } = await generateWithFallback({
      system: `${RESUME_COACH_SYSTEM_PROMPT}\n\nContext:\n${contextString}`,
      prompt,
    });
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('[coach] AI error:', err);
    const message = err instanceof Error ? err.message : 'AI generation failed';
    if (message.includes('API key')) {
      return Response.json({ error: 'Invalid API key. Check GOOGLE_GENERATIVE_AI_API_KEY in .env.local' }, { status: 401 });
    }
    return Response.json({ error: message }, { status: 502 });
  }
}
