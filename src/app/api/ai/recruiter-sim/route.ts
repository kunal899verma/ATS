import { generateWithFallback } from '@/lib/ai/provider';
import { RECRUITER_SIM_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown';

  const { allowed, retryAfterMs } = checkRateLimit(ip, 'recruiter-sim', 3, 60000);
  if (!allowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  const { resumeText, jobDescription } = await req.json();

  if (!resumeText) {
    return Response.json({ error: 'Resume text is required.' }, { status: 400 });
  }

  const userPrompt = `Review this resume as a senior recruiter:

Resume:
${resumeText}

${jobDescription ? `Job Description:\n${jobDescription}` : 'No specific job description provided — give general feedback.'}`;

  try {
    const { text } = await generateWithFallback({
      system: RECRUITER_SIM_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 8000,
      temperature: 0.7,
    });
    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('[recruiter-sim] AI error:', err);
    const message = err instanceof Error ? err.message : 'AI generation failed';
    if (message.includes('API key')) {
      return Response.json({ error: 'Invalid API key. Check GOOGLE_GENERATIVE_AI_API_KEY in .env.local' }, { status: 401 });
    }
    return Response.json({ error: message }, { status: 502 });
  }
}
