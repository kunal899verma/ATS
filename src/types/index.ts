// ─── Role Detection ───────────────────────────────────────────────────────────
export type RoleType =
  | "tech_frontend" | "tech_backend" | "tech_fullstack" | "tech_devops"
  | "tech_data" | "tech_mobile" | "marketing" | "design" | "sales"
  | "product" | "general";

export const ROLE_LABELS: Record<RoleType, string> = {
  tech_frontend:  "Frontend Developer",
  tech_backend:   "Backend Developer",
  tech_fullstack: "Full-Stack Developer",
  tech_devops:    "DevOps / SRE",
  tech_data:      "Data / ML",
  tech_mobile:    "Mobile Developer",
  marketing:      "Marketing",
  design:         "UX / Design",
  sales:          "Sales",
  product:        "Product Manager",
  general:        "General",
};

export const ROLE_COLORS: Record<RoleType, { text: string; bg: string; border: string }> = {
  tech_frontend:  { text: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20" },
  tech_backend:   { text: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
  tech_fullstack: { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  tech_devops:    { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  tech_data:      { text: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20" },
  tech_mobile:    { text: "text-purple-400",  bg: "bg-purple-500/10",  border: "border-purple-500/20" },
  marketing:      { text: "text-orange-400",  bg: "bg-orange-500/10",  border: "border-orange-500/20" },
  design:         { text: "text-rose-400",    bg: "bg-rose-500/10",    border: "border-rose-500/20" },
  sales:          { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  product:        { text: "text-teal-400",    bg: "bg-teal-500/10",    border: "border-teal-500/20" },
  general:        { text: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/20" },
};

// ─── Grade ───────────────────────────────────────────────────────────────────
export type Grade = "A+" | "A" | "B+" | "B" | "C+" | "C" | "D" | "F";

export type Priority = "critical" | "high" | "medium" | "low";

export type SectionStatus = "excellent" | "good" | "needs_work" | "missing";

// ─── Score Breakdown ──────────────────────────────────────────────────────────
export interface ScoreBreakdown {
  keywords: number;        // 35% — JD keyword match (with synonym support)
  skills: number;          // 20% — skills section quality
  experience: number;      // 15% — experience section quality
  education: number;       // 10% — education section quality
  formatting: number;      // 10% — structure & readability
  atsCompatibility: number; // 10% — ATS parse-ability checks
}

// ─── Keyword Analysis ─────────────────────────────────────────────────────────
export interface KeywordMatch {
  keyword: string;
  found: boolean;
  matchType: "exact" | "synonym" | "stemmed" | "none";
  matchedAs?: string;       // if synonym/stemmed, what it matched as
  count: number;            // occurrences in resume
  density: number;          // percentage of resume
  importance: "critical" | "high" | "medium" | "low";
  inSkillsSection: boolean;
}

export interface KeywordAnalysis {
  matches: KeywordMatch[];
  matchedKeywords: string[];
  synonymMatches: string[];   // keywords matched via synonym
  missingKeywords: string[];
  topMissingKeywords: string[]; // top 5 most important missing ones
  overallMatchRate: number;    // 0-100
  keywordDensity: number;      // avg keyword density %
  stuffingDetected: boolean;   // penalize if > 4% density
}

// ─── Section Analysis ─────────────────────────────────────────────────────────
export interface SectionScore {
  name: string;
  score: number;
  maxScore: number;
  status: SectionStatus;
  feedback: string[];
  improvements: string[];
}

export interface SectionAnalysis {
  contact: SectionScore;
  summary: SectionScore;
  experience: SectionScore;
  skills: SectionScore;
  education: SectionScore;
  formatting: SectionScore;
}

// ─── Format Analysis ──────────────────────────────────────────────────────────
export interface FormatAnalysis {
  hasBulletPoints: boolean;
  bulletPointCount: number;
  hasQuantifiedAchievements: boolean;
  quantifiedCount: number;
  hasActionVerbs: boolean;
  actionVerbCount: number;
  wordCount: number;
  isOptimalLength: boolean; // 350–750 words
  hasEmail: boolean;
  hasPhone: boolean;
  hasLinkedIn: boolean;
  hasGitHub: boolean;
  detectedSections: string[];
  atsFriendly: boolean;
  atsIssues: string[];
}

// ─── Recruiter Score ──────────────────────────────────────────────────────────
// Our differentiator — grades the resume for a real human recruiter
export interface RecruiterScore {
  score: number;          // 0–100
  grade: Grade;
  clarity: number;        // easy to skim?
  impact: number;         // do achievements stand out?
  relevance: number;      // is the content targeted?
  authenticity: number;   // does it read human (not AI-stuffed)?
  feedback: string[];
}

// ─── Suggestion ───────────────────────────────────────────────────────────────
export interface Suggestion {
  id: string;
  priority: Priority;
  category: "Keywords" | "Content" | "Format" | "Structure" | "Impact" | "Skills" | "Contact";
  title: string;
  description: string;
  example?: string;
  impact: number;          // estimated score improvement if fixed (1–15)
  effort: "easy" | "medium" | "hard";
  // Deep analysis additions
  currentText?: string;    // actual problematic text extracted from resume
  improvedText?: string;   // suggested rewrite
  timeNeeded?: string;     // "2 min", "10 min", "30 min"
}

// ─── Deep Analysis (line-by-line intelligence) ────────────────────────────────
export interface ContactIssue {
  field: "email" | "phone" | "linkedin" | "github" | "portfolio";
  issue: string;
  currentValue: string;
  suggestedValue: string;
  scoreImpact: number;
}

export interface BulletQuality {
  text: string;
  score: number;           // 0–100
  hasActionVerb: boolean;
  hasMetric: boolean;
  weakStarter?: string;    // "responsible for", "worked on", etc.
  improvedVersion?: string;
}

export interface DeepAnalysis {
  contact: {
    score: number;
    issues: ContactIssue[];
  };
  summary: {
    wordCount: number;
    score: number;
    genericPhrasesFound: string[];
    weakLanguageFound: string[];
    actionVerbsFound: string[];
    extractedText: string;
  };
  bullets: {
    total: number;
    withMetrics: number;
    withActionVerbs: number;
    weakBullets: BulletQuality[];
    avgScore: number;
  };
  layout: {
    decorativeCharsFound: string[];
    pipeCount: number;
    allCapsLinesCount: number;
    score: number;
    issues: string[];
  };
}

// ─── AI Suggestion Types ──────────────────────────────────────────────────────
export interface AIBulletImprovement {
  original: string;
  improved: string;
  reason: string;
}

export interface AISkillGap {
  skill: string;
  context: string;
  howToAddressIt: string;
}

export interface AIResponse {
  bulletImprovements: AIBulletImprovement[];
  skillGaps: AISkillGap[];
  summaryRewrite: string;
  quickWins: string[];
}

// ─── Career Intelligence ──────────────────────────────────────────────────────
export type ExperienceLevel = "intern" | "junior" | "mid" | "senior" | "lead" | "principal";

export interface DetectedTech {
  name: string;
  category: "framework" | "language" | "tool" | "cloud" | "database";
  confidence: "confirmed" | "likely";
}

export interface SkillSuggestion {
  skill: string;
  reason: string;
  priority: "must_learn" | "high" | "medium";
  timeframe: string;
  resourceHint: string;
}

export interface RoleReadiness {
  title: string;
  readiness: "ready" | "stretch" | "future";
  gap?: string;
}

export interface ResumeAddition {
  item: string;
  category: "project" | "skill" | "certification" | "metric" | "section";
  whyItMatters: string;
}

export interface CareerIntelligence {
  experienceLevel: ExperienceLevel;
  detectedStack: DetectedTech[];
  primaryTech: string;
  nextSkills: SkillSuggestion[];
  targetRoles: RoleReadiness[];
  resumeAdditions: ResumeAddition[];
  levelUpGoals: string[];
}

// ─── Full ATS Result ──────────────────────────────────────────────────────────
export interface ATSResult {
  overallScore: number;
  grade: Grade;
  scoreBreakdown: ScoreBreakdown;
  sections: SectionAnalysis;
  keywordAnalysis: KeywordAnalysis;
  formatAnalysis: FormatAnalysis;
  recruiterScore: RecruiterScore;
  suggestions: Suggestion[];
  summary: string;         // 1-sentence overall summary
  competitiveLevel: "top_10" | "top_25" | "average" | "below_average" | "needs_work";
  detectedRole: RoleType;
  careerIntelligence?: CareerIntelligence;
  deepAnalysis?: DeepAnalysis;
}
