/**
 * Deep Resume Analyzer — Line-by-Line Intelligence
 *
 * Analyzes:
 *  - Contact info validation (email, phone format, URL quality)
 *  - Summary quality (word count, generic phrases, weak language)
 *  - Experience bullet quality (action verbs, metrics, weak starters)
 *  - Layout/formatting issues detectable from plain text
 */

import type {
  DeepAnalysis, ContactIssue, BulletQuality, Suggestion, Priority,
} from "@/types";

// ─── Weak starters (passive / vague language) ────────────────────────────────
const WEAK_STARTERS = [
  "responsible for", "worked on", "helped with", "helped to",
  "assisted with", "assisted in", "participated in", "involved in",
  "contributed to", "tasked with", "duties included", "duties:",
  "worked as", "worked in", "helped", "did", "handled",
];

// ─── Strong action verbs (first word of bullet) ──────────────────────────────
const STRONG_VERBS = new Set([
  "achieved","architected","automated","built","collaborated","coordinated",
  "created","defined","delivered","deployed","designed","developed","directed",
  "drove","engineered","enhanced","established","executed","expanded",
  "facilitated","formulated","founded","generated","grew","guided","headed",
  "implemented","improved","increased","initiated","integrated","introduced",
  "launched","led","managed","mentored","modernized","negotiated","optimized",
  "oversaw","partnered","pioneered","produced","programmed","reduced",
  "refactored","resolved","scaled","secured","shaped","shipped","simplified",
  "spearheaded","streamlined","transformed","trained","unified","upgraded",
  "validated","analyzed","assessed","influenced","researched",
]);

// ─── Generic phrases that weaken summaries ───────────────────────────────────
const GENERIC_PHRASES = [
  "passionate about", "passion for",
  "team player", "team-player",
  "hard worker", "hard-working",
  "detail-oriented", "detail oriented",
  "results-driven", "results driven",
  "seeking a challenging", "seeking challenging",
  "strong communication skills",
  "excellent interpersonal skills",
  "motivated professional",
  "dynamic professional",
  "thought leader",
  "go-getter", "go getter",
  "synergy", "synergize",
  "thinking outside the box",
  "leverage", "leveraging my",
  "looking for an opportunity",
];

// ─── Weak language patterns ───────────────────────────────────────────────────
const WEAK_LANGUAGE = [
  "responsible for", "worked on", "helped with",
  "contributed to", "was involved", "participated in",
  "assisted in", "had experience",
];

// ─── Decorative / ATS-breaking characters ────────────────────────────────────
const DECORATIVE_CHARS = /[✨⭐●▸▪►■☆★⚡🔗📧💼🎨🔷◆◇✔✦✗✕❌✅🔴🟢🟡]/g;

// ─── Metric patterns (numbers, %, $, K/M/B) ─────────────────────────────────
const METRIC_PATTERN = /\b(\d+(\.\d+)?(%|\+|x|X)?|\$[\d,]+[KMBkmb]?|\d+[KMBkmb])\b|(\d+%)|(\d+x)|\b(\d+)(\+)?\s*(users?|customers?|clients?|engineers?|developers?|people|members?|leads?)/i;

// ─── Extract bullet points from resume text ───────────────────────────────────
function extractBullets(resumeText: string): string[] {
  const lines = resumeText.split("\n");
  const bullets: string[] = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) continue;

    // Lines starting with bullet chars
    const bulletMatch = line.match(/^[•\-\*◦▸▪►–—]\s+(.+)/);
    if (bulletMatch) {
      bullets.push(bulletMatch[1].trim());
      continue;
    }

    // Lines starting with a capital action verb (likely a bullet without marker)
    if (line.length > 30 && line.length < 300) {
      const firstWord = line.split(/\s+/)[0]?.replace(/[^a-zA-Z]/g, "").toLowerCase();
      if (firstWord && STRONG_VERBS.has(firstWord)) {
        bullets.push(line);
      }
    }
  }

  return bullets.filter((b) => b.length > 15 && b.length < 400);
}

// ─── Analyze a single bullet ─────────────────────────────────────────────────
function scoreBullet(text: string): BulletQuality {
  const lower = text.toLowerCase().trim();
  const firstWord = lower.split(/\s+/)[0]?.replace(/[^a-z]/g, "");
  const hasActionVerb = STRONG_VERBS.has(firstWord ?? "");
  const hasMetric = METRIC_PATTERN.test(text);

  const weakStarter = WEAK_STARTERS.find((ws) => lower.startsWith(ws));

  // Score: 40 base + 30 for action verb + 30 for metric
  let score = 40;
  if (hasActionVerb) score += 30;
  if (hasMetric) score += 30;
  if (weakStarter) score -= 20;

  score = Math.max(0, Math.min(100, score));

  let improvedVersion: string | undefined;
  if (weakStarter && !hasMetric) {
    // Give a pattern hint for the rewrite
    const withoutWeak = text.replace(new RegExp("^" + weakStarter, "i"), "").trim();
    improvedVersion = `[Action Verb] ${withoutWeak} — add metric: "increased by X%" or "handled Y users"`;
  } else if (!hasMetric && hasActionVerb) {
    improvedVersion = `${text} — add impact metric (%, $, users, time saved)`;
  }

  return { text, score, hasActionVerb, hasMetric, weakStarter, improvedVersion };
}

// ─── Contact Info Analysis ────────────────────────────────────────────────────
function analyzeContactInfo(resumeText: string): DeepAnalysis["contact"] {
  const issues: ContactIssue[] = [];
  const lines = resumeText.slice(0, 600); // header is usually at top

  // Phone: exists but missing country code
  const phoneMatch = lines.match(/\b(\(?\d{3}\)?[\s\-\.]\d{3}[\s\-\.]\d{4})\b/);
  if (phoneMatch) {
    const phone = phoneMatch[1];
    const hasCountryCode = /^\+?\d{1,3}[\s\-]/.test(lines.slice(Math.max(0, lines.indexOf(phone) - 3)));
    if (!hasCountryCode) {
      issues.push({
        field: "phone",
        issue: "Phone number is missing country code",
        currentValue: phone,
        suggestedValue: `+1 ${phone.replace(/^\(/, "(").replace(/\)/, ")")}`,
        scoreImpact: 3,
      });
    }
  }

  // LinkedIn: present but no https://
  const linkedinMatch = resumeText.match(/(?<!https?:\/\/)(?:www\.)?linkedin\.com\/in\/([a-zA-Z0-9_-]+)/i);
  if (linkedinMatch) {
    issues.push({
      field: "linkedin",
      issue: 'LinkedIn URL missing "https://" protocol — breaks in ATS',
      currentValue: linkedinMatch[0],
      suggestedValue: `https://linkedin.com/in/${linkedinMatch[1]}`,
      scoreImpact: 2,
    });
  }

  // GitHub: shortened URL
  const shortUrlMatch = resumeText.match(/\b(bit\.ly|t\.co|tinyurl|goo\.gl|ow\.ly)\/[a-zA-Z0-9_-]+/i);
  if (shortUrlMatch) {
    issues.push({
      field: "github",
      issue: "Shortened URL detected — will break in ATS parsers",
      currentValue: shortUrlMatch[0],
      suggestedValue: "https://github.com/yourusername (use full URL)",
      scoreImpact: 5,
    });
  }

  // Email: non-professional patterns
  const emailMatch = resumeText.match(/\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/);
  if (emailMatch) {
    const email = emailMatch[0].toLowerCase();
    if (
      /\d{4,}/.test(email.split("@")[0]) ||
      /(123|456|789|321|cool|hotmail\.com|yopmail|mailinator)/.test(email)
    ) {
      issues.push({
        field: "email",
        issue: "Email may appear unprofessional (numbers/informal service)",
        currentValue: email,
        suggestedValue: "firstname.lastname@gmail.com",
        scoreImpact: 2,
      });
    }
  }

  const scoreDeduction = issues.reduce((s, i) => s + i.scoreImpact, 0);
  return { score: Math.max(0, 100 - scoreDeduction * 4), issues };
}

// ─── Summary Quality Analysis ─────────────────────────────────────────────────
function analyzeSummary(resumeText: string): DeepAnalysis["summary"] {
  const lower = resumeText.toLowerCase();

  // Try to extract summary section (first ~300 chars before "experience" or "skills")
  const summaryEnd = Math.min(
    lower.indexOf("experience") > 0 ? lower.indexOf("experience") : 9999,
    lower.indexOf("employment") > 0 ? lower.indexOf("employment") : 9999,
    lower.indexOf("work history") > 0 ? lower.indexOf("work history") : 9999,
    500
  );
  const summaryText = resumeText.slice(0, summaryEnd).trim();
  const wordCount = summaryText.split(/\s+/).filter(Boolean).length;

  const genericPhrasesFound = GENERIC_PHRASES.filter((p) => lower.includes(p));
  const weakLanguageFound = WEAK_LANGUAGE.filter((p) => lower.includes(p));
  const actionVerbsFound = Array.from(STRONG_VERBS).filter((v) =>
    lower.slice(0, summaryEnd).includes(v)
  );

  // Scoring
  let score = 100;
  if (wordCount < 30) score -= 30; // too short
  else if (wordCount < 60) score -= 15;
  if (wordCount > 200) score -= 20; // too long
  score -= genericPhrasesFound.length * 10;
  score -= weakLanguageFound.length * 8;
  if (actionVerbsFound.length === 0) score -= 15;

  return {
    wordCount,
    score: Math.max(0, Math.min(100, score)),
    genericPhrasesFound,
    weakLanguageFound,
    actionVerbsFound,
    extractedText: summaryText.slice(0, 300),
  };
}

// ─── Bullet Analysis ──────────────────────────────────────────────────────────
function analyzeBullets(resumeText: string): DeepAnalysis["bullets"] {
  const bullets = extractBullets(resumeText);
  if (bullets.length === 0) {
    return { total: 0, withMetrics: 0, withActionVerbs: 0, weakBullets: [], avgScore: 0 };
  }

  const analyzed = bullets.map(scoreBullet);
  const withMetrics = analyzed.filter((b) => b.hasMetric).length;
  const withActionVerbs = analyzed.filter((b) => b.hasActionVerb).length;
  const weakBullets = analyzed
    .filter((b) => b.score < 60)
    .sort((a, b) => a.score - b.score)
    .slice(0, 6); // top 6 worst bullets

  const avgScore = Math.round(analyzed.reduce((s, b) => s + b.score, 0) / analyzed.length);

  return { total: bullets.length, withMetrics, withActionVerbs, weakBullets, avgScore };
}

// ─── Layout Issues (from text) ────────────────────────────────────────────────
function analyzeLayout(resumeText: string): DeepAnalysis["layout"] {
  const issues: string[] = [];
  let score = 100;

  // Decorative characters
  const decorativeMatches = resumeText.match(DECORATIVE_CHARS) ?? [];
  const uniqueDecorative = [...new Set(decorativeMatches)];
  if (uniqueDecorative.length > 0) {
    issues.push(`Decorative characters found: ${uniqueDecorative.slice(0, 5).join(" ")} — ATS may drop entire lines`);
    score -= Math.min(20, uniqueDecorative.length * 4);
  }

  // Pipe separators (common in 2-column layouts)
  const pipeCount = (resumeText.match(/\|/g) ?? []).length;
  if (pipeCount > 5) {
    issues.push(`${pipeCount} pipe separators detected — suggests 2-column or table layout (ATS reads incorrectly)`);
    score -= 15;
  }

  // ALL CAPS section headers (some ATS can't parse them)
  const lines = resumeText.split("\n");
  const allCapsLines = lines.filter((l) => {
    const t = l.trim();
    return t.length > 3 && t.length < 30 && t === t.toUpperCase() && /[A-Z]{3,}/.test(t);
  });
  if (allCapsLines.length > 6) {
    issues.push("Excessive all-caps text detected — may indicate non-standard formatting");
    score -= 5;
  }

  // Emoji characters (separate from decorative)
  const emojiCount = (resumeText.match(/\p{Emoji_Presentation}/gu) ?? []).length;
  if (emojiCount > 0) {
    issues.push(`${emojiCount} emoji detected — ATS systems cannot read emoji, may corrupt nearby text`);
    score -= Math.min(15, emojiCount * 3);
  }

  return {
    decorativeCharsFound: uniqueDecorative,
    pipeCount,
    allCapsLinesCount: allCapsLines.length,
    score: Math.max(0, score),
    issues,
  };
}

// ─── Main Export ──────────────────────────────────────────────────────────────
export function runDeepAnalysis(resumeText: string): DeepAnalysis {
  return {
    contact: analyzeContactInfo(resumeText),
    summary: analyzeSummary(resumeText),
    bullets: analyzeBullets(resumeText),
    layout: analyzeLayout(resumeText),
  };
}

// ─── Generate extra deep suggestions ─────────────────────────────────────────
export function buildDeepSuggestions(deep: DeepAnalysis): Suggestion[] {
  const suggestions: Suggestion[] = [];
  let id = 900;
  const next = () => `d${++id}`;

  // ── Contact issues ──────────────────────────────────────────────────────────
  for (const issue of deep.contact.issues) {
    const priority: Priority = issue.scoreImpact >= 5 ? "high" : "medium";
    suggestions.push({
      id: next(),
      priority,
      category: "Contact",
      title: issue.issue,
      description: `Fix this to ensure ATS parsers and recruiters can correctly read your contact info.`,
      currentText: issue.currentValue,
      improvedText: issue.suggestedValue,
      impact: issue.scoreImpact,
      effort: "easy",
      timeNeeded: "1 min",
    });
  }

  // ── Summary generic phrases ─────────────────────────────────────────────────
  if (deep.summary.genericPhrasesFound.length > 0) {
    const phrase = deep.summary.genericPhrasesFound[0];
    suggestions.push({
      id: next(),
      priority: "high",
      category: "Content",
      title: "Remove generic phrases from your summary",
      description: `Phrases like "${phrase}" are red flags — every resume says this. Replace with specific achievements, technologies, and metrics.`,
      currentText: deep.summary.extractedText.slice(0, 200),
      improvedText: `[Your title] specializing in [key tech stack]. Built [# apps/systems] serving [# users/customers]. Expert in [3-4 core skills]. [Key achievement with metric].`,
      impact: 8,
      effort: "medium",
      timeNeeded: "10 min",
    });
  }

  // ── Weak language in summary ────────────────────────────────────────────────
  if (deep.summary.weakLanguageFound.length > 1 && deep.summary.genericPhrasesFound.length === 0) {
    suggestions.push({
      id: next(),
      priority: "medium",
      category: "Content",
      title: 'Replace passive language ("responsible for") with action verbs',
      description: "Passive language signals a job description, not a track record. Start every bullet and summary sentence with a strong action verb.",
      currentText: deep.summary.weakLanguageFound.slice(0, 3).join(" · "),
      improvedText: "Led · Architected · Built · Reduced · Increased · Shipped",
      impact: 6,
      effort: "medium",
      timeNeeded: "15 min",
    });
  }

  // ── Weak bullets ────────────────────────────────────────────────────────────
  const worstBullets = deep.bullets.weakBullets.filter((b) => b.score < 50);
  if (worstBullets.length > 0) {
    const worst = worstBullets[0];
    suggestions.push({
      id: next(),
      priority: "critical",
      category: "Impact",
      title: `${worstBullets.length} bullet point(s) lack action verbs and metrics`,
      description:
        "Weak bullets are the #1 reason resumes get filtered out. Use the pattern: [Action Verb] + [What] + [Tech/Scale] + [Result] + [Metric].",
      currentText: worst.text,
      improvedText: worst.improvedVersion ?? `[Verb] ${worst.text} — add: "resulting in X% improvement" or "serving Y users"`,
      impact: 12,
      effort: "medium",
      timeNeeded: `${Math.min(30, worstBullets.length * 5)} min`,
    });
  }

  // ── No metrics in bullets ────────────────────────────────────────────────────
  if (
    deep.bullets.total > 3 &&
    deep.bullets.withMetrics === 0
  ) {
    suggestions.push({
      id: next(),
      priority: "critical",
      category: "Impact",
      title: "Zero bullets have quantified metrics",
      description: "Every bullet point should show impact with numbers. Resumes with metrics get 40% more callbacks.",
      currentText: deep.bullets.weakBullets[0]?.text ?? "— (no extractable bullets)",
      improvedText:
        'Pattern: "[Action] [What], [Metric result]"\nExample: "Architected payment service handling $2M/day, reducing fraud by 34%"',
      impact: 14,
      effort: "medium",
      timeNeeded: `${deep.bullets.total * 3} min`,
    });
  }

  // ── Layout / decorative chars ───────────────────────────────────────────────
  if (deep.layout.decorativeCharsFound.length > 0) {
    suggestions.push({
      id: next(),
      priority: "medium",
      category: "Format",
      title: "Remove decorative characters (✨ ● ▸) — ATS may drop entire lines",
      description:
        "Decorative bullets and emoji cause ATS parsers to skip entire lines or produce garbled output. Use standard dashes (–) or dots (•) only.",
      currentText: `Found: ${deep.layout.decorativeCharsFound.slice(0, 8).join(" ")}`,
      improvedText: "Replace all with: – or • (standard dash/bullet)",
      impact: 6,
      effort: "easy",
      timeNeeded: "5 min",
    });
  }

  // ── Pipe / table layout ─────────────────────────────────────────────────────
  if (deep.layout.pipeCount > 5) {
    suggestions.push({
      id: next(),
      priority: "high",
      category: "Format",
      title: "Table or multi-column layout detected — ATS reads columns out of order",
      description:
        "Pipes (|) and tables cause ATS to read left column then right column, scrambling your resume. Convert to a single-column, top-to-bottom layout.",
      currentText: `${deep.layout.pipeCount} pipe characters detected (suggests multi-column format)`,
      improvedText:
        "Single column: Name → Contact → Summary → Skills → Experience → Education",
      impact: 15,
      effort: "medium",
      timeNeeded: "10 min",
    });
  }

  return suggestions;
}
