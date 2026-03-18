/**
 * Comprehensive synonym dictionary for ATS keyword matching.
 * Each key is the "canonical" form; values are common aliases ATS systems see.
 * This is our main differentiator over basic tools that only do exact matching.
 */

export const SYNONYMS: Record<string, string[]> = {
  // ─── JavaScript ecosystem ───────────────────────────────────────────────────
  "javascript": ["js", "ecmascript", "es6", "es2015", "es2020", "es2022", "vanilla js", "vanilla javascript"],
  "typescript": ["ts", "typed javascript", "type script"],
  "node.js": ["nodejs", "node js", "node", "server-side javascript"],
  "react": ["reactjs", "react.js", "react js", "react native"],
  "next.js": ["nextjs", "next js", "next"],
  "vue.js": ["vuejs", "vue js", "vue", "nuxt", "nuxt.js"],
  "angular": ["angularjs", "angular.js", "angular 2", "angular 12", "angular 15"],
  "svelte": ["sveltekit", "svelte kit"],
  "express.js": ["expressjs", "express js", "express"],
  "gatsby": ["gatsby.js", "gatsbyjs"],

  // ─── Frontend ───────────────────────────────────────────────────────────────
  "html": ["html5", "html 5", "markup"],
  "css": ["css3", "css 3", "stylesheets", "cascading style sheets"],
  "sass": ["scss", "less", "css preprocessor"],
  "tailwind": ["tailwindcss", "tailwind css", "utility-first css"],
  "bootstrap": ["bootstrap 4", "bootstrap 5"],
  "responsive design": ["mobile-first", "mobile first", "responsive web design", "rwd"],
  "web accessibility": ["wcag", "a11y", "accessibility", "aria"],
  "webpack": ["bundler", "module bundler", "vite", "rollup", "parcel"],

  // ─── Backend ────────────────────────────────────────────────────────────────
  "python": ["python3", "python 3", "py", "cpython"],
  "django": ["django rest framework", "drf"],
  "flask": ["flask python"],
  "fastapi": ["fast api"],
  "java": ["java 8", "java 11", "java 17", "java se", "java ee"],
  "spring": ["spring boot", "spring framework", "spring mvc"],
  "go": ["golang", "go lang"],
  "rust": ["rust lang"],
  "ruby": ["ruby on rails", "rails", "ror"],
  "php": ["php 8", "laravel", "symfony", "codeigniter"],
  "c#": ["csharp", "c sharp", ".net", "dotnet", "asp.net"],
  "c++": ["cpp", "c plus plus"],

  // ─── Database ────────────────────────────────────────────────────────────────
  "sql": ["structured query language", "database query"],
  "mysql": ["my sql", "mysql server"],
  "postgresql": ["postgres", "pg", "psql"],
  "microsoft sql server": ["mssql", "sql server", "t-sql", "tsql"],
  "oracle": ["oracle database", "oracle sql", "pl/sql", "plsql"],
  "sqlite": ["sqlite3"],
  "nosql": ["non-relational database", "document database"],
  "mongodb": ["mongo", "mongo db"],
  "dynamodb": ["dynamo db", "aws dynamodb"],
  "redis": ["redis cache", "in-memory database"],
  "elasticsearch": ["elastic search", "elastic", "opensearch"],
  "cassandra": ["apache cassandra"],
  "firebase": ["firestore", "firebase realtime database"],

  // ─── Cloud & DevOps ──────────────────────────────────────────────────────────
  "amazon web services": ["aws", "amazon cloud", "cloud infrastructure"],
  "google cloud": ["gcp", "google cloud platform"],
  "microsoft azure": ["azure", "azure cloud"],
  "docker": ["containerization", "containers", "container", "dockerfile"],
  "kubernetes": ["k8s", "container orchestration", "helm"],
  "terraform": ["iac", "infrastructure as code", "hashicorp"],
  "ansible": ["configuration management", "automation"],
  "ci/cd": ["continuous integration", "continuous deployment", "continuous delivery", "continuous integration/continuous deployment"],
  "github actions": ["gh actions", "github workflows"],
  "jenkins": ["jenkins pipeline", "jenkins ci"],
  "gitlab ci": ["gitlab pipelines"],
  "devops": ["site reliability engineering", "sre", "platform engineering"],
  "linux": ["unix", "ubuntu", "centos", "debian", "rhel", "bash"],
  "shell scripting": ["bash scripting", "bash script", "shell script", "zsh"],
  "nginx": ["apache", "web server"],
  "serverless": ["lambda", "aws lambda", "cloud functions", "faas"],

  // ─── Data & ML ───────────────────────────────────────────────────────────────
  "machine learning": ["ml", "statistical learning", "predictive modeling", "supervised learning"],
  "deep learning": ["neural networks", "dl", "convolutional neural networks"],
  "artificial intelligence": ["ai", "ai/ml", "ml/ai"],
  "natural language processing": ["nlp", "text analysis", "language models"],
  "computer vision": ["cv", "image recognition", "object detection"],
  "data science": ["data analysis", "data analytics", "analytics", "data mining"],
  "data engineering": ["data pipeline", "etl", "elt", "data infrastructure"],
  "pandas": ["pandas library", "dataframes"],
  "numpy": ["numpy library"],
  "scikit-learn": ["sklearn", "scikit learn"],
  "tensorflow": ["tf", "keras"],
  "pytorch": ["torch"],
  "spark": ["apache spark", "pyspark"],
  "tableau": ["data visualization", "business intelligence", "bi"],
  "power bi": ["powerbi", "microsoft power bi"],

  // ─── Project & Process ────────────────────────────────────────────────────────
  "agile": ["scrum", "kanban", "sprint planning", "agile methodology", "agile development"],
  "scrum": ["scrum master", "sprint", "sprint planning", "daily standup"],
  "jira": ["atlassian jira", "project tracking"],
  "confluence": ["atlassian confluence"],
  "product management": ["product manager", "pm", "product owner"],
  "project management": ["pmp", "project manager", "program management", "project lead"],
  "git": ["git version control", "source control"],
  "github": ["git hub", "github.com"],
  "gitlab": ["git lab"],
  "bitbucket": ["bit bucket", "atlassian bitbucket"],
  "version control": ["vcs", "source control management", "scm"],
  "rest api": ["restful api", "restful", "rest", "http api", "web api", "api development"],
  "graphql": ["graph ql", "apollo", "relay"],
  "microservices": ["service oriented architecture", "soa", "distributed systems", "microservice"],
  "architecture": ["system design", "software architecture", "technical architecture"],

  // ─── Soft skills ─────────────────────────────────────────────────────────────
  "communication": ["verbal communication", "written communication", "presentation skills"],
  "leadership": ["team lead", "team leadership", "people management", "managing teams"],
  "collaboration": ["teamwork", "cross-functional", "cross-functional teams", "worked with teams"],
  "problem solving": ["problem-solving", "troubleshooting", "root cause analysis", "debugging"],
  "analytical skills": ["analytical thinking", "data-driven", "quantitative analysis"],
  "time management": ["prioritization", "deadline management", "multitasking"],
  "mentoring": ["coaching", "mentorship", "training junior engineers"],

  // ─── Security ─────────────────────────────────────────────────────────────────
  "cybersecurity": ["information security", "infosec", "security engineering"],
  "penetration testing": ["pentest", "pen test", "ethical hacking"],
  "oauth": ["oauth2", "openid connect", "oidc", "authentication"],
  "jwt": ["json web token", "token-based authentication"],

  // ─── Other tech ───────────────────────────────────────────────────────────────
  "ui/ux": ["user interface", "user experience", "ux design", "ui design", "product design"],
  "figma": ["sketch", "adobe xd", "design tools", "prototyping"],
  "a/b testing": ["experimentation", "split testing", "feature flags"],
  "seo": ["search engine optimization", "technical seo"],
  "analytics": ["google analytics", "mixpanel", "amplitude", "tracking"],
};

/**
 * Build a reverse lookup: synonym → canonical keyword
 */
export const SYNONYM_REVERSE: Record<string, string> = {};
for (const [canonical, aliases] of Object.entries(SYNONYMS)) {
  for (const alias of aliases) {
    SYNONYM_REVERSE[alias.toLowerCase()] = canonical;
  }
}

/**
 * Given a keyword (from JD), find all its aliases to search for in the resume.
 * Returns the keyword itself + all its known synonyms.
 */
export function expandKeyword(keyword: string): string[] {
  const kw = keyword.toLowerCase().trim();
  const aliases = SYNONYMS[kw] ?? [];

  // Also check if this keyword is itself an alias
  const canonical = SYNONYM_REVERSE[kw];
  const canonicalAliases = canonical ? SYNONYMS[canonical] ?? [] : [];

  return Array.from(new Set([kw, ...aliases, ...(canonical ? [canonical] : []), ...canonicalAliases]));
}

/**
 * Check if a keyword (or any of its synonyms) exists in text.
 * Returns match type: "exact", "synonym", "stemmed", or "none"
 */
export function findKeywordInText(
  keyword: string,
  text: string
): { found: boolean; matchType: "exact" | "synonym" | "stemmed" | "none"; matchedAs?: string; count: number } {
  const textLower = text.toLowerCase();
  const kwLower = keyword.toLowerCase().trim();

  // Exact match
  const exactRegex = new RegExp(`\\b${escapeRegex(kwLower)}\\b`, "gi");
  const exactMatches = textLower.match(exactRegex);
  if (exactMatches && exactMatches.length > 0) {
    return { found: true, matchType: "exact", matchedAs: kwLower, count: exactMatches.length };
  }

  // Synonym match
  const synonyms = expandKeyword(kwLower);
  for (const syn of synonyms) {
    if (syn === kwLower) continue;
    const synRegex = new RegExp(`\\b${escapeRegex(syn)}\\b`, "gi");
    const synMatches = textLower.match(synRegex);
    if (synMatches && synMatches.length > 0) {
      return { found: true, matchType: "synonym", matchedAs: syn, count: synMatches.length };
    }
  }

  // Stemmed match (basic stemming: check if keyword starts with the stem)
  if (kwLower.length > 5) {
    const stem = kwLower.slice(0, Math.floor(kwLower.length * 0.8));
    const stemRegex = new RegExp(`\\b${escapeRegex(stem)}\\w*\\b`, "gi");
    const stemMatches = textLower.match(stemRegex);
    if (stemMatches && stemMatches.length > 0) {
      return { found: true, matchType: "stemmed", matchedAs: stemMatches[0], count: stemMatches.length };
    }
  }

  return { found: false, matchType: "none", count: 0 };
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
