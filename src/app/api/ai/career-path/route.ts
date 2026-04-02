import { generateWithFallback } from '@/lib/ai/provider';
import { CAREER_PATH_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown';

  const { allowed, retryAfterMs } = checkRateLimit(ip, 'career-path', 3, 60000);
  if (!allowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const { resumeText, currentRole, skills } = await req.json();

  if (!resumeText) {
    return Response.json({ error: 'Resume text is required.' }, { status: 400 });
  }

  const userPrompt = `Analyze career path options based on:

Resume:
${resumeText}

Current Role: ${currentRole || 'Not specified'}
Key Skills: ${Array.isArray(skills) ? skills.join(', ') : skills || 'Not specified'}`;

  try {
    const { text } = await generateWithFallback({
      system: CAREER_PATH_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 8000,
      temperature: 0.7,
    });
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('[career-path] AI error:', err);
    const message = err instanceof Error ? err.message : 'AI generation failed';
    if (message.includes('API key')) {
      return Response.json({ error: 'Invalid API key. Check GOOGLE_GENERATIVE_AI_API_KEY in .env.local' }, { status: 401 });
    }
    return Response.json({ error: message }, { status: 502 });
  }
}
