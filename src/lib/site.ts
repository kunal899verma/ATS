export const SITE_NAME = "ResumeATS";
export const SITE_TITLE = "ResumeATS — Free AI Resume Checker, Cover Letter Generator & ATS Score Analyzer";
export const SITE_DESCRIPTION =
  "Get your resume's ATS compatibility score in 5 seconds. AI-powered keyword analysis, cover letter generation, interview prep, section scoring, recruiter readability — all free, no account needed.";

const LOCALHOST_URL = "http://localhost:3000";

function normalizeSiteUrl(value?: string | null) {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  return withProtocol.replace(/\/+$/, "");
}

function resolveSiteUrl() {
  return (
    normalizeSiteUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
    normalizeSiteUrl(process.env.VERCEL_PROJECT_PRODUCTION_URL) ??
    normalizeSiteUrl(process.env.VERCEL_URL) ??
    LOCALHOST_URL
  );
}

export const SITE_URL = resolveSiteUrl();

export function absoluteUrl(path = "/") {
  return new URL(path, SITE_URL).toString();
}
