import { generateWithFallback } from '@/lib/ai/provider';
import { COVER_LETTER_SYSTEM_PROMPT } from '@/lib/ai/prompts';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown';

  const { allowed, retryAfterMs } = checkRateLimit(ip, 'cover-letter', 3, 60000);
  if (!allowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { resumeText, jobDescription, companyName, hiringManager, tone, focusAreas } = body;

  if (!resumeText || !jobDescription) {
    return Response.json({ error: 'Resume text and job description are required.' }, { status: 400 });
  }

  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const userPrompt = `Write a COMPLETE, ready-to-send cover letter. NO placeholders. Use the real data below.

Today's date: ${today}
Company: ${companyName || '(not specified — write generically)'}
Hiring Manager: ${hiringManager || 'Hiring Manager'}
Tone: ${tone || 'Professional'}
Focus Areas: ${Array.isArray(focusAreas) && focusAreas.length > 0 ? focusAreas.join(', ') : 'General qualifications'}

=== CANDIDATE'S RESUME ===
${String(resumeText).slice(0, 8000)}

=== JOB DESCRIPTION ===
${String(jobDescription).slice(0, 4000)}

Remember: Extract the candidate's name, email, phone from the resume. Write the FULL cover letter body with specific achievements and numbers from the resume. No template placeholders.`;

  try {
    const { text } = await generateWithFallback({
      system: COVER_LETTER_SYSTEM_PROMPT,
      prompt: userPrompt,
      maxOutputTokens: 8000,
      temperature: 0.7,
    });

    return new Response(text, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (err) {
    console.error('Cover letter AI error:', err);
    const message = err instanceof Error ? err.message : 'AI generation failed';
    return Response.json({ error: message }, { status: 502 });
  }
}
