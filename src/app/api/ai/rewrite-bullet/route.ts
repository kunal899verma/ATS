import { generateWithFallback } from '@/lib/ai/provider';
import { BULLET_REWRITE_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown';

  const { allowed, retryAfterMs } = checkRateLimit(ip, 'rewrite-bullet', 5, 60000);
  if (!allowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const { bullet, context, jobDescription } = await req.json();

  if (!bullet) {
    return Response.json({ error: 'Bullet point text is required.' }, { status: 400 });
  }

  const contextString = [
    context ? `Resume Context: ${context}` : '',
    jobDescription ? `Job Description: ${jobDescription}` : '',
  ].filter(Boolean).join('\n\n');

  const userPrompt = `Rewrite this resume bullet point to be more impactful and ATS-friendly:

"${bullet}"${contextString ? `\n\n${contextString}` : ''}`;

  try {
    const { text } = await generateWithFallback({
      system: BULLET_REWRITE_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 8000,
      temperature: 0.7,
    });
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('[rewrite-bullet] AI error:', err);
    const message = err instanceof Error ? err.message : 'AI generation failed';
    if (message.includes('API key')) {
      return Response.json({ error: 'Invalid API key. Check GOOGLE_GENERATIVE_AI_API_KEY in .env.local' }, { status: 401 });
    }
    return Response.json({ error: message }, { status: 502 });
  }
}
