import { generateWithFallback } from '@/lib/ai/provider';
import { checkRateLimit } from '@/lib/rate-limit';
import { headers } from 'next/headers';

export async function POST(req: Request) {
  const headersList = await headers();
  const ip = headersList.get('x-forwarded-for') ?? headersList.get('x-real-ip') ?? 'unknown';

  const { allowed, retryAfterMs } = checkRateLimit(ip, 'parse-resume', 3, 60000);
  if (!allowed) {
    return Response.json(
      { error: 'Rate limit exceeded. Please try again later.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil(retryAfterMs / 1000)) } }
    );
  }

  let body;
  try { body = await req.json(); } catch {
    return Response.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const { resumeText, aiSuggestions } = body;
  if (!resumeText) {
    return Response.json({ error: 'Resume text is required.' }, { status: 400 });
  }

  // Build the AI improvements context
  let improvementsContext = '';
  if (aiSuggestions) {
    if (aiSuggestions.summaryRewrite) {
      improvementsContext += `\n\nUSE THIS IMPROVED SUMMARY (replace the original):\n${aiSuggestions.summaryRewrite}`;
    }
    if (aiSuggestions.bulletImprovements?.length > 0) {
      improvementsContext += '\n\nREPLACE THESE BULLET POINTS WITH IMPROVED VERSIONS:';
      for (const b of aiSuggestions.bulletImprovements) {
        improvementsContext += `\n- Original: "${b.original}" → Improved: "${b.improved}"`;
      }
    }
    if (aiSuggestions.skillGaps?.length > 0) {
      improvementsContext += '\n\nADD THESE MISSING SKILLS to the appropriate skill groups:';
      for (const g of aiSuggestions.skillGaps) {
        improvementsContext += `\n- ${g.skill}`;
      }
    }
  }

  const prompt = `You are a resume parser and ATS optimizer. Parse the resume text below into a structured JSON format.

CRITICAL RULES:
- Extract ALL real data from the resume: name, contact info, every job, every education entry, all skills
- If AI improvements are provided below, APPLY them (use the improved summary, improved bullets, add missing skills)
- For bullet points: make each bullet start with a strong action verb and include quantified results where possible
- For skills: organize into logical groups (Languages, Frameworks, Tools, etc.)
- Output ONLY valid JSON, no markdown, no explanation
${improvementsContext}

OUTPUT FORMAT (follow exactly):
{
  "personal": {
    "name": "Full Name",
    "title": "Job Title",
    "email": "email@example.com",
    "phone": "phone number",
    "location": "City, State",
    "linkedin": "linkedin URL or empty string",
    "github": "github URL or empty string",
    "website": "website URL or empty string"
  },
  "summary": "2-3 sentence professional summary (use improved version if provided)",
  "experience": [
    {
      "id": "e1",
      "company": "Company Name",
      "title": "Job Title",
      "location": "City, State",
      "startDate": "Mon YYYY",
      "endDate": "Mon YYYY or empty if current",
      "current": true/false,
      "bullets": "Each bullet on a new line separated by \\n. Use improved bullets if provided."
    }
  ],
  "education": [
    {
      "id": "edu1",
      "school": "School Name",
      "degree": "Degree Type",
      "field": "Field of Study",
      "location": "City, State",
      "graduationDate": "YYYY",
      "gpa": "GPA or empty",
      "honors": "Honors or empty"
    }
  ],
  "skills": [
    { "id": "s1", "name": "Category Name", "items": "Skill1, Skill2, Skill3" }
  ],
  "projects": [
    { "id": "p1", "name": "Project Name", "description": "Brief description", "tech": "Tech used", "link": "" }
  ],
  "certifications": [
    { "id": "c1", "name": "Cert Name", "issuer": "Issuer", "date": "YYYY" }
  ]
}

RESUME TEXT:
${String(resumeText).slice(0, 10000)}`;

  try {
    const { text } = await generateWithFallback({
      prompt,
      maxOutputTokens: 8000,
      temperature: 0.3,
    });

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json({ error: 'Failed to parse resume structure.' }, { status: 422 });
    }

    const parsed = JSON.parse(jsonMatch[0]);
    return Response.json(parsed);
  } catch (err) {
    console.error('Parse resume AI error:', err);
    const message = err instanceof Error ? err.message : 'AI generation failed';
    return Response.json({ error: message }, { status: 502 });
  }
}
