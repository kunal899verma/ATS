import type { RoleType, ExperienceLevel, DetectedTech, SkillSuggestion, RoleReadiness, ResumeAddition, CareerIntelligence } from "@/types";

// ─── Experience Level Display Maps ───────────────────────────────────────────

export const EXPERIENCE_LABELS: Record<ExperienceLevel, string> = {
  intern:    "Intern / Student",
  junior:    "Junior (0–2 yrs)",
  mid:       "Mid-Level (2–5 yrs)",
  senior:    "Senior (5–8 yrs)",
  lead:      "Lead / Staff (8–12 yrs)",
  principal: "Principal / Architect (12+ yrs)",
};

export const EXPERIENCE_COLORS: Record<ExperienceLevel, { text: string; bg: string; border: string }> = {
  intern:    { text: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/20" },
  junior:    { text: "text-cyan-400",    bg: "bg-cyan-500/10",    border: "border-cyan-500/20" },
  mid:       { text: "text-blue-400",    bg: "bg-blue-500/10",    border: "border-blue-500/20" },
  senior:    { text: "text-violet-400",  bg: "bg-violet-500/10",  border: "border-violet-500/20" },
  lead:      { text: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/20" },
  principal: { text: "text-pink-400",    bg: "bg-pink-500/10",    border: "border-pink-500/20" },
};

// ─── Tech Detection Signals ───────────────────────────────────────────────────

const TECH_SIGNALS: Array<{ name: string; category: DetectedTech["category"]; patterns: string[] }> = [
  // Frontend frameworks
  { name: "React",      category: "framework", patterns: ["react", "react.js", "reactjs", "next.js", "nextjs", "jsx", "tsx", "redux", "react native"] },
  { name: "Vue.js",     category: "framework", patterns: ["vue", "vue.js", "vuejs", "nuxt", "vuex", "pinia"] },
  { name: "Angular",    category: "framework", patterns: ["angular", "angularjs", "rxjs", "ngrx", "ionic"] },
  { name: "Svelte",     category: "framework", patterns: ["svelte", "sveltekit"] },
  // Backend frameworks
  { name: "Node.js",    category: "framework", patterns: ["node.js", "nodejs", "express", "fastify", "koa", "hapi", "nestjs", "nest.js"] },
  { name: "Django",     category: "framework", patterns: ["django", "flask", "fastapi", "python web"] },
  { name: "Spring",     category: "framework", patterns: ["spring", "spring boot", "java", "hibernate", "maven", "gradle"] },
  { name: "Laravel",    category: "framework", patterns: ["laravel", "php", "symfony", "eloquent"] },
  { name: "Rails",      category: "framework", patterns: ["rails", "ruby on rails", "ruby", "sinatra"] },
  { name: ".NET",       category: "framework", patterns: [".net", "asp.net", "c#", "dotnet", "entity framework"] },
  // Languages
  { name: "Python",     category: "language", patterns: ["python"] },
  { name: "JavaScript", category: "language", patterns: ["javascript", "js", "es6", "ecmascript"] },
  { name: "TypeScript", category: "language", patterns: ["typescript", "ts"] },
  { name: "Go",         category: "language", patterns: ["golang", "go lang", " go ", "goroutine"] },
  { name: "Rust",       category: "language", patterns: ["rust", "cargo", "rustlang"] },
  { name: "Kotlin",     category: "language", patterns: ["kotlin", "android"] },
  { name: "Swift",      category: "language", patterns: ["swift", "ios", "swiftui", "objective-c"] },
  // Cloud
  { name: "AWS",        category: "cloud", patterns: ["aws", "amazon web services", "ec2", "s3", "lambda", "cloudfront", "eks", "ecs"] },
  { name: "GCP",        category: "cloud", patterns: ["gcp", "google cloud", "bigquery", "cloud run", "gke"] },
  { name: "Azure",      category: "cloud", patterns: ["azure", "microsoft azure", "aks"] },
  // Databases
  { name: "PostgreSQL", category: "database", patterns: ["postgresql", "postgres", "psql"] },
  { name: "MySQL",      category: "database", patterns: ["mysql", "mariadb"] },
  { name: "MongoDB",    category: "database", patterns: ["mongodb", "mongoose", "nosql"] },
  { name: "Redis",      category: "database", patterns: ["redis", "memcached"] },
  // DevOps tools
  { name: "Docker",     category: "tool", patterns: ["docker", "dockerfile", "containerization"] },
  { name: "Kubernetes", category: "tool", patterns: ["kubernetes", "k8s", "kubectl", "helm"] },
  { name: "Terraform",  category: "tool", patterns: ["terraform", "iac", "infrastructure as code"] },
  // Data/ML
  { name: "TensorFlow", category: "tool", patterns: ["tensorflow", "tf", "keras"] },
  { name: "PyTorch",    category: "tool", patterns: ["pytorch", "torch"] },
  { name: "scikit-learn", category: "tool", patterns: ["scikit", "sklearn", "scikit-learn"] },
];

function detectStack(resumeLower: string): DetectedTech[] {
  const found: DetectedTech[] = [];
  for (const tech of TECH_SIGNALS) {
    const hitCount = tech.patterns.filter(p => resumeLower.includes(p)).length;
    if (hitCount > 0) {
      found.push({
        name: tech.name,
        category: tech.category,
        confidence: hitCount >= 2 ? "confirmed" : "likely",
      });
    }
  }
  return found;
}

// ─── Experience Detection ─────────────────────────────────────────────────────

function detectExperienceLevel(resumeText: string, resumeLower: string): ExperienceLevel {
  // Title signals
  if (/\b(principal|distinguished|fellow|vp of engineering|chief (architect|engineer))\b/i.test(resumeText)) return "principal";
  if (/\b(staff (engineer|developer)|engineering manager|director of|head of engineering|tech lead|technical lead|lead (developer|engineer|architect))\b/i.test(resumeText)) return "lead";
  if (/\b(senior|sr\.)\s+(software|full[- ]?stack|frontend|backend|data|platform|devops)\b/i.test(resumeText)) return "senior";
  if (/\b(intern(ship)?|co[-\s]?op|student developer|graduate trainee)\b/i.test(resumeText)) return "intern";

  // Year-based heuristics
  const yearMatches = resumeLower.match(/\b(20\d{2})\b/g) ?? [];
  const years = yearMatches.map(Number);
  if (years.length >= 2) {
    const span = Math.max(...years) - Math.min(...years);
    if (span >= 12) return "principal";
    if (span >= 8)  return "lead";
    if (span >= 5)  return "senior";
    if (span >= 2)  return "mid";
    if (span >= 1)  return "junior";
  }

  // Keyword fallback
  if (/\b(7|8|9|10|11|12|13|14|15)\+?\s+years?\b/i.test(resumeText)) return "lead";
  if (/\b(5|6)\+?\s+years?\b/i.test(resumeText)) return "senior";
  if (/\b(3|4)\+?\s+years?\b/i.test(resumeText)) return "mid";
  if (/\b(1|2)\+?\s+years?\b/i.test(resumeText)) return "junior";

  return "mid"; // safe default
}

// ─── Career Path Data ─────────────────────────────────────────────────────────

// Returns career path for a (role, level, primaryTech) combination
function buildCareerPath(
  role: RoleType,
  level: ExperienceLevel,
  primaryTech: string,
  stack: DetectedTech[],
): Pick<CareerIntelligence, "nextSkills" | "targetRoles" | "resumeAdditions" | "levelUpGoals"> {
  const hasReact   = stack.some(s => s.name === "React");
  const hasVue     = stack.some(s => s.name === "Vue.js");
  const hasAngular = stack.some(s => s.name === "Angular");
  const hasNode    = stack.some(s => s.name === "Node.js");
  const hasTS      = stack.some(s => s.name === "TypeScript");
  const hasDocker  = stack.some(s => s.name === "Docker");
  const hasK8s     = stack.some(s => s.name === "Kubernetes");
  const hasAWS     = stack.some(s => s.name === "AWS");
  const hasPython  = stack.some(s => s.name === "Python");
  const hasGo      = stack.some(s => s.name === "Go");

  // ─── Frontend paths ─────────────────────────────────────────────────────────
  if (role === "tech_frontend") {
    if (level === "intern" || level === "junior") {
      const nextSkills: SkillSuggestion[] = [
        !hasTS ? { skill: "TypeScript", reason: "Required at 90%+ of frontend jobs — converts your JS skills to industry-standard", priority: "must_learn", timeframe: "1–2 months", resourceHint: "TypeScript Handbook (free, typescriptlang.org)" } : null,
        !hasReact ? { skill: "React", reason: "Most demanded frontend framework globally — opens majority of frontend job listings", priority: "must_learn", timeframe: "2–3 months", resourceHint: "React official docs + build 3 projects" } : null,
        { skill: "Git & GitHub", reason: "Version control is non-negotiable for any development role", priority: "must_learn", timeframe: "2 weeks", resourceHint: "Learn Git Branching (interactive, free)" },
        { skill: "CSS Grid & Flexbox", reason: "Responsive layouts are tested in every frontend interview", priority: "high", timeframe: "2 weeks", resourceHint: "CSS Tricks complete guide (free)" },
        { skill: "REST API Integration", reason: "Fetching data and handling async logic is in every frontend role", priority: "high", timeframe: "3 weeks", resourceHint: "Build a weather app with public API" },
      ].filter(Boolean) as SkillSuggestion[];
      return {
        nextSkills: nextSkills.slice(0, 5),
        targetRoles: [
          { title: "Junior Frontend Developer", readiness: "ready" },
          { title: "Frontend Developer", readiness: "stretch", gap: "1+ year production experience + TypeScript proficiency" },
          { title: "Full-Stack Developer (Junior)", readiness: "future", gap: "Add Node.js / backend basics" },
        ],
        resumeAdditions: [
          { item: "GitHub profile link with active repos", category: "section", whyItMatters: "Recruiters verify coding skills via GitHub — no profile = instant disadvantage" },
          { item: "2–3 personal/open-source projects with live demo links", category: "project", whyItMatters: "Without professional experience, projects ARE your portfolio" },
          { item: "Tech stack used per role (React, TypeScript, REST APIs)", category: "skill", whyItMatters: "ATS scans for specific tech names — 'frontend development' is too vague" },
          { item: "Quantify project impact (e.g., 'reduced load time by 40%')", category: "metric", whyItMatters: "Numbers make junior resumes stand out from the stack" },
        ],
        levelUpGoals: [
          "Build and deploy 2 full projects with React + TypeScript (visible on GitHub)",
          "Contribute to an open-source repository and add it to your resume",
          "Complete a JavaScript/TypeScript course and add certification to resume",
        ],
      };
    }

    if (level === "mid") {
      const nextSkills: SkillSuggestion[] = [
        { skill: "Next.js / SSR", reason: "Server-side rendering is now standard for production React apps and SEO-critical products", priority: "must_learn", timeframe: "1 month", resourceHint: "Next.js official docs + Vercel free deployment" },
        { skill: "Testing (Jest + Testing Library)", reason: "Mid-level+ roles require writing tests — missing this blocks promotion", priority: "must_learn", timeframe: "3 weeks", resourceHint: "Testing Library docs + Kent C. Dodds blog" },
        { skill: "Performance Optimization", reason: "Core Web Vitals and Lighthouse scores are now PM metrics — devs who move numbers get promoted", priority: "high", timeframe: "1 month", resourceHint: "web.dev/performance (free Google course)" },
        !hasNode ? { skill: "Node.js basics", reason: "Full-stack capability doubles your job options and salary range", priority: "high", timeframe: "6 weeks", resourceHint: "Node.js official docs + build an Express API" } : null,
        { skill: "System Design (Frontend)", reason: "Senior roles require designing component libraries, state management at scale", priority: "medium", timeframe: "2–3 months", resourceHint: "Frontend System Design on Excalidraw.com" },
      ].filter(Boolean) as SkillSuggestion[];
      return {
        nextSkills: nextSkills.slice(0, 5),
        targetRoles: [
          { title: "Mid-Level Frontend Developer", readiness: "ready" },
          { title: "Senior Frontend Developer", readiness: "stretch", gap: "Lead a feature end-to-end + mentoring experience" },
          { title: "Full-Stack Developer", readiness: "stretch", gap: "Solid backend/API building experience" },
          { title: "Frontend Tech Lead", readiness: "future", gap: "3+ years experience + team leadership" },
        ],
        resumeAdditions: [
          { item: "Metrics for UI performance (Lighthouse scores, load time improvements)", category: "metric", whyItMatters: "Quantified performance work is rare and valued — shows senior-level thinking" },
          { item: "Testing coverage added (e.g., 'wrote 150+ unit tests, coverage 85%')", category: "metric", whyItMatters: "Testing ownership separates mid from senior in resume reviews" },
          { item: "Design system or component library ownership", category: "project", whyItMatters: "Shows architectural thinking beyond individual features" },
          { item: "Cross-functional work (collaborated with design/backend)", category: "section", whyItMatters: "Demonstrates readiness for senior collaboration requirements" },
        ],
        levelUpGoals: [
          `Master Next.js + TypeScript — build a production-grade app with SSR, caching, and SEO`,
          "Write tests for your current project and document the coverage improvements",
          "Mentor a junior developer or write a technical blog post (shows leadership readiness)",
        ],
      };
    }

    if (level === "senior" || level === "lead" || level === "principal") {
      return {
        nextSkills: [
          { skill: "Architecture Patterns (Micro-frontends)", reason: "Large-scale frontends use module federation — senior+ roles require this knowledge", priority: "must_learn", timeframe: "2 months", resourceHint: "Module Federation docs + Martin Fowler articles" },
          { skill: "Web Performance Deep Dive (Core Web Vitals)", reason: "Staff/principal engineers drive org-wide performance strategy", priority: "high", timeframe: "1 month", resourceHint: "Chrome DevTools + web.dev advanced courses" },
          { skill: "Engineering Leadership skills", reason: "Promotion to lead/principal requires influence without authority and roadmap ownership", priority: "high", timeframe: "Ongoing", resourceHint: "Staff Engineer by Will Larson (book)" },
          { skill: "Design System Architecture", reason: "Senior+ engineers often own the component library that every team uses", priority: "medium", timeframe: "2–3 months", resourceHint: "Storybook docs + Brad Frost Atomic Design" },
        ],
        targetRoles: [
          { title: "Senior Frontend Developer", readiness: level === "senior" ? "ready" : "ready" },
          { title: "Lead / Staff Frontend Engineer", readiness: level === "lead" || level === "principal" ? "ready" : "stretch", gap: "Team leadership or cross-team impact evidence" },
          { title: "Principal / Architect", readiness: level === "principal" ? "ready" : "future", gap: "Organization-wide technical direction experience" },
          { title: "Engineering Manager", readiness: "stretch", gap: "Explicit people management and process ownership" },
        ],
        resumeAdditions: [
          { item: "Team size you've led or mentored (e.g., 'mentored 4 junior engineers')", category: "metric", whyItMatters: "Leadership impact is the primary differentiator for senior+ roles" },
          { item: "Architecture decisions you drove (e.g., 'migrated monolith to micro-frontends')", category: "project", whyItMatters: "Shows the scope of ownership expected at this level" },
          { item: "Business impact of technical work (revenue, conversion, cost savings)", category: "metric", whyItMatters: "Executives and VPs evaluate this — bridges engineering to business value" },
          { item: "Conference talks, blog posts, or open-source contributions", category: "section", whyItMatters: "Thought leadership signals principal/staff readiness" },
        ],
        levelUpGoals: [
          "Document an architecture decision record (ADR) for a major technical choice you made",
          "Propose and lead a cross-team technical initiative (performance, DX, or platform)",
          "Speak at a local meetup or write a technical post on LinkedIn/dev.to",
        ],
      };
    }
  }

  // ─── Backend paths ───────────────────────────────────────────────────────────
  if (role === "tech_backend") {
    if (level === "intern" || level === "junior") {
      return {
        nextSkills: [
          !hasNode && !hasPython ? { skill: "Node.js + Express OR Python + FastAPI", reason: "Pick one server-side framework and master it — the entry point to all backend jobs", priority: "must_learn", timeframe: "2–3 months", resourceHint: "Node.js docs + build a REST API with CRUD" } : null,
          { skill: "PostgreSQL / SQL", reason: "Every backend role requires relational database knowledge — SQL is non-negotiable", priority: "must_learn", timeframe: "3 weeks", resourceHint: "SQLZoo (free interactive) + design a real schema" },
          { skill: "REST API design (CRUD, status codes, pagination)", reason: "Designing clean APIs is the core backend skill tested in every interview", priority: "must_learn", timeframe: "1 month", resourceHint: "RESTful API Design best practices (free articles)" },
          { skill: "Authentication (JWT, OAuth2)", reason: "Every production app has auth — backend devs must understand security fundamentals", priority: "high", timeframe: "3 weeks", resourceHint: "JWT.io docs + Auth0 free tutorials" },
          !hasDocker ? { skill: "Docker basics", reason: "Containerization is now a baseline expectation even for junior backend roles", priority: "high", timeframe: "2 weeks", resourceHint: "Docker's official Getting Started (free)" } : null,
        ].filter(Boolean) as SkillSuggestion[],
        targetRoles: [
          { title: "Junior Backend Developer", readiness: "ready" },
          { title: "Junior Full-Stack Developer", readiness: "stretch", gap: "Add basic frontend (React/HTML+CSS)" },
          { title: "Backend Developer", readiness: "future", gap: "1+ year production experience + distributed systems basics" },
        ],
        resumeAdditions: [
          { item: "API endpoints built (e.g., 'built 12 REST endpoints serving 10K daily users')", category: "metric", whyItMatters: "Shows practical scale even for junior work" },
          { item: "Database schema you designed", category: "project", whyItMatters: "Data modeling is a core interview topic — show you've done it" },
          { item: "GitHub with backend projects (API, CLI tool, or service)", category: "section", whyItMatters: "Backend work is harder to show than frontend — repos are essential" },
          { item: "Test coverage added to backend services", category: "metric", whyItMatters: "Backend code without tests is a red flag for most companies" },
        ],
        levelUpGoals: [
          "Build and deploy a REST API with authentication, database, and tests (host on Railway or Fly.io)",
          "Learn SQL deeply — complete a course and optimize at least one slow query with EXPLAIN",
          "Containerize an app with Docker and deploy it — document it on GitHub",
        ],
      };
    }

    if (level === "mid") {
      return {
        nextSkills: [
          { skill: "System Design (databases, caching, queues)", reason: "Mid→Senior promotion requires understanding how systems scale beyond a single service", priority: "must_learn", timeframe: "2–3 months", resourceHint: "System Design Primer (free GitHub repo)" },
          !hasDocker ? { skill: "Docker + Kubernetes basics", reason: "Production backend work requires container orchestration knowledge", priority: "must_learn", timeframe: "1 month", resourceHint: "Play with Kubernetes (interactive, free)" } : null,
          { skill: "Message Queues (Kafka, RabbitMQ, or SQS)", reason: "Async processing and event-driven architecture are in every senior backend interview", priority: "high", timeframe: "1 month", resourceHint: "Kafka official docs + Confluent free courses" },
          !hasGo ? { skill: "Go or Rust for performance-critical services", reason: "High-growth companies (Stripe, Cloudflare, Uber) use Go/Rust for backend — differentiates you", priority: "medium", timeframe: "3 months", resourceHint: "A Tour of Go (free, go.dev/tour)" } : null,
          { skill: "Observability (logging, metrics, tracing)", reason: "Senior engineers own production reliability — observability is their toolbox", priority: "high", timeframe: "3 weeks", resourceHint: "OpenTelemetry docs + Grafana free tier" },
        ].filter(Boolean) as SkillSuggestion[],
        targetRoles: [
          { title: "Mid-Level Backend Developer", readiness: "ready" },
          { title: "Senior Backend Developer", readiness: "stretch", gap: "Distributed systems knowledge + ownership of a production service" },
          { title: "Platform / Infrastructure Engineer", readiness: "stretch", gap: "Kubernetes + cloud certifications" },
          { title: "Backend Tech Lead", readiness: "future", gap: "3+ years + team leadership experience" },
        ],
        resumeAdditions: [
          { item: "Scale metrics (requests per second, data volume, uptime SLA)", category: "metric", whyItMatters: "Numbers demonstrate the real-world stakes of your work" },
          { item: "Services you owned end-to-end (design → deploy → monitor)", category: "project", whyItMatters: "Ownership is the key differentiator for senior roles" },
          { item: "Performance optimizations (query tuning, caching hit rates)", category: "metric", whyItMatters: "Shows you think about efficiency, not just correctness" },
          { item: "Technologies per role listed explicitly", category: "skill", whyItMatters: "ATS and recruiters scan for specific stack names" },
        ],
        levelUpGoals: [
          "Own a production service — including monitoring alerts, incident response, and post-mortems",
          "Design and implement a system that handles 10x the current load (even on a side project)",
          "Study and practice system design problems (3–4 from System Design Primer per week)",
        ],
      };
    }

    return {
      nextSkills: [
        { skill: "Distributed Systems patterns (SAGA, CQRS, event sourcing)", reason: "Staff/principal engineers design org-wide backend architecture", priority: "must_learn", timeframe: "2–3 months", resourceHint: "Designing Distributed Systems (free O'Reilly PDF)" },
        { skill: "Cloud architecture (AWS Solutions Architect)", reason: "Certifications validate seniority and open architect/principal roles", priority: "high", timeframe: "2–3 months", resourceHint: "AWS SAA practice exams + A Cloud Guru" },
        { skill: "Engineering leadership and technical strategy", reason: "Staff+ engineers drive roadmap decisions beyond code", priority: "high", timeframe: "Ongoing", resourceHint: "An Elegant Puzzle by Will Larson (book)" },
      ],
      targetRoles: [
        { title: "Senior Backend Developer", readiness: level === "senior" ? "ready" : "ready" },
        { title: "Staff / Principal Backend Engineer", readiness: level === "lead" || level === "principal" ? "ready" : "stretch", gap: "Cross-team technical impact + architecture ownership" },
        { title: "Solutions Architect", readiness: "stretch", gap: "Cloud certifications + client-facing experience" },
      ],
      resumeAdditions: [
        { item: "Architecture decisions and their business impact", category: "project", whyItMatters: "Principals are hired for their judgment, not just execution" },
        { item: "Incident response and reliability improvements (MTTR, uptime)", category: "metric", whyItMatters: "Reliability ownership is a principal-level expectation" },
        { item: "Mentoring and team growth (e.g., 'grew team from 3 to 8 engineers')", category: "metric", whyItMatters: "Leadership evidence is required at this level" },
      ],
      levelUpGoals: [
        "Define and document the technical vision for a major system in your org",
        "Lead a cross-functional initiative that ships and measurably improves a business metric",
        "Present a technical proposal to senior leadership — add it to your resume as a project",
      ],
    };
  }

  // ─── Full-stack paths ─────────────────────────────────────────────────────────
  if (role === "tech_fullstack") {
    const missingFE = !hasReact && !hasVue && !hasAngular;
    const missingBE = !hasNode && !hasPython;
    return {
      nextSkills: [
        missingFE ? { skill: "React + TypeScript", reason: "React is the dominant full-stack frontend — pairs with every backend", priority: "must_learn", timeframe: "2 months", resourceHint: "React docs + Next.js full-stack tutorial" } : null,
        missingBE ? { skill: "Node.js or Python backend", reason: "Full-stack roles require owning both layers", priority: "must_learn", timeframe: "2 months", resourceHint: "Node.js Express guide + build a REST API" } : null,
        !hasDocker ? { skill: "Docker + CI/CD basics", reason: "Full-stack devs are expected to ship their own code to staging", priority: "high", timeframe: "3 weeks", resourceHint: "Docker Getting Started + GitHub Actions tutorial" } : null,
        { skill: "API design + GraphQL or tRPC", reason: "Full-stack engineers own the contract between frontend and backend", priority: "high", timeframe: "1 month", resourceHint: "The Guild GraphQL docs + tRPC.io" },
        { skill: "Database design + migrations", reason: "Full-stack means owning the data layer too — schema evolution is critical", priority: "medium", timeframe: "3 weeks", resourceHint: "Prisma ORM docs + real project migration" },
      ].filter(Boolean) as SkillSuggestion[],
      targetRoles: [
        { title: "Full-Stack Developer", readiness: level !== "intern" ? "ready" : "stretch", gap: level === "intern" ? "Production project experience" : undefined },
        { title: "Senior Full-Stack Developer", readiness: level === "senior" || level === "lead" ? "ready" : "stretch", gap: "5+ years + system ownership" },
        { title: "Backend Engineer", readiness: "stretch", gap: "Deep backend specialization beyond full-stack" },
        { title: "Solutions Engineer", readiness: "stretch", gap: "Client-facing + sales engineering experience" },
      ],
      resumeAdditions: [
        { item: "Full project stack listed for each role (frontend + backend + DB + cloud)", category: "skill", whyItMatters: "Full-stack roles scan for end-to-end ownership" },
        { item: "Deployed production apps with real user metrics", category: "project", whyItMatters: "Shows you can ship, not just build locally" },
        { item: "GitHub with full-stack projects visible", category: "section", whyItMatters: "Full-stack work is verified via repos" },
      ],
      levelUpGoals: [
        "Build and deploy a full-stack app with auth, DB, and CI/CD from scratch",
        `Specialize deeper in ${hasReact ? "React/Next.js architecture" : hasVue ? "Vue/Nuxt ecosystem" : "your primary frontend framework"} — contribute to open source`,
        "Learn system design basics — design an architecture for your current app at 10x scale",
      ],
    };
  }

  // ─── DevOps paths ─────────────────────────────────────────────────────────────
  if (role === "tech_devops") {
    return {
      nextSkills: [
        !hasK8s ? { skill: "Kubernetes (CKA certification)", reason: "K8s is the standard container orchestration — required for most DevOps/SRE roles", priority: "must_learn", timeframe: "2–3 months", resourceHint: "killer.sh CKA simulator + Kubernetes docs" } : null,
        !hasAWS ? { skill: "AWS Solutions Architect Associate", reason: "Cloud expertise is the highest-ROI skill for DevOps salary growth", priority: "must_learn", timeframe: "2–3 months", resourceHint: "AWS free tier + Adrian Cantrill course" } : null,
        { skill: "Infrastructure as Code (Terraform or Pulumi)", reason: "IaC is now a baseline for any senior DevOps/SRE role", priority: "must_learn", timeframe: "1 month", resourceHint: "HashiCorp Learn Terraform (free)" },
        { skill: "Observability (Prometheus + Grafana + OpenTelemetry)", reason: "SRE roles require owning reliability — observability is the core toolkit", priority: "high", timeframe: "3 weeks", resourceHint: "Grafana Play (free sandbox)" },
        { skill: "GitOps (ArgoCD or Flux)", reason: "Modern Kubernetes deployments use GitOps — differentiates you from config-only DevOps", priority: "medium", timeframe: "1 month", resourceHint: "Argo CD docs + free cluster on Killercoda" },
      ].filter(Boolean) as SkillSuggestion[],
      targetRoles: [
        { title: "DevOps Engineer", readiness: "ready" },
        { title: "SRE (Site Reliability Engineer)", readiness: level === "mid" || level === "senior" ? "stretch" : "future", gap: "SLO/SLI definition + incident management track record" },
        { title: "Platform Engineer", readiness: "stretch", gap: "Developer experience focus + internal tooling ownership" },
        { title: "Cloud Architect", readiness: level === "senior" || level === "lead" ? "stretch" : "future", gap: "AWS/GCP certifications + multi-cloud experience" },
      ],
      resumeAdditions: [
        { item: "Uptime/availability metrics you improved (e.g., '99.9% → 99.99% SLA')", category: "metric", whyItMatters: "Reliability numbers are the primary DevOps KPI recruiters look for" },
        { item: "Cloud certifications (AWS, GCP, CKA, Terraform)", category: "certification", whyItMatters: "DevOps roles filter heavily on certifications — they validate skills without project proof" },
        { item: "Deployment frequency and lead time improvements", category: "metric", whyItMatters: "DORA metrics are the industry standard for DevOps performance" },
        { item: "Cost optimization achieved (cloud spend reduction %)", category: "metric", whyItMatters: "Finance teams care deeply — engineers who save money get noticed" },
      ],
      levelUpGoals: [
        "Achieve CKA (Certified Kubernetes Administrator) certification",
        "Design and implement a full CI/CD pipeline with automated testing, staging, and production gates",
        "Document an incident post-mortem you led — add it as a project with learnings",
      ],
    };
  }

  // ─── Data / ML paths ──────────────────────────────────────────────────────────
  if (role === "tech_data") {
    return {
      nextSkills: [
        !hasPython ? { skill: "Python for Data Science (pandas, NumPy, scikit-learn)", reason: "Python is the universal data language — without it, data roles are inaccessible", priority: "must_learn", timeframe: "2–3 months", resourceHint: "Kaggle free Python + pandas courses" } : null,
        { skill: "SQL (advanced: window functions, CTEs, query optimization)", reason: "Every data role tests SQL heavily — advanced SQL separates mid from senior", priority: "must_learn", timeframe: "1 month", resourceHint: "Mode Analytics SQL Tutorial + LeetCode SQL" },
        { skill: "Data Visualization (Tableau, Power BI, or Plotly)", reason: "Communicating insights to non-technical stakeholders is required for senior data roles", priority: "high", timeframe: "3 weeks", resourceHint: "Tableau Public (free) + Coursera IBM Data Viz" },
        { skill: "ML Model Deployment (MLflow, SageMaker, or FastAPI)", reason: "ML engineers who can deploy models are far more valuable than research-only profiles", priority: "high", timeframe: "1–2 months", resourceHint: "MLflow quickstart + FastAPI docs" },
        { skill: "Cloud Data Platforms (BigQuery, Redshift, or Databricks)", reason: "Enterprise data roles all use cloud warehouses — familiarity is expected", priority: "medium", timeframe: "1 month", resourceHint: "BigQuery sandbox (free 1TB/month)" },
      ].filter(Boolean) as SkillSuggestion[],
      targetRoles: [
        { title: "Data Analyst", readiness: level === "junior" || level === "mid" ? "ready" : "ready" },
        { title: "Data Scientist", readiness: level === "mid" || level === "senior" ? "ready" : "stretch", gap: "ML modeling experience + statistical depth" },
        { title: "ML Engineer", readiness: "stretch", gap: "Model deployment + software engineering skills" },
        { title: "Data Engineer", readiness: "stretch", gap: "Pipeline orchestration (Airflow/dbt) + distributed systems" },
      ],
      resumeAdditions: [
        { item: "Business impact of models/analyses (revenue impact, cost savings, accuracy %)", category: "metric", whyItMatters: "Data roles are measured by business outcomes, not technical elegance" },
        { item: "Kaggle competitions or public notebooks (with scores)", category: "project", whyItMatters: "Demonstrates initiative and skills beyond job work" },
        { item: "Data volume handled (e.g., 'analyzed 50M+ row datasets')", category: "metric", whyItMatters: "Scale shows you can work with production data, not just toy datasets" },
        { item: "Model performance metrics (AUC, RMSE, precision/recall improvements)", category: "metric", whyItMatters: "ML roles need quantified model results, not just 'built a model'" },
      ],
      levelUpGoals: [
        "Complete a Kaggle competition and document your approach — add to GitHub and resume",
        "Deploy an end-to-end ML pipeline (training → serving → monitoring) on a cloud platform",
        "Write a technical blog post about a data problem you solved with measurable results",
      ],
    };
  }

  // ─── Marketing paths ─────────────────────────────────────────────────────────
  if (role === "marketing") {
    return {
      nextSkills: [
        { skill: "Marketing Analytics (GA4, Mixpanel, or Amplitude)", reason: "Data-driven marketing is the expectation — gut-feel marketers are being replaced", priority: "must_learn", timeframe: "3 weeks", resourceHint: "GA4 free certification + Google Analytics Academy" },
        { skill: "SEO (technical + content)", reason: "Organic growth is the highest-ROI channel — SEO skills are in every marketing JD", priority: "high", timeframe: "1–2 months", resourceHint: "Ahrefs blog + Moz Beginner's Guide (free)" },
        { skill: "Marketing Automation (HubSpot, Marketo, or Klaviyo)", reason: "Marketing ops is an independent career track with high demand and salary", priority: "high", timeframe: "1 month", resourceHint: "HubSpot Academy free certifications" },
        { skill: "Paid Acquisition (Meta Ads + Google Ads)", reason: "Performance marketing skills are required for growth and demand gen roles", priority: "medium", timeframe: "6 weeks", resourceHint: "Meta Blueprint + Google Ads certification (both free)" },
      ],
      targetRoles: [
        { title: "Marketing Manager", readiness: level === "mid" || level === "senior" ? "ready" : "stretch", gap: "Campaign ownership + budget management experience" },
        { title: "Growth Marketer", readiness: "stretch", gap: "Experiment design + funnel analytics experience" },
        { title: "Marketing Director", readiness: level === "lead" || level === "principal" ? "ready" : "future", gap: "Team leadership + P&L ownership" },
      ],
      resumeAdditions: [
        { item: "Campaign ROI and ROAS metrics (e.g., '4.2x ROAS on $50K spend')", category: "metric", whyItMatters: "Marketing is judged on ROI — no numbers = no credibility" },
        { item: "Audience size and growth rates (email list, social reach)", category: "metric", whyItMatters: "Shows your scope of influence and channel ownership" },
        { item: "A/B test results (lift %, statistical significance)", category: "metric", whyItMatters: "Experimentation mindset is required at growth-stage companies" },
      ],
      levelUpGoals: [
        "Get Google Analytics and HubSpot certifications — add them to resume and LinkedIn",
        "Run an A/B test on any campaign and document the result with statistical significance",
        "Build a personal case study showing a full-funnel campaign from brief to results",
      ],
    };
  }

  // ─── Product paths ─────────────────────────────────────────────────────────
  if (role === "product") {
    return {
      nextSkills: [
        { skill: "Product Analytics (Amplitude, Mixpanel, or Looker)", reason: "PMs who can't query their own data are dependent on analysts — autonomy = leverage", priority: "must_learn", timeframe: "3 weeks", resourceHint: "Amplitude free tier + product analytics course on Reforge" },
        { skill: "SQL for Product Analytics", reason: "The best PMs write their own queries — adds enormous credibility with engineering", priority: "must_learn", timeframe: "1 month", resourceHint: "Mode Analytics SQL Tutorial + build a product dashboard" },
        { skill: "User Research Methods (Jobs-to-be-Done, usability testing)", reason: "PMs who validate with users ship products that actually work — this differentiates at every level", priority: "high", timeframe: "3 weeks", resourceHint: "JTBD.info + Nielsen Norman Group free articles" },
        { skill: "Technical depth (APIs, system design basics)", reason: "PMs who speak engineer are more effective — reduces translation overhead in sprints", priority: "medium", timeframe: "1–2 months", resourceHint: "Codecademy Web Basics + Stripe API docs as a reading exercise" },
      ],
      targetRoles: [
        { title: "Product Manager", readiness: level !== "intern" ? "ready" : "stretch", gap: "Shipped product with measurable user impact" },
        { title: "Senior Product Manager", readiness: level === "senior" || level === "lead" ? "ready" : "stretch", gap: "Cross-functional ownership + business case ownership" },
        { title: "Group PM / Product Lead", readiness: level === "lead" || level === "principal" ? "ready" : "future", gap: "Multiple product line ownership + PM mentoring" },
      ],
      resumeAdditions: [
        { item: "Product metrics owned and moved (DAU, retention, NPS, conversion)", category: "metric", whyItMatters: "PM roles are evaluated entirely on outcome metrics — not features shipped" },
        { item: "Cross-functional teams you led (engineering, design, data)", category: "metric", whyItMatters: "Shows scope of influence — key for senior PM roles" },
        { item: "Revenue or growth impact (e.g., 'feature drove $2M ARR')", category: "metric", whyItMatters: "Business outcomes in PM resumes are extremely rare and highly valued" },
      ],
      levelUpGoals: [
        "Write a product case study for your best shipped feature — publish on Medium or LinkedIn",
        "Get proficient in SQL and build a self-serve metrics dashboard for your team",
        "Run a full discovery sprint: user interviews → insight synthesis → solution hypothesis",
      ],
    };
  }

  // ─── Design paths ────────────────────────────────────────────────────────────
  if (role === "design") {
    return {
      nextSkills: [
        { skill: "Figma (advanced prototyping + variables)", reason: "Figma is now the universal design tool — advanced features like variables/auto-layout are expected", priority: "must_learn", timeframe: "3 weeks", resourceHint: "Figma Community templates + Figma Academy" },
        { skill: "Design Systems (tokens, component libraries)", reason: "Senior designers own the design system — this is the highest-leverage design work", priority: "high", timeframe: "1–2 months", resourceHint: "design.systems + Supernova.io free resources" },
        { skill: "Usability Testing & Research", reason: "UX roles require showing how your decisions were validated with users", priority: "high", timeframe: "1 month", resourceHint: "Nielsen Norman Group free articles + UserTesting.com basics" },
        { skill: "Design-to-Code handoff (Storybook, CSS)", reason: "Designers who understand code ship faster and have fewer 'lost in translation' issues", priority: "medium", timeframe: "3 weeks", resourceHint: "Kevin Powell CSS YouTube channel (free)" },
      ],
      targetRoles: [
        { title: "UX/UI Designer", readiness: level !== "intern" ? "ready" : "stretch" },
        { title: "Senior UX Designer", readiness: level === "senior" || level === "lead" ? "ready" : "stretch", gap: "Design system ownership + user research portfolio" },
        { title: "Design Lead / Head of Design", readiness: level === "lead" || level === "principal" ? "ready" : "future", gap: "Team management + cross-functional design strategy" },
      ],
      resumeAdditions: [
        { item: "Portfolio link (Figma, Behance, or personal site) in header", category: "section", whyItMatters: "Design roles are evaluated 90% on portfolio — a missing link is disqualifying" },
        { item: "User outcome metrics for design work (conversion lift, task completion rate)", category: "metric", whyItMatters: "Senior design roles require business impact proof, not just aesthetics" },
        { item: "Process description per project (research → wireframe → test → ship)", category: "project", whyItMatters: "Shows UX thinking beyond visual design" },
      ],
      levelUpGoals: [
        "Build and publish a case study with before/after metrics for a design improvement",
        "Contribute to or create a component in your team's design system",
        "Conduct 5 user research interviews and synthesize insights into a recommendations doc",
      ],
    };
  }

  // ─── Sales paths ─────────────────────────────────────────────────────────────
  if (role === "sales") {
    return {
      nextSkills: [
        { skill: "CRM Mastery (Salesforce or HubSpot)", reason: "Salesforce is in 60%+ of enterprise sales job requirements — certification = automatic credibility", priority: "must_learn", timeframe: "1 month", resourceHint: "Trailhead by Salesforce (free certification path)" },
        { skill: "Sales Automation & Sequencing (Outreach, Salesloft)", reason: "High-volume outbound roles require tool proficiency — it's listed in JDs explicitly", priority: "high", timeframe: "2 weeks", resourceHint: "Outreach.io blog + YouTube tutorials" },
        { skill: "Solution Selling / MEDDIC / SPIN Selling", reason: "Enterprise AE roles require a named sales methodology — MEDDIC is the most common", priority: "high", timeframe: "1 month", resourceHint: "MEDDIC free resources + Force Management blog" },
        { skill: "Data Analysis (Excel pivot tables + Salesforce reports)", reason: "Top AEs forecast their own pipeline — data skills separate quota-crushers from average reps", priority: "medium", timeframe: "2 weeks", resourceHint: "Excel Pivot Tables crash course (YouTube)" },
      ],
      targetRoles: [
        { title: "Account Executive", readiness: level !== "intern" ? "ready" : "stretch" },
        { title: "Senior AE / Enterprise AE", readiness: level === "senior" || level === "lead" ? "ready" : "stretch", gap: "Enterprise deal experience + larger quota attainment" },
        { title: "Sales Manager", readiness: level === "lead" || level === "principal" ? "ready" : "future", gap: "Team lead experience + hiring track record" },
      ],
      resumeAdditions: [
        { item: "Quota attainment % for every role (e.g., '127% of $1.2M quota')", category: "metric", whyItMatters: "Sales resumes without quota numbers are immediately deprioritized" },
        { item: "Deal size and sales cycle length (ACV, ARR)", category: "metric", whyItMatters: "Enterprise vs SMB distinction is critical — shows the scope you can handle" },
        { item: "Rankings within sales team (e.g., '#2 of 18 AEs')", category: "metric", whyItMatters: "Relative performance is highly valued — shows competitive standing" },
        { item: "Salesforce or HubSpot certifications", category: "certification", whyItMatters: "Tool certifications in sales resumes add credibility quickly" },
      ],
      levelUpGoals: [
        "Add specific quota attainment % to every sales role in your resume",
        "Get Salesforce Certified Administrator or HubSpot Sales certification",
        "Document your largest enterprise deal as a brief case study (problem, approach, outcome)",
      ],
    };
  }

  // ─── Mobile paths ─────────────────────────────────────────────────────────────
  if (role === "tech_mobile") {
    return {
      nextSkills: [
        { skill: "React Native (if iOS/Android cross-platform)", reason: "Cross-platform mobile doubles your job market — most startups prefer one codebase", priority: "must_learn", timeframe: "2 months", resourceHint: "React Native docs + Expo managed workflow" },
        { skill: "App Store Optimization (ASO) basics", reason: "Mobile devs who understand distribution are more valuable to product teams", priority: "high", timeframe: "2 weeks", resourceHint: "AppFollow.io free ASO guide" },
        { skill: "Mobile performance profiling (Instruments or Android Profiler)", reason: "App store ratings are driven by performance — senior mobile devs own this", priority: "high", timeframe: "3 weeks", resourceHint: "Apple Instruments docs + Android developer docs" },
        { skill: "Push notifications + deep linking", reason: "Re-engagement mechanics are tested in every senior mobile interview", priority: "medium", timeframe: "2 weeks", resourceHint: "Firebase Cloud Messaging free docs" },
      ],
      targetRoles: [
        { title: "iOS / Android Developer", readiness: "ready" },
        { title: "React Native Developer", readiness: "stretch", gap: "JavaScript/React foundation + cross-platform project" },
        { title: "Senior Mobile Developer", readiness: level === "senior" || level === "lead" ? "ready" : "stretch", gap: "App Store published app + performance optimization track record" },
      ],
      resumeAdditions: [
        { item: "App Store / Play Store app links (download count or rating)", category: "project", whyItMatters: "Shipped apps are the ultimate mobile credential" },
        { item: "Crash rate improvements and performance metrics", category: "metric", whyItMatters: "Mobile quality is measured by crashes and ANRs — show your impact" },
        { item: "Platforms and versions supported (iOS 16+, Android 12+)", category: "skill", whyItMatters: "Device fragmentation management shows senior mobile expertise" },
      ],
      levelUpGoals: [
        "Publish a personal app to App Store or Play Store and include the download stats",
        "Profile and fix a performance issue in an app — document the before/after metrics",
        "Learn React Native and build the same app cross-platform to expand your market",
      ],
    };
  }

  // ─── General fallback ─────────────────────────────────────────────────────────
  return {
    nextSkills: [
      { skill: "Quantify your resume achievements with metrics", reason: "Resumes with numbers get 40% more interview callbacks — this alone can transform your results", priority: "must_learn", timeframe: "1 day", resourceHint: "Review each bullet: add %, $, count, or time saved" },
      { skill: "Build a professional LinkedIn profile", reason: "80% of recruiters source candidates on LinkedIn before posting jobs", priority: "high", timeframe: "1 week", resourceHint: "LinkedIn's profile completion checklist (free)" },
      { skill: "Tailor resume per job description", reason: "Generic resumes score 20–30 points lower than tailored ones on ATS systems", priority: "must_learn", timeframe: "30 min per application", resourceHint: "Use this ATS tool to match each application" },
    ],
    targetRoles: [
      { title: "Your Target Role", readiness: "stretch", gap: "Tailor resume with specific keywords from job descriptions" },
    ],
    resumeAdditions: [
      { item: "Quantified achievements for every bullet point", category: "metric", whyItMatters: "Numbers are the single highest-impact resume improvement" },
      { item: "Skills section with tools, software, and certifications", category: "skill", whyItMatters: "ATS systems match on explicit skill names" },
      { item: "Professional summary tailored to your target role", category: "section", whyItMatters: "First thing recruiters read — generic summaries get skipped" },
    ],
    levelUpGoals: [
      "Add a number to every bullet point in your experience section",
      "Create a master resume and customize it for each job application",
      "Update your LinkedIn to match your resume and turn on 'Open to Work'",
    ],
  };
}

// ─── Main Builder ─────────────────────────────────────────────────────────────

export function buildCareerIntelligence(
  resumeText: string,
  role: RoleType,
): CareerIntelligence {
  const resumeLower = resumeText.toLowerCase();
  const stack = detectStack(resumeLower);
  const level = detectExperienceLevel(resumeText, resumeLower);

  // Determine primary tech from detected stack
  const frameworks = stack.filter(s => s.category === "framework" && s.confidence === "confirmed");
  const languages  = stack.filter(s => s.category === "language"  && s.confidence === "confirmed");
  const primaryTech =
    frameworks[0]?.name ??
    languages[0]?.name ??
    stack[0]?.name ??
    "General";

  const { nextSkills, targetRoles, resumeAdditions, levelUpGoals } = buildCareerPath(role, level, primaryTech, stack);

  return {
    experienceLevel: level,
    detectedStack: stack,
    primaryTech,
    nextSkills,
    targetRoles,
    resumeAdditions,
    levelUpGoals,
  };
}
