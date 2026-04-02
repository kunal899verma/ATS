/**
 * Persistent storage utility for ResumeATS
 * Uses localStorage with structured keys so data survives page refreshes
 */

import type { ATSResult, AIResponse } from "@/types";

// ─── Keys ────────────────────────────────────────────────────────────────────
const KEYS = {
  LAST_RESULT: "ats_last_result",
  LAST_RESUME_TEXT: "ats_last_resume_text",
  LAST_JOB_DESC: "ats_last_jd",
  LAST_FILE_NAME: "ats_last_filename",
  LAST_GITHUB: "ats_last_github",
  LAST_AI_SUGGESTIONS: "ats_last_ai_suggestions",
  SCORE_HISTORY: "ats_score_history",
} as const;

const LEGACY_SESSION_KEYS = [
  "atsResult",
  "atsResumeText",
  "atsFileName",
  "atsJobDescription",
  "atsGithubData",
  "atsPrefillResume",
] as const;

const LOCAL_ONLY_KEYS = [
  KEYS.LAST_RESULT,
  KEYS.LAST_RESUME_TEXT,
  KEYS.LAST_JOB_DESC,
  KEYS.LAST_FILE_NAME,
  KEYS.LAST_GITHUB,
  KEYS.LAST_AI_SUGGESTIONS,
  KEYS.SCORE_HISTORY,
  "ats_history",
] as const;

// ─── Types ───────────────────────────────────────────────────────────────────
export interface ScoreHistoryEntry {
  id: string;
  score: number;
  grade: string;
  role: string;
  fileName: string;
  timestamp: number;
}

// ─── Safe JSON helpers ───────────────────────────────────────────────────────
function safeGet<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

function safeSet(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // localStorage full or unavailable — silently fail
  }
}

// ─── Analysis Results ────────────────────────────────────────────────────────
export function saveAnalysisResult(
  result: ATSResult,
  resumeText: string,
  fileName: string,
  jobDescription: string,
  githubData?: unknown
): void {
  safeSet(KEYS.LAST_RESULT, result);
  safeSet(KEYS.LAST_RESUME_TEXT, resumeText);
  safeSet(KEYS.LAST_FILE_NAME, fileName);
  safeSet(KEYS.LAST_JOB_DESC, jobDescription);
  if (githubData) safeSet(KEYS.LAST_GITHUB, githubData);

  // Also keep in sessionStorage for backward compatibility
  try {
    sessionStorage.setItem("atsResult", JSON.stringify(result));
    sessionStorage.setItem("atsResumeText", resumeText);
    sessionStorage.setItem("atsFileName", fileName);
    sessionStorage.setItem("atsJobDescription", jobDescription);
    if (githubData) sessionStorage.setItem("atsGithubData", JSON.stringify(githubData));
  } catch { /* ignore */ }

  // Add to score history
  addToScoreHistory({
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    score: result.overallScore,
    grade: result.grade,
    role: result.detectedRole,
    fileName,
    timestamp: Date.now(),
  });
}

export function getLastResult(): ATSResult | null {
  // Try sessionStorage first (current session), then localStorage (persisted)
  try {
    const session = sessionStorage.getItem("atsResult");
    if (session) return JSON.parse(session);
  } catch { /* ignore */ }
  return safeGet<ATSResult>(KEYS.LAST_RESULT);
}

export function getLastResumeText(): string {
  try {
    const session = sessionStorage.getItem("atsResumeText");
    if (session) return session;
  } catch { /* ignore */ }
  return safeGet<string>(KEYS.LAST_RESUME_TEXT) ?? "";
}

export function getLastJobDescription(): string {
  try {
    const session = sessionStorage.getItem("atsJobDescription");
    if (session) return session;
  } catch { /* ignore */ }
  return safeGet<string>(KEYS.LAST_JOB_DESC) ?? "";
}

export function getLastFileName(): string {
  try {
    const session = sessionStorage.getItem("atsFileName");
    if (session) return session;
  } catch { /* ignore */ }
  return safeGet<string>(KEYS.LAST_FILE_NAME) ?? "";
}

export function getLastGithubData(): unknown | null {
  try {
    const session = sessionStorage.getItem("atsGithubData");
    if (session) return JSON.parse(session);
  } catch { /* ignore */ }
  return safeGet(KEYS.LAST_GITHUB);
}

// ─── AI Suggestions ──────────────────────────────────────────────────────────
export function saveAISuggestions(suggestions: AIResponse): void {
  safeSet(KEYS.LAST_AI_SUGGESTIONS, suggestions);
}

export function getLastAISuggestions(): AIResponse | null {
  return safeGet<AIResponse>(KEYS.LAST_AI_SUGGESTIONS);
}

// ─── Score History ───────────────────────────────────────────────────────────
export function getScoreHistory(): ScoreHistoryEntry[] {
  return safeGet<ScoreHistoryEntry[]>(KEYS.SCORE_HISTORY) ?? [];
}

function addToScoreHistory(entry: ScoreHistoryEntry): void {
  const history = getScoreHistory();
  history.unshift(entry);
  // Keep max 20 entries
  if (history.length > 20) history.length = 20;
  safeSet(KEYS.SCORE_HISTORY, history);
}

export function clearScoreHistory(): void {
  try { localStorage.removeItem(KEYS.SCORE_HISTORY); } catch { /* ignore */ }
}

export function hasSavedBrowserData(): boolean {
  try {
    return [...LOCAL_ONLY_KEYS].some((key) => localStorage.getItem(key) !== null) ||
      [...LEGACY_SESSION_KEYS].some((key) => sessionStorage.getItem(key) !== null);
  } catch {
    return false;
  }
}

export function clearSavedBrowserData(): void {
  try {
    for (const key of LOCAL_ONLY_KEYS) {
      localStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }

  try {
    for (const key of LEGACY_SESSION_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    /* ignore */
  }
}
