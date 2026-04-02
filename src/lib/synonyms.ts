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

  // ─── Healthcare ─────────────────────────────────────────────────────────────
  "patient care": ["direct patient care", "patient management", "clinical care", "bedside care"],
  "nursing": ["registered nurse", "rn", "lpn", "licensed practical nurse", "nurse practitioner", "np"],
  "ehr": ["electronic health records", "emr", "electronic medical records", "epic", "cerner"],
  "hipaa": ["health insurance portability", "patient privacy", "phi compliance"],
  "triage": ["patient triage", "clinical assessment", "intake assessment"],
  "vital signs": ["vitals", "blood pressure", "patient monitoring"],
  "medication administration": ["med admin", "drug administration", "medication management"],
  "clinical documentation": ["charting", "clinical charting", "medical documentation"],
  "cpr": ["basic life support", "bls", "acls", "advanced cardiac life support"],
  "infection control": ["infection prevention", "sterile technique", "aseptic technique"],
  "patient education": ["patient teaching", "health education", "discharge instructions"],
  "wound care": ["wound management", "wound assessment", "dressing changes"],
  "iv therapy": ["intravenous therapy", "iv insertion", "infusion therapy"],
  "telemetry": ["cardiac monitoring", "heart monitoring", "ecg", "ekg"],

  // ─── Finance & Accounting ───────────────────────────────────────────────────
  "accounting": ["accountancy", "financial accounting", "managerial accounting"],
  "cpa": ["certified public accountant", "chartered accountant", "ca"],
  "gaap": ["generally accepted accounting principles", "accounting standards", "ifrs"],
  "financial reporting": ["financial statements", "quarterly reports", "annual reports", "10-k"],
  "auditing": ["audit", "internal audit", "external audit", "compliance audit"],
  "tax": ["tax preparation", "tax planning", "tax compliance", "tax filing"],
  "bookkeeping": ["general ledger", "journal entries", "accounts receivable", "accounts payable"],
  "reconciliation": ["bank reconciliation", "account reconciliation", "financial reconciliation"],
  "budgeting": ["budget management", "budget planning", "financial planning", "forecasting"],
  "payroll": ["payroll processing", "payroll management", "compensation"],
  "financial analysis": ["financial modeling", "variance analysis", "ratio analysis"],
  "quickbooks": ["sage", "xero", "freshbooks", "accounting software"],
  "sap": ["oracle financials", "netsuite", "erp", "enterprise resource planning"],
  "bloomberg": ["bloomberg terminal", "financial terminal", "reuters"],
  "risk management": ["risk assessment", "risk mitigation", "credit risk"],

  // ─── Legal ──────────────────────────────────────────────────────────────────
  "legal research": ["case research", "legal analysis", "statutory research"],
  "litigation": ["trial", "court proceedings", "dispute resolution", "arbitration"],
  "contract": ["contract review", "contract drafting", "contract negotiation", "contract management"],
  "compliance": ["regulatory compliance", "legal compliance", "corporate governance"],
  "discovery": ["e-discovery", "document review", "legal discovery"],
  "intellectual property": ["ip", "patent", "trademark", "copyright"],
  "corporate law": ["business law", "commercial law", "m&a", "mergers and acquisitions"],
  "westlaw": ["lexisnexis", "legal database", "case law database"],
  "paralegal": ["legal assistant", "legal secretary", "legal support"],
  "bar exam": ["bar admission", "bar certified", "licensed attorney"],
  "due diligence": ["legal due diligence", "dd", "investigation"],

  // ─── Education ──────────────────────────────────────────────────────────────
  "curriculum": ["curriculum development", "curriculum design", "course design"],
  "pedagogy": ["teaching methods", "instructional design", "instructional strategies"],
  "assessment": ["student assessment", "grading", "evaluation", "testing"],
  "lesson planning": ["lesson plans", "course planning", "instruction planning"],
  "special education": ["sped", "iep", "individualized education program", "learning disabilities"],
  "classroom management": ["student behavior", "behavior management", "discipline"],
  "lms": ["learning management system", "canvas", "blackboard", "moodle", "google classroom"],
  "differentiated instruction": ["personalized learning", "adaptive learning", "student-centered"],
  "accreditation": ["school accreditation", "program accreditation", "certification"],

  // ─── Operations & Manufacturing ─────────────────────────────────────────────
  "lean": ["lean manufacturing", "lean management", "lean six sigma"],
  "six sigma": ["6 sigma", "dmaic", "process improvement"],
  "supply chain": ["supply chain management", "scm", "logistics", "procurement"],
  "inventory": ["inventory management", "inventory control", "warehouse management", "wms"],
  "quality assurance": ["qa", "quality control", "qc", "iso 9001", "quality management"],
  "continuous improvement": ["kaizen", "process optimization", "operational excellence"],
  "erp": ["enterprise resource planning", "sap", "oracle", "microsoft dynamics"],
  "procurement": ["purchasing", "vendor management", "supplier management", "sourcing"],
  "kpi": ["key performance indicators", "metrics", "performance metrics"],

  // ─── Human Resources ────────────────────────────────────────────────────────
  "recruitment": ["recruiting", "talent acquisition", "hiring", "staffing"],
  "onboarding": ["new hire orientation", "employee orientation", "new employee onboarding"],
  "performance management": ["performance review", "performance appraisal", "annual review"],
  "employee relations": ["labor relations", "workplace relations", "er"],
  "compensation": ["compensation and benefits", "total rewards", "salary administration"],
  "hris": ["human resource information system", "workday", "bamboohr", "adp", "peoplesoft"],
  "training": ["learning and development", "l&d", "employee training", "professional development"],
  "diversity": ["dei", "diversity equity inclusion", "d&i", "equal opportunity"],
  "organizational development": ["od", "change management", "culture development"],

  // ─── Hospitality ────────────────────────────────────────────────────────────
  "guest services": ["customer service", "guest relations", "front desk", "concierge"],
  "food safety": ["servsafe", "haccp", "food handling", "food hygiene"],
  "pos": ["point of sale", "pos system", "cash register"],
  "hospitality management": ["hotel management", "restaurant management", "f&b management"],
  "event planning": ["event management", "event coordination", "banquet management"],
  "housekeeping": ["room service", "facilities maintenance", "janitorial"],

  // ─── Trades / Construction ──────────────────────────────────────────────────
  "osha": ["occupational safety", "workplace safety", "safety compliance"],
  "blueprint": ["blueprints", "schematics", "technical drawings", "cad drawings"],
  "hvac": ["heating ventilation", "air conditioning", "climate control"],
  "electrical": ["electrical systems", "wiring", "circuitry", "nec code"],
  "plumbing": ["pipe fitting", "plumbing systems", "water systems"],
  "welding": ["mig welding", "tig welding", "arc welding", "fabrication"],
  "construction management": ["project management", "site management", "general contractor"],

  // ─── Government ─────────────────────────────────────────────────────────────
  "public policy": ["policy analysis", "policy development", "policy implementation"],
  "grant writing": ["grant management", "grant administration", "federal grants"],
  "public administration": ["government administration", "civil service"],
  "legislative": ["legislation", "regulatory", "congressional", "parliamentary"],
  "security clearance": ["clearance", "top secret", "secret clearance", "ts/sci"],
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
