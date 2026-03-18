/**
 * ATS Resume Analyzer — Industry-Level Scoring Engine
 *
 * Algorithm weights:
 *   Keywords match .... 35%  (with synonym + stemmed matching)
 *   Skills section .... 20%
 *   Experience quality  15%
 *   Education ......... 10%
 *   Formatting ........ 10%
 *   ATS Compatibility .. 10%
 *
 * Differentiators vs Jobscan/ResumeWorded:
 *   - Synonym + stemmed matching (not just exact)
 *   - Honest scoring (calibrated to real interview rates)
 *   - Recruiter readability score (human-first, not just bot-first)
 *   - Keyword stuffing detection (penalizes over-optimization)
 *   - Transparent methodology in all suggestions
 */

import { findKeywordInText } from "./synonyms";
import { buildCareerIntelligence } from "./career-intelligence";
import type {
  RoleType,
  ATSResult,
  Grade,
  KeywordMatch,
  KeywordAnalysis,
  SectionAnalysis,
  SectionScore,
  SectionStatus,
  FormatAnalysis,
  RecruiterScore,
  Suggestion,
  ScoreBreakdown,
  Priority,
} from "@/types";

// ─── Constants ───────────────────────────────────────────────────────────────

const ACTION_VERBS = [
  "achieved", "built", "created", "designed", "developed", "drove", "enhanced",
  "established", "executed", "generated", "implemented", "improved", "increased",
  "launched", "led", "managed", "optimized", "reduced", "streamlined", "transformed",
  "delivered", "deployed", "architected", "automated", "collaborated", "coordinated",
  "engineered", "expanded", "facilitated", "founded", "grew", "headed", "initiated",
  "integrated", "mentored", "modernized", "negotiated", "oversaw", "partnered",
  "pioneered", "produced", "programmed", "refactored", "resolved", "scaled",
  "shipped", "spearheaded", "supervised", "trained", "analyzed", "assessed",
  "directed", "formulated", "guided", "influenced", "introduced", "researched",
  "secured", "shaped", "simplified", "unified", "upgraded", "validated",
];

const STOP_WORDS = new Set([
  "a","an","the","and","or","but","in","on","at","to","for","of","with","by",
  "from","is","are","was","were","be","been","have","has","had","do","does",
  "did","will","would","could","should","may","might","shall","can","that",
  "this","these","those","i","we","you","he","she","they","it","as","if",
  "then","than","so","yet","also","both","either","each","all","any","few",
  "more","most","other","some","such","no","not","only","same","too","very",
  "just","about","above","after","before","between","into","through","during",
  "well","our","your","their","its","my","his","her","us","them","who","what",
  "which","when","where","how","why","must","up","out","over","use","using",
  "used","work","working","new","help","year","years","time","strong","good",
  "great","looking","seeking","responsible","position","role","team","company",
  "ability","skills","knowledge","experience","required","preferred","plus",
  "including","without","within","across","toward","upon","while",
  "although","however","therefore","thus","hence","whereas","since","once",
  // JD section headings and filler words that aren't skills
  "requirements","requirement","nice","have","bonus","ideal","ideally",
  "minimum","mandatory","equivalent","candidates","candidate","applicant",
  "join","building","make","things","like","eg","etc","ie","per","range",
  // Generic non-skill words common in JDs
  "hiring","hire","seeking","wanted","open","opportunity","opportunities",
  "expertise","expert","proficient","proficiency","familiar","familiarity",
  "scalable","scalability","robust","clean","maintainable","readable",
  "web","applications","application","software","solutions","solution",
  "driven","oriented","focused","based","level","senior","junior","mid",
  "build","write","create","develop","design","implement","deliver",
  "understand","collaborate","communicate","present","report",
  "fast","quickly","efficiently","effectively",
]);

const SECTION_PATTERNS = {
  contact: /\b(contact|email|phone|mobile|address|linkedin|github|portfolio|website|location)\b/i,
  summary: /\b(summary|objective|profile|about me|overview|professional summary|career summary|executive summary)\b/i,
  experience: /\b(experience|employment|work history|professional experience|career history|work experience|positions held)\b/i,
  skills: /\b(skills|technical skills|competencies|technologies|tools|languages|frameworks|expertise|proficiencies|core competencies)\b/i,
  education: /\b(education|academic|degree|university|college|school|certifications?|credentials|qualifications)\b/i,
  projects: /\b(projects?|portfolio|open.?source|side projects?|personal projects?)\b/i,
  achievements: /\b(achievements?|awards?|honors?|accomplishments?|recognition)\b/i,
  publications: /\b(publications?|papers?|research|patents?)\b/i,
};

// ─── Industry Intelligence ────────────────────────────────────────────────────

interface WeightProfile {
  keywords: number; skills: number; experience: number;
  education: number; formatting: number; atsCompatibility: number;
}

const INDUSTRY_WEIGHTS: Record<RoleType, WeightProfile> = {
  tech_frontend:  { keywords: 0.30, skills: 0.25, experience: 0.20, education: 0.05, formatting: 0.10, atsCompatibility: 0.10 },
  tech_backend:   { keywords: 0.30, skills: 0.25, experience: 0.20, education: 0.05, formatting: 0.10, atsCompatibility: 0.10 },
  tech_fullstack: { keywords: 0.30, skills: 0.25, experience: 0.20, education: 0.05, formatting: 0.10, atsCompatibility: 0.10 },
  tech_devops:    { keywords: 0.28, skills: 0.27, experience: 0.20, education: 0.05, formatting: 0.10, atsCompatibility: 0.10 },
  tech_data:      { keywords: 0.28, skills: 0.25, experience: 0.22, education: 0.08, formatting: 0.10, atsCompatibility: 0.07 },
  tech_mobile:    { keywords: 0.28, skills: 0.27, experience: 0.20, education: 0.05, formatting: 0.10, atsCompatibility: 0.10 },
  marketing:      { keywords: 0.20, skills: 0.15, experience: 0.30, education: 0.10, formatting: 0.15, atsCompatibility: 0.10 },
  design:         { keywords: 0.15, skills: 0.20, experience: 0.30, education: 0.10, formatting: 0.20, atsCompatibility: 0.05 },
  sales:          { keywords: 0.15, skills: 0.10, experience: 0.35, education: 0.10, formatting: 0.20, atsCompatibility: 0.10 },
  product:        { keywords: 0.20, skills: 0.15, experience: 0.30, education: 0.10, formatting: 0.15, atsCompatibility: 0.10 },
  general:        { keywords: 0.25, skills: 0.20, experience: 0.20, education: 0.15, formatting: 0.10, atsCompatibility: 0.10 },
};

const ROLE_SIGNALS: Record<string, string[]> = {
  tech_frontend: [
    "react", "vue", "angular", "svelte", "html", "css", "javascript", "typescript",
    "frontend", "front-end", "front end", "ui developer", "web developer",
    "tailwind", "sass", "webpack", "vite", "nextjs", "next.js", "nuxt",
    "responsive", "dom", "hooks", "redux", "styled-components",
  ],
  tech_backend: [
    "node", "node.js", "express", "django", "flask", "spring", "rails",
    "fastapi", "laravel", "backend", "back-end", "back end", "server-side",
    "postgresql", "mysql", "mongodb", "redis", "rest api", "microservices",
    "database", "sql", "nosql", "orm", "api development",
  ],
  tech_devops: [
    "docker", "kubernetes", "k8s", "ci/cd", "jenkins", "terraform", "ansible",
    "aws", "gcp", "azure", "devops", "sre", "site reliability", "linux", "bash",
    "helm", "prometheus", "grafana", "infrastructure", "cloud", "monitoring",
    "deployment", "github actions", "gitlab ci",
  ],
  tech_data: [
    "machine learning", "deep learning", "data science", "data scientist",
    "data analyst", "data engineer", "python", "pandas", "numpy", "tensorflow",
    "pytorch", "scikit-learn", "tableau", "power bi", "spark",
    "statistics", "nlp", "natural language", "jupyter", "etl", "analytics",
  ],
  tech_mobile: [
    "ios", "android", "swift", "kotlin", "flutter", "react native",
    "mobile", "xcode", "app store", "play store", "objective-c", "swiftui",
    "jetpack compose", "mobile development", "cross-platform",
  ],
  marketing: [
    "seo", "sem", "ppc", "content marketing", "social media", "email marketing",
    "google analytics", "facebook ads", "brand", "campaign", "conversion",
    "lead generation", "crm", "marketing", "growth", "digital marketing",
    "copywriting", "a/b testing", "organic traffic", "roi", "funnel",
  ],
  design: [
    "figma", "sketch", "adobe xd", "illustrator", "photoshop",
    "ux design", "ui design", "user experience", "user interface",
    "wireframe", "prototype", "design system", "user research",
    "usability", "interaction design", "product design", "graphic design",
    "visual design", "accessibility", "design thinking",
  ],
  sales: [
    "sales", "revenue", "quota", "pipeline", "salesforce",
    "cold calling", "business development", "account executive",
    "customer success", "b2b", "b2c", "deal closing", "prospecting",
    "commission", "win rate", "demos", "territory",
  ],
  product: [
    "product manager", "product roadmap", "user stories", "sprint", "backlog",
    "stakeholder", "product strategy", "go-to-market", "kpi", "okr",
    "product owner", "jira", "agile", "scrum", "kanban",
    "feature prioritization", "market research", "product launch",
  ],
};

const ROLE_BASE_KEYWORDS: Partial<Record<RoleType, string[]>> = {
  tech_frontend: ["javascript", "typescript", "react", "html", "css", "git", "rest api", "testing", "responsive design", "performance optimization"],
  tech_backend:  ["node.js", "python", "java", "sql", "rest api", "git", "microservices", "database", "docker", "authentication"],
  tech_fullstack:["javascript", "typescript", "react", "node.js", "sql", "git", "rest api", "docker", "api design", "deployment"],
  tech_devops:   ["docker", "kubernetes", "aws", "ci/cd", "linux", "terraform", "monitoring", "git", "bash", "security"],
  tech_data:     ["python", "sql", "machine learning", "pandas", "data visualization", "git", "statistics", "deep learning", "etl", "jupyter"],
  tech_mobile:   ["swift", "kotlin", "react native", "git", "api integration", "testing", "app store", "performance optimization"],
  marketing:     ["seo", "analytics", "campaign management", "content strategy", "crm", "social media", "a/b testing", "roi", "email marketing"],
  design:        ["figma", "user research", "wireframes", "prototyping", "design system", "usability testing", "accessibility", "interaction design"],
  sales:         ["crm", "pipeline management", "prospecting", "revenue", "quota", "business development", "negotiation", "salesforce"],
  product:       ["product roadmap", "user stories", "agile", "stakeholder management", "analytics", "okr", "prioritization", "go-to-market"],
  general:       ["communication", "project management", "leadership", "problem solving", "teamwork", "stakeholders", "documentation"],
};

// ─── Main Entry Point ─────────────────────────────────────────────────────────

export function analyzeResume(resumeText: string, jobDescription: string): ATSResult {
  const resumeLower = resumeText.toLowerCase();
  const wordCount = countWords(resumeText);

  // 0. Detect industry/role
  const detectedRole = detectRole(resumeLower);
  const weights = INDUSTRY_WEIGHTS[detectedRole];

  // 1. Extract JD keywords
  const jdKeywords = extractKeywordsFromJD(jobDescription);

  // 2. Keyword analysis with synonym matching
  const keywordAnalysis = buildKeywordAnalysis(jdKeywords, detectedRole, resumeText, resumeLower, wordCount);

  // 3. Format analysis
  const formatAnalysis = analyzeFormat(resumeText, resumeLower);

  // 4. Section scores
  const sections = buildSectionAnalysis(resumeText, resumeLower, formatAnalysis, keywordAnalysis);

  // 5. Score breakdown
  const scoreBreakdown = calcScoreBreakdown(sections, keywordAnalysis, formatAnalysis);

  // 6. Overall score
  const overallScore = calcOverallScore(scoreBreakdown, keywordAnalysis, formatAnalysis, weights);

  // 7. Grade
  const grade = calcGrade(overallScore);

  // 8. Recruiter score
  const recruiterScore = calcRecruiterScore(resumeText, formatAnalysis, keywordAnalysis, wordCount);

  // 9. Suggestions
  const suggestions = buildSuggestions(
    sections,
    keywordAnalysis,
    formatAnalysis,
    recruiterScore,
    wordCount,
    resumeLower,
    overallScore,
    detectedRole
  );

  // 10. Summary + competitive level
  const summary = buildSummary(overallScore, keywordAnalysis, formatAnalysis);
  const competitiveLevel = getCompetitiveLevel(overallScore);

  // 11. Career intelligence
  const careerIntelligence = buildCareerIntelligence(resumeText, detectedRole);

  return {
    overallScore,
    grade,
    scoreBreakdown,
    sections,
    keywordAnalysis,
    formatAnalysis,
    recruiterScore,
    suggestions,
    summary,
    competitiveLevel,
    detectedRole,
    careerIntelligence,
  };
}

// ─── Known compound tech terms (always extract these as phrases if present in JD) ──

const COMPOUND_TERMS = [
  "machine learning", "deep learning", "natural language processing", "computer vision",
  "data science", "data engineering", "data analysis", "data analytics",
  "artificial intelligence", "large language models",
  "rest api", "rest apis", "graphql api", "graphql apis",
  "ci/cd", "ci cd", "continuous integration", "continuous deployment", "continuous delivery",
  "agile methodology", "agile methodologies", "scrum master", "project management",
  "product management", "product roadmap",
  "object oriented", "object-oriented", "test driven", "test-driven",
  "version control", "source control",
  "web development", "full stack", "full-stack", "front end", "front-end", "back end", "back-end",
  "cloud computing", "cloud infrastructure", "cloud native", "cloud-native",
  "devops engineer", "site reliability", "software engineer", "software developer",
  "software architecture", "system design", "distributed systems",
  "microservices architecture", "event driven", "event-driven",
  "relational database", "nosql database",
  "a/b testing", "unit testing", "integration testing", "end to end", "end-to-end",
  "code review", "pull request",
  "stakeholder management", "cross functional", "cross-functional",
];

// ─── Keyword Extraction from JD ──────────────────────────────────────────────

function extractKeywordsFromJD(jd: string): { keyword: string; importance: KeywordMatch["importance"] }[] {
  const jdLower = jd.toLowerCase();

  // Step 1: Extract known compound terms that appear in the JD
  const compoundFound: string[] = [];
  for (const term of COMPOUND_TERMS) {
    if (jdLower.includes(term)) {
      compoundFound.push(term);
    }
  }

  // Step 2: Extract individual keywords — tokenize on whitespace + punctuation
  // Strip sentence-ending punctuation before tokenizing to avoid "kubernetes." artifacts
  const cleanJD = jdLower
    .replace(/[,;:()\[\]{}'"]/g, " ")  // punctuation → spaces
    .replace(/\.(?=\s|$)/g, " ")        // sentence-ending dots → spaces
    .replace(/\//g, " ");               // slashes → spaces (handles "ci/cd" → kept as compound above)

  const tokens = cleanJD
    .split(/\s+/)
    .map((w) => w.replace(/[^a-z0-9#+.-]/g, "").trim())
    .filter((w) => w.length >= 2 && !STOP_WORDS.has(w));

  // Frequency map for unigrams
  const freq: Record<string, number> = {};
  tokens.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

  // Step 3: Sort unigrams by frequency
  const sortedUnigrams = Object.entries(freq)
    .sort(([, a], [, b]) => b - a)
    .map(([kw]) => kw);

  // Step 4: Filter out noise tokens (purely numeric, special chars, very short)
  const filteredUnigrams = sortedUnigrams.filter((kw) => {
    // Remove tokens that are purely numeric or have no alphabetic chars
    if (!/[a-z]/.test(kw)) return false;
    return true;
  });

  // Step 5: Merge — compounds first (higher signal), then unigrams
  // Key insight: KEEP constituent unigrams even if a compound contains them,
  // because the compound phrase may not be found verbatim in the resume while
  // the individual keyword ("agile", "microservices") still is.
  const seen = new Set<string>();
  const all: string[] = [];

  // Standalone technical keywords that are valuable even if they appear in a compound
  const KEEP_STANDALONE = new Set([
    "agile","scrum","kanban","python","java","javascript","typescript","kotlin","swift",
    "golang","go","rust","ruby","scala","php","perl","bash","shell","sql","nosql",
    "react","angular","vue","svelte","redux","graphql","docker","kubernetes","terraform",
    "ansible","jenkins","gradle","maven","webpack","vite","babel","eslint",
    "aws","gcp","azure","linux","unix","git","github","gitlab","jira","confluence",
    "postgresql","mysql","mongodb","redis","elasticsearch","kafka","rabbitmq",
    "nginx","apache","hadoop","spark","pytorch","tensorflow","pandas","numpy",
    "flutter","swift","android","ios","node","express","django","flask","rails","spring",
    "microservices","devops","sre","mlops","blockchain","cybersecurity","saas","api",
  ]);

  // Build set of "inseparable" compound constituents — these words are meaningless alone
  // e.g. "machine" from "machine learning", "ci"/"cd" from "ci/cd"
  const inseparableConstituents = new Set<string>();
  for (const c of compoundFound) {
    // Split on spaces AND slashes/hyphens to handle "ci/cd" → ["ci","cd"]
    const parts = c.replace(/[/\-]/g, " ").split(/\s+/).filter(Boolean);
    // Add to inseparable if not in keep-standalone list
    parts.forEach((p) => {
      if (!KEEP_STANDALONE.has(p)) {
        inseparableConstituents.add(p);
      }
    });
  }

  // Add compound terms first
  for (const c of compoundFound) {
    if (!seen.has(c)) { seen.add(c); all.push(c); }
  }

  // Add unigrams — skip noise fragments of inseparable compounds
  for (const kw of filteredUnigrams) {
    if (seen.has(kw)) continue;
    if (inseparableConstituents.has(kw)) continue;   // skip e.g. "machine", "ci", "cd"
    seen.add(kw);
    all.push(kw);
  }

  return all.slice(0, 30).map((kw, i) => ({
    keyword: kw,
    importance: i < 5 ? "critical" : i < 12 ? "high" : i < 20 ? "medium" : "low",
  }));
}

// ─── Role Detection ───────────────────────────────────────────────────────────

function detectRole(resumeLower: string): RoleType {
  const scores: Record<string, number> = {};

  for (const [role, signals] of Object.entries(ROLE_SIGNALS)) {
    scores[role] = signals.filter((s) => resumeLower.includes(s)).length;
  }

  // Promote to fullstack if both frontend AND backend signals present
  const fe = scores.tech_frontend ?? 0;
  const be = scores.tech_backend ?? 0;
  if (fe >= 3 && be >= 3) {
    scores.tech_fullstack = fe + be;
    scores.tech_frontend = 0;
    scores.tech_backend = 0;
  }

  const sorted = Object.entries(scores).sort(([, a], [, b]) => b - a);
  const [topRole, topScore] = sorted[0] ?? ["general", 0];
  return (topScore >= 2 ? topRole : "general") as RoleType;
}

// ─── Keyword Analysis ─────────────────────────────────────────────────────────

function buildKeywordAnalysis(
  jdKeywords: { keyword: string; importance: KeywordMatch["importance"] }[],
  detectedRole: RoleType,
  _resumeText: string,
  resumeLower: string,
  wordCount: number
): KeywordAnalysis {
  // No JD provided — use role-specific baseline keywords for general analysis
  if (jdKeywords.length === 0) {
    const baseKws = ROLE_BASE_KEYWORDS[detectedRole] ?? ROLE_BASE_KEYWORDS.general ?? [];
    jdKeywords = baseKws.map((k, i) => ({
      keyword: k,
      importance: (i < 3 ? "critical" : i < 6 ? "high" : "medium") as KeywordMatch["importance"],
    }));
  }

  const skillsSectionText = extractSection(resumeLower, "skills");

  const matches: KeywordMatch[] = jdKeywords.map(({ keyword, importance }) => {
    const result = findKeywordInText(keyword, resumeLower);
    const density = result.count > 0 ? (result.count / wordCount) * 100 : 0;
    const inSkillsSection = skillsSectionText
      ? findKeywordInText(keyword, skillsSectionText).found
      : false;

    return {
      keyword,
      found: result.found,
      matchType: result.matchType,
      matchedAs: result.matchedAs,
      count: result.count,
      density: parseFloat(density.toFixed(2)),
      importance,
      inSkillsSection,
    };
  });

  const matchedKeywords = matches.filter((m) => m.found && m.matchType === "exact").map((m) => m.keyword);
  const synonymMatches = matches.filter((m) => m.found && m.matchType !== "exact").map((m) => m.keyword);
  const missingKeywords = matches.filter((m) => !m.found).map((m) => m.keyword);
  const topMissingKeywords = matches
    .filter((m) => !m.found && (m.importance === "critical" || m.importance === "high"))
    .slice(0, 5)
    .map((m) => m.keyword);

  // Weighted match rate (critical keywords count more)
  const weights = { critical: 4, high: 3, medium: 2, low: 1 };
  const totalWeight = matches.reduce((s, m) => s + weights[m.importance], 0);
  const matchedWeight = matches
    .filter((m) => m.found)
    .reduce((s, m) => {
      const w = weights[m.importance];
      return s + (m.matchType === "exact" ? w : m.matchType === "synonym" ? w * 0.8 : w * 0.6);
    }, 0);
  const overallMatchRate = totalWeight > 0 ? Math.min(100, Math.round((matchedWeight / totalWeight) * 100)) : 0;

  // Average keyword density
  const foundMatches = matches.filter((m) => m.found);
  const keywordDensity =
    foundMatches.length > 0
      ? parseFloat((foundMatches.reduce((s, m) => s + m.density, 0) / foundMatches.length).toFixed(2))
      : 0;

  // Keyword stuffing: any keyword appearing >20 times or density >4%
  const stuffingDetected = matches.some((m) => m.count > 20 || m.density > 4);

  return {
    matches,
    matchedKeywords,
    synonymMatches,
    missingKeywords,
    topMissingKeywords,
    overallMatchRate,
    keywordDensity,
    stuffingDetected,
  };
}

// ─── Format Analysis ──────────────────────────────────────────────────────────

function analyzeFormat(resumeText: string, _resumeLower: string): FormatAnalysis {
  const bulletCount = (resumeText.match(/^[\s]*[•\-\*\>▪▸◦–—]/gm) || []).length;
  const quantifiedCount = (
    resumeText.match(/\d+%|\$[\d,]+|\d+x\b|\d+\+?\s+(million|thousand|users|customers|engineers|projects|team|members|countries|markets|systems|clients|months|weeks)/gi) || []
  ).length;
  const actionVerbCount = ACTION_VERBS.filter((v) =>
    new RegExp(`\\b${v}\\w*\\b`, "i").test(resumeText)
  ).length;

  const hasEmail = /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/.test(resumeText);
  const hasPhone = /(\+?[\d\s\-().]{10,15})/.test(resumeText);
  const hasLinkedIn = /linkedin\.com\/(in\/)?[\w-]+/i.test(resumeText) || /linkedin/i.test(resumeText);
  const hasGitHub = /github\.com\/[\w-]+/i.test(resumeText) || /github/i.test(resumeText);

  const detectedSections: string[] = [];
  for (const [section, pattern] of Object.entries(SECTION_PATTERNS)) {
    if (pattern.test(resumeText)) detectedSections.push(section);
  }

  // ATS compatibility checks
  const atsIssues: string[] = [];
  if (/\t{3,}/.test(resumeText)) atsIssues.push("Detected tab-based columns (ATS may misread)");
  if ((resumeText.match(/[^\x00-\x7F]/g) || []).length > 50) atsIssues.push("Non-ASCII characters may cause parsing issues");
  if (!/^[\w\s,.-]+$/m.test(resumeText.slice(0, 100))) atsIssues.push("Unusual characters at top of resume");

  const wordCount = countWords(resumeText);

  return {
    hasBulletPoints: bulletCount >= 3,
    bulletPointCount: bulletCount,
    hasQuantifiedAchievements: quantifiedCount >= 1,
    quantifiedCount,
    hasActionVerbs: actionVerbCount >= 3,
    actionVerbCount,
    wordCount,
    isOptimalLength: wordCount >= 300 && wordCount <= 800,
    hasEmail,
    hasPhone,
    hasLinkedIn,
    hasGitHub,
    detectedSections,
    atsFriendly: atsIssues.length === 0,
    atsIssues,
  };
}

// ─── Section Analysis ─────────────────────────────────────────────────────────

function buildSectionAnalysis(
  resumeText: string,
  resumeLower: string,
  fmt: FormatAnalysis,
  kw: KeywordAnalysis
): SectionAnalysis {
  const hasSummary = SECTION_PATTERNS.summary.test(resumeText);
  const hasExperience = SECTION_PATTERNS.experience.test(resumeText);
  const hasSkills = SECTION_PATTERNS.skills.test(resumeText);
  const hasEducation = SECTION_PATTERNS.education.test(resumeText);

  // Contact score
  let contactScore = 0;
  const contactFeedback: string[] = [];
  if (fmt.hasEmail) { contactScore += 30; contactFeedback.push("Email address found ✓"); }
  else contactFeedback.push("Missing email address — required for applications");
  if (fmt.hasPhone) { contactScore += 25; contactFeedback.push("Phone number found ✓"); }
  else contactFeedback.push("Missing phone number — many recruiters call before emailing");
  if (fmt.hasLinkedIn) { contactScore += 25; contactFeedback.push("LinkedIn profile found ✓"); }
  else contactFeedback.push("LinkedIn URL missing — 85% of recruiters use it to verify candidates");
  if (fmt.hasGitHub) { contactScore += 20; contactFeedback.push("GitHub profile found ✓"); }
  else contactFeedback.push("GitHub profile missing — important for technical roles");

  // Summary score
  let summaryScore = hasSummary ? 65 : 10;
  const summaryFeedback: string[] = [];
  if (!hasSummary) {
    summaryFeedback.push("No professional summary detected — add a 2-3 sentence targeted summary");
    summaryFeedback.push("A summary helps ATS rank you by immediately surfacing relevant qualifications");
  } else {
    summaryFeedback.push("Professional summary found ✓");
    // Check if summary has keywords
    const summaryText = extractSection(resumeLower, "summary");
    if (summaryText && kw.matchedKeywords.length > 0) {
      const keywordsInSummary = kw.matchedKeywords.filter((k) =>
        summaryText.includes(k.toLowerCase())
      ).length;
      if (keywordsInSummary >= 2) { summaryScore = 90; summaryFeedback.push("Summary includes relevant job keywords ✓"); }
      else summaryFeedback.push("Tip: Include 2-3 key job description terms in your summary for better ATS ranking");
    }
  }

  // Experience score
  let expScore = hasExperience ? 50 : 10;
  const expFeedback: string[] = [];
  if (!hasExperience) {
    expFeedback.push("No experience section detected — this is critical for most roles");
  } else {
    expFeedback.push("Experience section found ✓");
    if (fmt.bulletPointCount >= 8) { expScore += 20; expFeedback.push("Good use of bullet points ✓"); }
    else expFeedback.push(`${fmt.bulletPointCount} bullet points found — aim for 3–5 per role`);
    if (fmt.hasQuantifiedAchievements) { expScore += 20; expFeedback.push(`${fmt.quantifiedCount} quantified achievement(s) found ✓`); }
    else expFeedback.push("No numbers/percentages found — quantified achievements are 40% more likely to catch attention");
    if (fmt.hasActionVerbs) { expScore += 10; expFeedback.push(`${fmt.actionVerbCount} action verbs found ✓`); }
    else expFeedback.push("Start bullets with action verbs (Led, Built, Reduced, Improved...)");
  }

  // Skills score
  let skillsScore = 0;
  const skillsFeedback: string[] = [];
  if (!hasSkills) {
    skillsScore = 15;
    skillsFeedback.push("No dedicated Skills section — ATS systems look for this section specifically");
    skillsFeedback.push("Add a clearly labeled 'Skills' or 'Technical Skills' section");
  } else {
    skillsScore = 60;
    skillsFeedback.push("Skills section found ✓");
    const skillsInSection = kw.matches.filter((m) => m.found && m.inSkillsSection).length;
    const totalMatched = kw.matches.filter((m) => m.found).length;
    if (totalMatched > 0 && skillsInSection > 0) {
      const pct = Math.round((skillsInSection / totalMatched) * 100);
      skillsScore += Math.min(40, pct * 0.4);
      skillsFeedback.push(`${skillsInSection} of ${totalMatched} matched keywords appear in Skills section ✓`);
    } else {
      skillsFeedback.push("Move more job-specific skills into your Skills section for better ATS parsing");
    }
  }

  // Education score
  let educationScore = hasEducation ? 70 : 20;
  const educationFeedback: string[] = [];
  if (!hasEducation) {
    educationFeedback.push("No education section found — add one even if experience is your focus");
  } else {
    educationFeedback.push("Education section found ✓");
    if (/\b(bachelor|master|phd|doctorate|mba|b\.s\.|m\.s\.|b\.a\.|m\.a\.|associate|diploma)\b/i.test(resumeText)) {
      educationScore = 90;
      educationFeedback.push("Degree level detected ✓");
    } else {
      educationFeedback.push("Specify your degree type (Bachelor's, Master's, etc.) — ATS filters by education level");
    }
  }

  // Formatting score
  let fmtScore = 40;
  const fmtFeedback: string[] = [];
  if (fmt.hasBulletPoints) { fmtScore += 15; fmtFeedback.push("Bullet points used ✓"); }
  else fmtFeedback.push("Use bullet points — wall-of-text fails both ATS and recruiter review");
  if (fmt.isOptimalLength) { fmtScore += 20; fmtFeedback.push(`Word count (${fmt.wordCount}) is optimal ✓`); }
  else if (fmt.wordCount < 300) fmtFeedback.push(`Resume is too short (${fmt.wordCount} words) — aim for 400–650`);
  else fmtFeedback.push(`Resume may be too long (${fmt.wordCount} words) — consider condensing to 500–700`);
  if (fmt.detectedSections.length >= 4) { fmtScore += 15; fmtFeedback.push(`${fmt.detectedSections.length} sections detected ✓`); }
  else fmtFeedback.push(`Only ${fmt.detectedSections.length} sections found — add more distinct section headers`);
  if (fmt.atsFriendly) { fmtScore += 10; fmtFeedback.push("No ATS compatibility issues detected ✓"); }
  else fmt.atsIssues.forEach((issue) => fmtFeedback.push(`⚠ ${issue}`));

  return {
    contact: buildSectionScore("Contact Information", contactScore, contactFeedback),
    summary: buildSectionScore("Professional Summary", summaryScore, summaryFeedback),
    experience: buildSectionScore("Work Experience", expScore, expFeedback),
    skills: buildSectionScore("Skills Section", Math.min(100, skillsScore), skillsFeedback),
    education: buildSectionScore("Education", educationScore, educationFeedback),
    formatting: buildSectionScore("Formatting & Structure", Math.min(100, fmtScore), fmtFeedback),
  };
}

function buildSectionScore(name: string, score: number, feedback: string[]): SectionScore {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));
  const status: SectionStatus =
    clampedScore >= 80 ? "excellent" : clampedScore >= 60 ? "good" : clampedScore >= 30 ? "needs_work" : "missing";
  const improvements = feedback.filter((f) => !f.includes("✓") && !f.startsWith("⚠"));
  return { name, score: clampedScore, maxScore: 100, status, feedback, improvements };
}

// ─── Score Calculations ───────────────────────────────────────────────────────

function calcScoreBreakdown(
  sections: SectionAnalysis,
  kw: KeywordAnalysis,
  fmt: FormatAnalysis
): ScoreBreakdown {
  let keywordScore = kw.overallMatchRate;
  if (kw.stuffingDetected) keywordScore = Math.max(0, keywordScore - 15); // penalize stuffing

  return {
    keywords: Math.round(keywordScore),
    skills: sections.skills.score,
    experience: sections.experience.score,
    education: sections.education.score,
    formatting: sections.formatting.score,
    atsCompatibility: calcATSCompatibilityScore(fmt),
  };
}

function calcATSCompatibilityScore(fmt: FormatAnalysis): number {
  let score = 50;
  if (fmt.hasEmail) score += 10;
  if (fmt.hasPhone) score += 10;
  if (fmt.atsFriendly) score += 15;
  if (fmt.detectedSections.length >= 3) score += 10;
  if (fmt.isOptimalLength) score += 5;
  score -= fmt.atsIssues.length * 10;
  return Math.max(0, Math.min(100, score));
}

function calcOverallScore(
  breakdown: ScoreBreakdown,
  kw: KeywordAnalysis,
  fmt: FormatAnalysis,
  weights: WeightProfile = INDUSTRY_WEIGHTS.general
): number {
  const weighted =
    breakdown.keywords * weights.keywords +
    breakdown.skills * weights.skills +
    breakdown.experience * weights.experience +
    breakdown.education * weights.education +
    breakdown.formatting * weights.formatting +
    breakdown.atsCompatibility * weights.atsCompatibility;

  // Bonuses
  let bonus = 0;
  if (fmt.hasQuantifiedAchievements) bonus += 3;
  if (fmt.hasActionVerbs && fmt.actionVerbCount >= 5) bonus += 2;
  if (fmt.hasLinkedIn && fmt.hasGitHub) bonus += 2;
  if (kw.synonymMatches.length > 0) bonus += 1; // reward synonym diversity
  if (kw.stuffingDetected) bonus -= 10; // penalize keyword stuffing

  return Math.min(98, Math.max(2, Math.round(weighted + bonus)));
}

function calcGrade(score: number): Grade {
  if (score >= 93) return "A+";
  if (score >= 85) return "A";
  if (score >= 78) return "B+";
  if (score >= 70) return "B";
  if (score >= 63) return "C+";
  if (score >= 55) return "C";
  if (score >= 45) return "D";
  return "F";
}

// ─── Recruiter Score ──────────────────────────────────────────────────────────

function calcRecruiterScore(
  _resumeText: string,
  fmt: FormatAnalysis,
  kw: KeywordAnalysis,
  wordCount: number
): RecruiterScore {
  // Clarity: Is this easy to skim in 6 seconds?
  let clarity = 50;
  if (fmt.hasBulletPoints) clarity += 20;
  if (fmt.detectedSections.length >= 4) clarity += 15;
  if (wordCount < 800) clarity += 15;
  else if (wordCount > 1000) clarity -= 15;

  // Impact: Do achievements stand out?
  let impact = 30;
  if (fmt.hasQuantifiedAchievements) impact += Math.min(50, fmt.quantifiedCount * 10);
  if (fmt.hasActionVerbs) impact += Math.min(20, fmt.actionVerbCount * 2);

  // Relevance: Is content targeted?
  let relevance = kw.overallMatchRate * 0.8;

  // Authenticity: Does it read like a real person or keyword slop?
  let authenticity = 70;
  if (kw.stuffingDetected) authenticity -= 30;
  if (fmt.actionVerbCount >= 8) authenticity += 10; // varied verbs = more natural
  if (fmt.quantifiedCount >= 3) authenticity += 10; // specifics = authentic
  if (fmt.wordCount < 200) authenticity -= 20; // too sparse

  clarity = Math.min(100, Math.max(0, clarity));
  impact = Math.min(100, Math.max(0, impact));
  relevance = Math.min(100, Math.max(0, Math.round(relevance)));
  authenticity = Math.min(100, Math.max(0, authenticity));

  const score = Math.round((clarity * 0.3 + impact * 0.3 + relevance * 0.25 + authenticity * 0.15));
  const grade = calcGrade(score);

  const feedback: string[] = [];
  if (clarity < 60) feedback.push("Use more bullet points and clear section headers to improve scannability");
  else feedback.push("Good visual clarity — easy to scan ✓");
  if (impact < 50) feedback.push("Add specific numbers and metrics to each role to boost impact");
  else feedback.push("Achievements stand out with strong impact ✓");
  if (relevance < 50) feedback.push("Resume doesn't feel targeted to this role — customize it more");
  else feedback.push("Resume content is relevant to the job ✓");
  if (authenticity < 60) feedback.push("Avoid keyword stuffing — recruiters spot it immediately");
  else feedback.push("Resume reads naturally and authentically ✓");

  return { score, grade, clarity, impact, relevance, authenticity, feedback };
}

// ─── Suggestions Engine ───────────────────────────────────────────────────────

function buildSuggestions(
  sections: SectionAnalysis,
  kw: KeywordAnalysis,
  fmt: FormatAnalysis,
  recruiter: RecruiterScore,
  wordCount: number,
  _resumeLower: string,
  _overallScore: number,
  detectedRole: RoleType = "general"
): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let id = 0;
  const next = () => `s${++id}`;

  // ─── Critical: Missing keywords ───────────────────────────────────────────
  if (kw.topMissingKeywords.length > 0) {
    suggestions.push({
      id: next(),
      priority: "critical",
      category: "Keywords",
      title: `Add ${kw.topMissingKeywords.length} critical missing keyword(s)`,
      description: `These high-priority keywords appear in the job description but not in your resume. ATS systems rank candidates by keyword match — missing critical terms means early elimination.`,
      example: `Incorporate: "${kw.topMissingKeywords.slice(0, 4).join('", "')}"`,
      impact: Math.min(15, kw.topMissingKeywords.length * 3),
      effort: "easy",
    });
  }

  // ─── Critical: Missing skills section ─────────────────────────────────────
  if (sections.skills.score < 30) {
    suggestions.push({
      id: next(),
      priority: "critical",
      category: "Skills",
      title: "Add a dedicated 'Skills' section",
      description: "ATS systems specifically scan for a Skills section to extract your competencies. Without it, your skills buried in job descriptions may not be parsed correctly.",
      example: "TECHNICAL SKILLS\nLanguages: Python, TypeScript, Java\nFrameworks: React, FastAPI, Spring Boot\nTools: Docker, Kubernetes, PostgreSQL, AWS",
      impact: 12,
      effort: "easy",
    });
  }

  // ─── Critical: No quantified achievements ─────────────────────────────────
  if (!fmt.hasQuantifiedAchievements) {
    suggestions.push({
      id: next(),
      priority: "critical",
      category: "Impact",
      title: "Add quantified achievements with numbers",
      description: "Resumes with specific metrics are 40% more likely to receive callbacks. Numbers make your impact tangible and credible. Every role should have at least one metric.",
      example: '"Reduced API response time by 60%" → "Led team of 6 engineers" → "Grew user base from 10K to 85K"',
      impact: 12,
      effort: "medium",
    });
  }

  // ─── High: No professional summary ────────────────────────────────────────
  if (sections.summary.score < 40) {
    suggestions.push({
      id: next(),
      priority: "high",
      category: "Structure",
      title: "Add a targeted professional summary",
      description: "A 2-3 sentence summary at the top is your first impression — for both ATS and recruiter. It should contain your title, years of experience, and 2-3 keywords from the job description.",
      example: '"Senior Software Engineer with 6+ years building scalable React and Node.js applications. Proven track record delivering high-impact features at companies like [X]. Seeking to bring full-stack expertise to [Target Company]."',
      impact: 8,
      effort: "easy",
    });
  }

  // ─── High: Missing action verbs ────────────────────────────────────────────
  if (!fmt.hasActionVerbs || fmt.actionVerbCount < 3) {
    suggestions.push({
      id: next(),
      priority: "high",
      category: "Content",
      title: "Start bullets with strong action verbs",
      description: "Every bullet point should begin with a powerful action verb. This signals ownership, improves readability, and ensures ATS systems parse your experience correctly.",
      example: '"Led migration of legacy monolith to microservices, reducing deployment time by 70%"\n"Architected caching layer that handled 2M+ daily requests at 99.9% uptime"',
      impact: 7,
      effort: "medium",
    });
  }

  // ─── High: Short resume ────────────────────────────────────────────────────
  if (wordCount < 300) {
    suggestions.push({
      id: next(),
      priority: "high",
      category: "Content",
      title: `Expand resume content (currently ${wordCount} words)`,
      description: "Your resume is too thin. ATS systems and recruiters expect 400-650 words for most roles. Add more detail to each position: responsibilities, tools used, and outcomes.",
      impact: 10,
      effort: "medium",
    });
  }

  // ─── High: Keyword stuffing ────────────────────────────────────────────────
  if (kw.stuffingDetected) {
    suggestions.push({
      id: next(),
      priority: "high",
      category: "Keywords",
      title: "Reduce keyword stuffing — it's detectable",
      description: "Some keywords appear excessively. Recruiters (and AI tools) immediately flag keyword-stuffed resumes as inauthentic. Aim for 1-2 natural uses of each keyword, not 10+.",
      impact: 8,
      effort: "easy",
    });
  }

  // ─── Medium: Missing contact info ─────────────────────────────────────────
  if (!fmt.hasEmail) {
    suggestions.push({
      id: next(),
      priority: "critical",
      category: "Contact",
      title: "Add your email address",
      description: "No email address was detected. This is a disqualifying omission — recruiters cannot contact you.",
      impact: 5,
      effort: "easy",
    });
  }
  if (!fmt.hasLinkedIn) {
    suggestions.push({
      id: next(),
      priority: "medium",
      category: "Contact",
      title: "Add your LinkedIn profile URL",
      description: "85% of recruiters check LinkedIn before scheduling interviews. Include your full profile URL (linkedin.com/in/yourname) so they can verify your experience.",
      example: "linkedin.com/in/johndoe",
      impact: 4,
      effort: "easy",
    });
  }

  // ─── Medium: Missing synonym matches ──────────────────────────────────────
  if (kw.missingKeywords.length > 5 && kw.synonymMatches.length < 3) {
    suggestions.push({
      id: next(),
      priority: "medium",
      category: "Keywords",
      title: `Use keyword variations — ${kw.missingKeywords.length} terms still missing`,
      description: "Incorporate missing terms naturally into your bullet points. Don't force them — integrate them into real accomplishments. ATS systems also recognize common synonyms.",
      example: `Consider adding: "${kw.missingKeywords.slice(0, 4).join('", "')}"`,
      impact: 6,
      effort: "medium",
    });
  }

  // ─── Medium: Recruiter readability ────────────────────────────────────────
  if (recruiter.clarity < 60) {
    suggestions.push({
      id: next(),
      priority: "medium",
      category: "Format",
      title: "Improve resume scannability for human reviewers",
      description: "Recruiters spend ~6 seconds on initial review. Use consistent bullet points, bold key metrics, and clear section headers. Avoid paragraphs of dense text.",
      impact: 5,
      effort: "medium",
    });
  }

  // ─── Low: Long resume ─────────────────────────────────────────────────────
  if (wordCount > 900) {
    suggestions.push({
      id: next(),
      priority: "low",
      category: "Format",
      title: `Trim length — currently ${wordCount} words (aim for 500–700)`,
      description: "Longer resumes can reduce recruiter engagement. Cut older roles to 2-3 bullets, remove unrelated experience, and focus on the last 10 years.",
      impact: 3,
      effort: "medium",
    });
  }

  // ─── Low: GitHub missing (tech roles) ─────────────────────────────────────
  if (!fmt.hasGitHub && sections.skills.score > 50) {
    suggestions.push({
      id: next(),
      priority: "low",
      category: "Contact",
      title: "Add your GitHub profile",
      description: "For technical roles, a GitHub profile significantly builds credibility. Hiring managers often check open-source contributions and code quality before interviews.",
      example: "github.com/yourusername",
      impact: 3,
      effort: "easy",
    });
  }

  // ─── Role-specific suggestions ──────────────────────────────────────────────
  if ((detectedRole === "tech_frontend" || detectedRole === "tech_fullstack") && !fmt.hasGitHub) {
    suggestions.push({
      id: next(), priority: "medium", category: "Contact",
      title: "Add your GitHub profile link",
      description: "For frontend roles, GitHub is nearly mandatory. Recruiters and engineers check it before interviews. A portfolio of 3–5 repos (even small ones) dramatically improves credibility.",
      example: "Add: github.com/yourusername to your contact section and LinkedIn",
      impact: 5, effort: "easy",
    });
  }

  if (detectedRole === "marketing" && fmt.quantifiedCount < 3) {
    suggestions.push({
      id: next(), priority: "high", category: "Impact",
      title: "Add campaign metrics to every marketing role",
      description: "Marketing hiring managers live by numbers. Every campaign or initiative should have a metric: CTR, ROAS, revenue impact, organic traffic growth, email open rate, lead conversion %.",
      example: '"Grew organic traffic 140% in 6 months" not "Managed content strategy"',
      impact: 10, effort: "medium",
    });
  }

  if (detectedRole === "design") {
    suggestions.push({
      id: next(), priority: "high", category: "Contact",
      title: "Add a portfolio link (Behance, Dribbble, or personal site)",
      description: "For design roles, your portfolio is more important than your resume. Without a link, you're asking hiring managers to imagine your work. Don't make them guess.",
      example: "behance.net/yourname · dribbble.com/yourname · yourportfolio.com",
      impact: 12, effort: "easy",
    });
  }

  if (detectedRole === "sales" && fmt.quantifiedCount < 3) {
    suggestions.push({
      id: next(), priority: "critical", category: "Impact",
      title: "Add quota attainment and revenue numbers to every sales role",
      description: "Sales hiring is 90% about numbers. Every role needs: quota target, attainment %, revenue generated, deal size. Without these your resume reads like a job description, not a track record.",
      example: '"Hit 127% of $1.2M annual quota" · "Closed $340K net-new ARR in Q3"',
      impact: 15, effort: "medium",
    });
  }

  if (detectedRole === "product" && fmt.quantifiedCount < 2) {
    suggestions.push({
      id: next(), priority: "high", category: "Impact",
      title: "Frame achievements as product outcomes, not activities",
      description: "Product managers are evaluated on impact, not output. Replace 'Managed product roadmap' with 'Shipped 3 features that reduced churn by 18% and increased MAU by 40K'.",
      example: '"Launched X → Y% improvement in [metric]" for each major initiative',
      impact: 8, effort: "medium",
    });
  }

  // Sort by priority + impact
  const priorityOrder: Record<Priority, number> = { critical: 4, high: 3, medium: 2, low: 1 };
  return suggestions
    .sort((a, b) => priorityOrder[b.priority] - priorityOrder[a.priority] || b.impact - a.impact)
    .slice(0, 8);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function extractSection(resumeLower: string, sectionName: keyof typeof SECTION_PATTERNS): string | null {
  const pattern = SECTION_PATTERNS[sectionName];
  const match = resumeLower.match(pattern);
  if (!match || match.index === undefined) return null;

  // Take 500 chars after the section header
  return resumeLower.slice(match.index, match.index + 500);
}

function buildSummary(score: number, kw: KeywordAnalysis, fmt: FormatAnalysis): string {
  const noJD = kw.matches.length === 0;
  if (score >= 85) return noJD
    ? `Excellent resume quality with strong structure and content.`
    : `Excellent ATS score with strong keyword alignment (${kw.overallMatchRate}% match) and well-structured content.`;
  if (score >= 70) return noJD
    ? `Good resume quality. ${!fmt.hasQuantifiedAchievements ? "Add quantified achievements to stand out further." : "Consider tailoring it to specific job descriptions for higher match rates."}`
    : `Good ATS compatibility. Primary improvement: add ${kw.topMissingKeywords.slice(0, 2).join(", ")} to boost keyword match rate.`;
  if (score >= 55) return noJD
    ? `Moderate resume quality — focus on ${!fmt.hasQuantifiedAchievements ? "quantifying achievements" : "expanding your skills section"} and stronger formatting.`
    : `Moderate ATS match — focus on adding missing keywords and ${!fmt.hasQuantifiedAchievements ? "quantifying achievements" : "expanding your skills section"}.`;
  if (score >= 40) return `Below average resume score. Needs ${!fmt.hasBulletPoints ? "better formatting," : ""} stronger content${!fmt.hasQuantifiedAchievements ? ", and quantified impact" : ""}.`;
  return `Low resume quality — this resume likely isn't reaching human reviewers. Follow the critical suggestions to significantly improve your chances.`;
}

function getCompetitiveLevel(score: number): ATSResult["competitiveLevel"] {
  if (score >= 85) return "top_10";
  if (score >= 72) return "top_25";
  if (score >= 58) return "average";
  if (score >= 42) return "below_average";
  return "needs_work";
}
