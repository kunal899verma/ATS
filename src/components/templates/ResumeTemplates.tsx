"use client";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface WorkExp {
  id: string; company: string; title: string; location: string;
  startDate: string; endDate: string; current: boolean; bullets: string;
}
export interface Edu {
  id: string; school: string; degree: string; field: string; location: string;
  graduationDate: string; gpa: string; honors: string;
}
export interface SkillGroup { id: string; name: string; items: string; }
export interface Project { id: string; name: string; description: string; tech: string; link: string; }
export interface Cert { id: string; name: string; issuer: string; date: string; }

export interface ResumeData {
  personal: { name: string; title: string; email: string; phone: string; location: string; linkedin: string; github: string; website: string; };
  summary: string;
  experience: WorkExp[];
  education: Edu[];
  skills: SkillGroup[];
  projects: Project[];
  certifications: Cert[];
}

// ─── Data Presets ─────────────────────────────────────────────────────────────

export const SAMPLE_RESUME_DATA: ResumeData = {
  personal: { name: "Alex Johnson", title: "Senior Software Engineer", email: "alex@example.com", phone: "(555) 123-4567", location: "San Francisco, CA", linkedin: "linkedin.com/in/alexjohnson", github: "github.com/alexjohnson", website: "" },
  summary: "Results-driven software engineer with 5+ years of experience building scalable web applications. Specialized in React, Node.js, and cloud infrastructure with a proven track record of delivering products serving 100K+ users.",
  experience: [
    { id: "e1", company: "Tech Startup Inc.", title: "Senior Software Engineer", location: "San Francisco, CA", startDate: "Jan 2022", endDate: "", current: true, bullets: "Led microservices migration reducing API latency by 40% across 5 services\nBuilt shared React component library adopted by 8 product teams, saving 200+ dev-hours/month\nMentored 3 junior engineers; all promoted within 18 months" },
    { id: "e2", company: "Digital Agency Co.", title: "Software Engineer", location: "Remote", startDate: "Jun 2020", endDate: "Dec 2021", current: false, bullets: "Developed REST APIs with Node.js + PostgreSQL serving 50K daily active users\nBuilt CI/CD pipeline that cut deployment time from 2 hours to 15 minutes\nShipped 12 product features collaborating with cross-functional design and PM teams" },
  ],
  education: [{ id: "edu1", school: "UC Berkeley", degree: "Bachelor of Science", field: "Computer Science", location: "Berkeley, CA", graduationDate: "May 2020", gpa: "3.8", honors: "Summa Cum Laude" }],
  skills: [
    { id: "s1", name: "Languages", items: "Python, JavaScript, TypeScript, Go, SQL" },
    { id: "s2", name: "Frameworks", items: "React, Next.js, Node.js, FastAPI, Django" },
    { id: "s3", name: "Tools & Cloud", items: "Docker, Kubernetes, AWS, PostgreSQL, Redis, Git" },
  ],
  projects: [{ id: "p1", name: "Open Source Analytics Dashboard", description: "Full-stack analytics platform with real-time visualization serving 5K+ monthly users.", tech: "Next.js, Python, D3.js, PostgreSQL", link: "github.com/alex/analytics" }],
  certifications: [{ id: "c1", name: "AWS Solutions Architect Associate", issuer: "Amazon Web Services", date: "2023" }],
};

export const BLANK_RESUME_DATA: ResumeData = {
  personal: { name: "", title: "", email: "", phone: "", location: "", linkedin: "", github: "", website: "" },
  summary: "",
  experience: [{ id: "e1", company: "", title: "", location: "", startDate: "", endDate: "", current: false, bullets: "" }],
  education: [{ id: "edu1", school: "", degree: "", field: "", location: "", graduationDate: "", gpa: "", honors: "" }],
  skills: [{ id: "s1", name: "Languages", items: "" }, { id: "s2", name: "Frameworks", items: "" }, { id: "s3", name: "Tools", items: "" }],
  projects: [],
  certifications: [],
};

// ─── Template Config ──────────────────────────────────────────────────────────

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  atsScore: "Excellent" | "Good" | "Limited";
  accent: string;
  Component: React.ComponentType<{ data: ResumeData }>;
}

// ─── Shared Helpers ───────────────────────────────────────────────────────────

function Bullets({ text, style }: { text: string; style?: React.CSSProperties }) {
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
  if (!lines.length) return null;
  return (
    <>
      {lines.map((line, i) => (
        <div key={i} style={{ paddingLeft: 14, marginBottom: 2, ...style }}>• {line}</div>
      ))}
    </>
  );
}

function dr(start: string, end: string, current: boolean) {
  if (!start) return "";
  return `${start} – ${current ? "Present" : end || "Present"}`;
}

// ─── Template 1: Classic ──────────────────────────────────────────────────────

function CH({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.1px", color: "#000", borderBottom: "1px solid #999", paddingBottom: 2, marginTop: 13, marginBottom: 7 }}>
      {label}
    </div>
  );
}

export function ClassicTemplate({ data: { personal: p, summary, experience, education, skills, projects, certifications } }: { data: ResumeData }) {
  const contacts = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean);
  return (
    <div style={{ width: 794, minHeight: "auto",background: "#fff", color: "#111", fontFamily: "'Georgia','Times New Roman',serif", fontSize: 10.5, lineHeight: 1.55, padding: "42px 52px", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 10 }}>
        <div style={{ fontSize: 23, fontWeight: 700, color: "#000", marginBottom: p.title ? 3 : 7 }}>{p.name || "Your Name"}</div>
        {p.title && <div style={{ fontSize: 12, color: "#444", fontStyle: "italic", marginBottom: 7 }}>{p.title}</div>}
        <div style={{ fontSize: 10, color: "#333", borderBottom: "1.5px solid #111", paddingBottom: 8 }}>{contacts.join(" • ") || "email@example.com • (555) 000-0000 • City, State"}</div>
      </div>
      {summary && <><CH label="Professional Summary" /><p style={{ marginBottom: 2 }}>{summary}</p></>}
      {experience.some(e => e.company || e.title) && (
        <><CH label="Experience" />
        {experience.filter(e => e.company || e.title).map(exp => (
          <div key={exp.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <b style={{ fontSize: 11 }}>{exp.title}{exp.title && exp.company ? " — " : ""}{exp.company}</b>
              <span style={{ fontSize: 10, color: "#555", whiteSpace: "nowrap", marginLeft: 8 }}>{dr(exp.startDate, exp.endDate, exp.current)}</span>
            </div>
            {exp.location && <div style={{ fontSize: 10, color: "#666", fontStyle: "italic", marginBottom: 3 }}>{exp.location}</div>}
            <Bullets text={exp.bullets} />
          </div>
        ))}</>
      )}
      {education.some(e => e.school) && (
        <><CH label="Education" />
        {education.filter(e => e.school).map(edu => (
          <div key={edu.id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <b style={{ fontSize: 11 }}>{edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}</b>
              <span style={{ fontSize: 10, color: "#555", whiteSpace: "nowrap", marginLeft: 8 }}>{edu.graduationDate}</span>
            </div>
            <div style={{ fontSize: 10, color: "#666", fontStyle: "italic" }}>{[edu.school, edu.location, edu.gpa ? `GPA: ${edu.gpa}` : "", edu.honors].filter(Boolean).join(" • ")}</div>
          </div>
        ))}</>
      )}
      {skills.some(s => s.items) && (
        <><CH label="Technical Skills" />
        {skills.filter(s => s.items).map(g => (
          <div key={g.id} style={{ display: "flex", marginBottom: 3 }}>
            <span style={{ fontWeight: 700, minWidth: 95 }}>{g.name}:</span>
            <span>{g.items}</span>
          </div>
        ))}</>
      )}
      {projects.some(pr => pr.name) && (
        <><CH label="Projects" />
        {projects.filter(pr => pr.name).map(proj => (
          <div key={proj.id} style={{ marginBottom: 8 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span><b style={{ fontSize: 11 }}>{proj.name}</b>{proj.tech && <span style={{ fontWeight: 400, color: "#555", fontSize: 10 }}> | {proj.tech}</span>}</span>
              {proj.link && <span style={{ fontSize: 10, color: "#666", fontStyle: "italic", marginLeft: 8 }}>{proj.link}</span>}
            </div>
            {proj.description && <Bullets text={proj.description} />}
          </div>
        ))}</>
      )}
      {certifications.some(c => c.name) && (
        <><CH label="Certifications" />
        {certifications.filter(c => c.name).map(cert => (
          <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span><b>{cert.name}</b>{cert.issuer ? ` — ${cert.issuer}` : ""}</span>
            {cert.date && <span style={{ fontSize: 10, color: "#555", marginLeft: 8 }}>{cert.date}</span>}
          </div>
        ))}</>
      )}
    </div>
  );
}

// ─── Template 2: Modern (Sidebar) ─────────────────────────────────────────────

function SideSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "1.3px", color: "#7dd3fc", marginBottom: 8, borderBottom: "1px solid rgba(125,211,252,0.25)", paddingBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

function MH({ label }: { label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 16, marginBottom: 8 }}>
      <div style={{ width: 3, height: 14, background: "#0ea5e9", borderRadius: 2, flexShrink: 0 }} />
      <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.9px", color: "#0f172a" }}>{label}</div>
    </div>
  );
}

export function ModernTemplate({ data: { personal: p, summary, experience, education, skills, projects, certifications } }: { data: ResumeData }) {
  const sidebarContacts = [
    { label: "Email", val: p.email }, { label: "Phone", val: p.phone },
    { label: "Location", val: p.location }, { label: "LinkedIn", val: p.linkedin },
    { label: "GitHub", val: p.github }, { label: "Website", val: p.website },
  ].filter(c => c.val);
  return (
    <div style={{ width: 794, minHeight: "auto",background: "#fff", display: "flex", boxSizing: "border-box", fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 10.5 }}>
      {/* Sidebar */}
      <div style={{ width: 215, background: "#0f2137", color: "#e0eaf4", padding: "36px 18px", flexShrink: 0, WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" } as React.CSSProperties}>
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 19, fontWeight: 700, color: "#fff", lineHeight: 1.2, marginBottom: 4 }}>{p.name || "Your Name"}</div>
          {p.title && <div style={{ fontSize: 10, color: "#94b4cc", lineHeight: 1.4 }}>{p.title}</div>}
        </div>
        {sidebarContacts.length > 0 && (
          <SideSection label="Contact">
            {sidebarContacts.map((c, i) => (
              <div key={i} style={{ fontSize: 9.5, marginBottom: 5, color: "#c5d9e8", wordBreak: "break-all", lineHeight: 1.4 }}>
                <div style={{ fontSize: 8.5, color: "#7dd3fc", fontWeight: 600, marginBottom: 1 }}>{c.label}</div>
                {c.val}
              </div>
            ))}
          </SideSection>
        )}
        {skills.some(s => s.items) && (
          <SideSection label="Skills">
            {skills.filter(s => s.items).map(g => (
              <div key={g.id} style={{ marginBottom: 10 }}>
                {g.name && <div style={{ fontSize: 9, fontWeight: 600, color: "#7dd3fc", marginBottom: 4 }}>{g.name}</div>}
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                  {g.items.split(",").map(item => item.trim()).filter(Boolean).map((item, i) => (
                    <span key={i} style={{ fontSize: 8.5, background: "rgba(255,255,255,0.08)", color: "#c5d9e8", padding: "2px 6px", borderRadius: 4 }}>{item}</span>
                  ))}
                </div>
              </div>
            ))}
          </SideSection>
        )}
        {certifications.some(c => c.name) && (
          <SideSection label="Certifications">
            {certifications.filter(c => c.name).map(cert => (
              <div key={cert.id} style={{ marginBottom: 8, fontSize: 9.5, color: "#c5d9e8" }}>
                <div style={{ fontWeight: 600, color: "#e0eaf4", marginBottom: 1 }}>{cert.name}</div>
                {cert.issuer && <div>{cert.issuer}</div>}
                {cert.date && <div style={{ color: "#7dd3fc", fontSize: 9 }}>{cert.date}</div>}
              </div>
            ))}
          </SideSection>
        )}
      </div>
      {/* Main */}
      <div style={{ flex: 1, padding: "36px 28px", color: "#111", lineHeight: 1.55 }}>
        {summary && <>
          <MH label="Professional Summary" />
          <p style={{ fontSize: 10.5, marginBottom: 4, color: "#333" }}>{summary}</p>
        </>}
        {experience.some(e => e.company || e.title) && (
          <><MH label="Experience" />
          {experience.filter(e => e.company || e.title).map(exp => (
            <div key={exp.id} style={{ marginBottom: 11 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <b style={{ fontSize: 11, color: "#0f2137" }}>{exp.title}</b>
                <span style={{ fontSize: 9.5, color: "#666", whiteSpace: "nowrap", marginLeft: 8 }}>{dr(exp.startDate, exp.endDate, exp.current)}</span>
              </div>
              <div style={{ fontSize: 10, color: "#0ea5e9", fontWeight: 600, marginBottom: 3 }}>{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
              <Bullets text={exp.bullets} style={{ color: "#333", fontSize: 10.5 }} />
            </div>
          ))}</>
        )}
        {education.some(e => e.school) && (
          <><MH label="Education" />
          {education.filter(e => e.school).map(edu => (
            <div key={edu.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <b style={{ fontSize: 11, color: "#0f2137" }}>{edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}</b>
                <span style={{ fontSize: 9.5, color: "#666", whiteSpace: "nowrap", marginLeft: 8 }}>{edu.graduationDate}</span>
              </div>
              <div style={{ fontSize: 10, color: "#0ea5e9", fontWeight: 600 }}>{[edu.school, edu.location].filter(Boolean).join(" · ")}</div>
              {(edu.gpa || edu.honors) && <div style={{ fontSize: 10, color: "#555" }}>{[edu.gpa ? `GPA: ${edu.gpa}` : "", edu.honors].filter(Boolean).join(" · ")}</div>}
            </div>
          ))}</>
        )}
        {projects.some(pr => pr.name) && (
          <><MH label="Projects" />
          {projects.filter(pr => pr.name).map(proj => (
            <div key={proj.id} style={{ marginBottom: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <b style={{ fontSize: 11, color: "#0f2137" }}>{proj.name}</b>
                {proj.link && <span style={{ fontSize: 9.5, color: "#0ea5e9", marginLeft: 8 }}>{proj.link}</span>}
              </div>
              {proj.tech && <div style={{ fontSize: 9.5, color: "#0ea5e9", fontWeight: 600, marginBottom: 2 }}>{proj.tech}</div>}
              {proj.description && <Bullets text={proj.description} style={{ color: "#333", fontSize: 10.5 }} />}
            </div>
          ))}</>
        )}
      </div>
    </div>
  );
}

// ─── Template 3: Tech ─────────────────────────────────────────────────────────

function TH({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.8px", color: "#1e293b", background: "#f1f5f9", padding: "4px 10px", marginTop: 14, marginBottom: 8, borderLeft: "3px solid #6366f1" }}>
      {label}
    </div>
  );
}

export function TechTemplate({ data: { personal: p, summary, experience, education, skills, projects, certifications } }: { data: ResumeData }) {
  const contacts = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean);
  return (
    <div style={{ width: 794, minHeight: "auto",background: "#fff", color: "#1e293b", fontFamily: "system-ui,-apple-system,sans-serif", fontSize: 10.5, lineHeight: 1.55, padding: "36px 48px", boxSizing: "border-box" }}>
      {/* Header */}
      <div style={{ borderBottom: "2px solid #6366f1", paddingBottom: 12, marginBottom: 4 }}>
        <div style={{ fontSize: 24, fontWeight: 800, color: "#0f172a", letterSpacing: "-0.5px" }}>{p.name || "Your Name"}</div>
        {p.title && <div style={{ fontSize: 12, color: "#6366f1", fontWeight: 600, marginTop: 2 }}>{p.title}</div>}
        <div style={{ fontSize: 9.5, color: "#475569", marginTop: 6, display: "flex", flexWrap: "wrap", gap: "0 16px" }}>
          {contacts.map((c, i) => <span key={i}>{c}</span>)}
        </div>
      </div>
      {/* Skills first — tech differentiator */}
      {skills.some(s => s.items) && (
        <><TH label="Technical Skills" />
        <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
          {skills.filter(s => s.items).map(g => (
            <div key={g.id} style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
              <span style={{ fontWeight: 700, fontSize: 10, minWidth: 90, color: "#374151" }}>{g.name}:</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                {g.items.split(",").map(item => item.trim()).filter(Boolean).map((item, i) => (
                  <span key={i} style={{ fontSize: 9.5, background: "#ede9fe", color: "#4c1d95", padding: "1px 7px", borderRadius: 4, fontWeight: 500 }}>{item}</span>
                ))}
              </div>
            </div>
          ))}
        </div></>
      )}
      {summary && <><TH label="Summary" /><p style={{ color: "#374151" }}>{summary}</p></>}
      {experience.some(e => e.company || e.title) && (
        <><TH label="Experience" />
        {experience.filter(e => e.company || e.title).map(exp => (
          <div key={exp.id} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <div>
                <b style={{ fontSize: 11, color: "#0f172a" }}>{exp.title}</b>
                {exp.company && <span style={{ color: "#6366f1", fontWeight: 600, fontSize: 10.5 }}> @ {exp.company}</span>}
              </div>
              <span style={{ fontSize: 9.5, color: "#64748b", whiteSpace: "nowrap", background: "#f8fafc", padding: "1px 8px", borderRadius: 4, border: "1px solid #e2e8f0" }}>{dr(exp.startDate, exp.endDate, exp.current)}</span>
            </div>
            {exp.location && <div style={{ fontSize: 9.5, color: "#64748b", marginBottom: 3 }}>{exp.location}</div>}
            <Bullets text={exp.bullets} style={{ color: "#374151" }} />
          </div>
        ))}</>
      )}
      {projects.some(pr => pr.name) && (
        <><TH label="Projects" />
        {projects.filter(pr => pr.name).map(proj => (
          <div key={proj.id} style={{ marginBottom: 9 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <b style={{ fontSize: 11, color: "#0f172a" }}>{proj.name}</b>
              {proj.link && <span style={{ fontSize: 9.5, color: "#6366f1", marginLeft: 8 }}>{proj.link}</span>}
            </div>
            {proj.tech && <div style={{ display: "flex", flexWrap: "wrap", gap: 3, marginBottom: 3, marginTop: 2 }}>{proj.tech.split(",").map(t => t.trim()).filter(Boolean).map((t, i) => <span key={i} style={{ fontSize: 9, background: "#ede9fe", color: "#4c1d95", padding: "1px 6px", borderRadius: 4 }}>{t}</span>)}</div>}
            {proj.description && <Bullets text={proj.description} style={{ color: "#374151" }} />}
          </div>
        ))}</>
      )}
      {education.some(e => e.school) && (
        <><TH label="Education" />
        {education.filter(e => e.school).map(edu => (
          <div key={edu.id} style={{ marginBottom: 7 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <b style={{ fontSize: 11, color: "#0f172a" }}>{edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}</b>
              <span style={{ fontSize: 9.5, color: "#64748b", whiteSpace: "nowrap", marginLeft: 8 }}>{edu.graduationDate}</span>
            </div>
            <div style={{ fontSize: 10, color: "#6366f1", fontWeight: 600 }}>{[edu.school, edu.location].filter(Boolean).join(" · ")}</div>
            {(edu.gpa || edu.honors) && <div style={{ fontSize: 10, color: "#64748b" }}>{[edu.gpa ? `GPA: ${edu.gpa}` : "", edu.honors].filter(Boolean).join(" · ")}</div>}
          </div>
        ))}</>
      )}
      {certifications.some(c => c.name) && (
        <><TH label="Certifications" />
        {certifications.filter(c => c.name).map(cert => (
          <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span><b style={{ color: "#0f172a" }}>{cert.name}</b>{cert.issuer ? <span style={{ color: "#64748b", fontSize: 10 }}> — {cert.issuer}</span> : ""}</span>
            {cert.date && <span style={{ fontSize: 9.5, background: "#ede9fe", color: "#4c1d95", padding: "1px 8px", borderRadius: 4 }}>{cert.date}</span>}
          </div>
        ))}</>
      )}
    </div>
  );
}

// ─── Template 4: Minimal ──────────────────────────────────────────────────────

function MinH({ label }: { label: string }) {
  return (
    <div style={{ fontSize: 9.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: "2px", color: "#1a1a1a", marginTop: 18, marginBottom: 8, paddingBottom: 3, borderBottom: "0.5px solid #bbb" }}>
      {label}
    </div>
  );
}

export function MinimalTemplate({ data: { personal: p, summary, experience, education, skills, projects, certifications } }: { data: ResumeData }) {
  const contacts = [p.email, p.phone, p.location, p.linkedin, p.github, p.website].filter(Boolean);
  return (
    <div style={{ width: 794, minHeight: "auto",background: "#fff", color: "#1a1a1a", fontFamily: "'Helvetica Neue',Arial,sans-serif", fontSize: 10.5, lineHeight: 1.6, padding: "52px 60px", boxSizing: "border-box" }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 26, fontWeight: 300, letterSpacing: "3px", textTransform: "uppercase", color: "#000", marginBottom: p.title ? 4 : 10 }}>{p.name || "YOUR NAME"}</div>
        {p.title && <div style={{ fontSize: 11, color: "#555", letterSpacing: "1px", textTransform: "uppercase", marginBottom: 10 }}>{p.title}</div>}
        <div style={{ fontSize: 9.5, color: "#555", letterSpacing: "0.3px" }}>{contacts.join("  ·  ")}</div>
      </div>
      {summary && <><MinH label="Profile" /><p style={{ color: "#333", fontStyle: "italic", lineHeight: 1.65 }}>{summary}</p></>}
      {experience.some(e => e.company || e.title) && (
        <><MinH label="Experience" />
        {experience.filter(e => e.company || e.title).map(exp => (
          <div key={exp.id} style={{ marginBottom: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 600, fontSize: 11 }}>{exp.title}</span>
              <span style={{ fontSize: 9.5, color: "#777", whiteSpace: "nowrap", marginLeft: 8 }}>{dr(exp.startDate, exp.endDate, exp.current)}</span>
            </div>
            <div style={{ fontSize: 10, color: "#777", marginBottom: 4 }}>{exp.company}{exp.location ? `,  ${exp.location}` : ""}</div>
            <Bullets text={exp.bullets} style={{ color: "#333", paddingLeft: 10 }} />
          </div>
        ))}</>
      )}
      {education.some(e => e.school) && (
        <><MinH label="Education" />
        {education.filter(e => e.school).map(edu => (
          <div key={edu.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 600, fontSize: 11 }}>{edu.degree}{edu.degree && edu.field ? " in " : ""}{edu.field}</span>
              <span style={{ fontSize: 9.5, color: "#777", whiteSpace: "nowrap", marginLeft: 8 }}>{edu.graduationDate}</span>
            </div>
            <div style={{ fontSize: 10, color: "#777" }}>{[edu.school, edu.location, edu.gpa ? `GPA ${edu.gpa}` : "", edu.honors].filter(Boolean).join("  ·  ")}</div>
          </div>
        ))}</>
      )}
      {skills.some(s => s.items) && (
        <><MinH label="Skills" />
        {skills.filter(s => s.items).map(g => (
          <div key={g.id} style={{ display: "flex", marginBottom: 4 }}>
            <span style={{ fontWeight: 600, minWidth: 90, fontSize: 10, color: "#444" }}>{g.name}</span>
            <span style={{ color: "#333" }}>{g.items}</span>
          </div>
        ))}</>
      )}
      {projects.some(pr => pr.name) && (
        <><MinH label="Projects" />
        {projects.filter(pr => pr.name).map(proj => (
          <div key={proj.id} style={{ marginBottom: 10 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontWeight: 600, fontSize: 11 }}>{proj.name}</span>
              {proj.link && <span style={{ fontSize: 9.5, color: "#777", marginLeft: 8 }}>{proj.link}</span>}
            </div>
            {proj.tech && <div style={{ fontSize: 10, color: "#777", marginBottom: 2 }}>{proj.tech}</div>}
            {proj.description && <Bullets text={proj.description} style={{ color: "#333", paddingLeft: 10 }} />}
          </div>
        ))}</>
      )}
      {certifications.some(c => c.name) && (
        <><MinH label="Certifications" />
        {certifications.filter(c => c.name).map(cert => (
          <div key={cert.id} style={{ display: "flex", justifyContent: "space-between", marginBottom: 5 }}>
            <span style={{ fontWeight: 600 }}>{cert.name}{cert.issuer ? <span style={{ fontWeight: 400, color: "#777", fontSize: 10 }}>,  {cert.issuer}</span> : ""}</span>
            {cert.date && <span style={{ fontSize: 9.5, color: "#777", marginLeft: 8 }}>{cert.date}</span>}
          </div>
        ))}</>
      )}
    </div>
  );
}

// ─── Templates Registry ───────────────────────────────────────────────────────

export const RESUME_TEMPLATES: TemplateConfig[] = [
  { id: "classic", name: "Classic", description: "Traditional serif layout. Safe for all ATS systems.", atsScore: "Excellent", accent: "#1a1a1a", Component: ClassicTemplate },
  { id: "modern", name: "Modern", description: "Sidebar layout with navy accent. Eye-catching for direct submissions.", atsScore: "Good", accent: "#0f2137", Component: ModernTemplate },
  { id: "tech", name: "Tech", description: "Skills-first layout with indigo chips. Built for dev roles.", atsScore: "Excellent", accent: "#6366f1", Component: TechTemplate },
  { id: "minimal", name: "Minimal", description: "Ultra-clean whitespace design. Stands out with simplicity.", atsScore: "Excellent", accent: "#1a1a1a", Component: MinimalTemplate },
];
