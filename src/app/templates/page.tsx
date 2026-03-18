"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import {
  RESUME_TEMPLATES, BLANK_RESUME_DATA, SAMPLE_RESUME_DATA,
  type ResumeData, type WorkExp, type Edu, type SkillGroup, type Project, type Cert,
} from "@/components/templates/ResumeTemplates";
import {
  Plus, Trash2, Download, Zap, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp, Shuffle, RotateCcw, Eye,
} from "lucide-react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function uid() { return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`; }

const ATS_COLOR = {
  Excellent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  Good:      "text-amber-400 bg-amber-500/10 border-amber-500/20",
  Limited:   "text-red-400 bg-red-500/10 border-red-500/20",
};

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, open, onToggle, children, badge }: {
  title: string; open: boolean; onToggle: () => void; children: React.ReactNode; badge?: number;
}) {
  return (
    <div className="border border-white/7 rounded-xl overflow-hidden mb-3">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 bg-white/3 hover:bg-white/5 transition-colors text-left"
      >
        <span className="text-white font-medium text-sm">{title}</span>
        <div className="flex items-center gap-2">
          {badge !== undefined && badge > 0 && (
            <span className="text-[10px] bg-cyan-500/20 text-cyan-400 px-1.5 py-0.5 rounded-full font-semibold">{badge}</span>
          )}
          {open ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </div>
      </button>
      {open && <div className="p-4 space-y-3">{children}</div>}
    </div>
  );
}

// ─── Field components ─────────────────────────────────────────────────────────

function Field({ label, value, onChange, placeholder, type = "text" }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label className="block text-[11px] text-slate-400 font-medium mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors"
      />
    </div>
  );
}

function TextArea({ label, value, onChange, placeholder, rows = 3 }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; rows?: number;
}) {
  return (
    <div>
      <label className="block text-[11px] text-slate-400 font-medium mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-cyan-500/40 transition-colors resize-y"
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function TemplatesPage() {
  const [selectedTemplate, setSelectedTemplate] = useState("classic");
  const [data, setData] = useState<ResumeData>(BLANK_RESUME_DATA);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    personal: true, summary: false, experience: true, education: false, skills: true, projects: false, certifications: false,
  });
  const [previewScale, setPreviewScale] = useState(0.6);
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const previewWrapRef = useRef<HTMLDivElement>(null);

  // Compute scale based on wrapper width
  useEffect(() => {
    function measure() {
      if (previewWrapRef.current) {
        const w = previewWrapRef.current.offsetWidth;
        setPreviewScale(Math.max(0.3, w / 794));
      }
    }
    measure();
    setIsMounted(true);
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const toggle = (key: string) => setOpenSections(s => ({ ...s, [key]: !s[key] }));

  // Personal
  const setPersonal = (field: keyof ResumeData["personal"], val: string) =>
    setData(d => ({ ...d, personal: { ...d.personal, [field]: val } }));

  // Experience
  const addExp = () => setData(d => ({ ...d, experience: [...d.experience, { id: uid(), company: "", title: "", location: "", startDate: "", endDate: "", current: false, bullets: "" }] }));
  const removeExp = (id: string) => setData(d => ({ ...d, experience: d.experience.filter(e => e.id !== id) }));
  const updateExp = (id: string, field: keyof WorkExp, val: string | boolean) =>
    setData(d => ({ ...d, experience: d.experience.map(e => e.id === id ? { ...e, [field]: val } : e) }));

  // Education
  const addEdu = () => setData(d => ({ ...d, education: [...d.education, { id: uid(), school: "", degree: "", field: "", location: "", graduationDate: "", gpa: "", honors: "" }] }));
  const removeEdu = (id: string) => setData(d => ({ ...d, education: d.education.filter(e => e.id !== id) }));
  const updateEdu = (id: string, field: keyof Edu, val: string) =>
    setData(d => ({ ...d, education: d.education.map(e => e.id === id ? { ...e, [field]: val } : e) }));

  // Skills
  const addSkill = () => setData(d => ({ ...d, skills: [...d.skills, { id: uid(), name: "", items: "" }] }));
  const removeSkill = (id: string) => setData(d => ({ ...d, skills: d.skills.filter(s => s.id !== id) }));
  const updateSkill = (id: string, field: keyof SkillGroup, val: string) =>
    setData(d => ({ ...d, skills: d.skills.map(s => s.id === id ? { ...s, [field]: val } : s) }));

  // Projects
  const addProject = () => setData(d => ({ ...d, projects: [...d.projects, { id: uid(), name: "", description: "", tech: "", link: "" }] }));
  const removeProject = (id: string) => setData(d => ({ ...d, projects: d.projects.filter(p => p.id !== id) }));
  const updateProject = (id: string, field: keyof Project, val: string) =>
    setData(d => ({ ...d, projects: d.projects.map(p => p.id === id ? { ...p, [field]: val } : p) }));

  // Certifications
  const addCert = () => setData(d => ({ ...d, certifications: [...d.certifications, { id: uid(), name: "", issuer: "", date: "" }] }));
  const removeCert = (id: string) => setData(d => ({ ...d, certifications: d.certifications.filter(c => c.id !== id) }));
  const updateCert = (id: string, field: keyof Cert, val: string) =>
    setData(d => ({ ...d, certifications: d.certifications.map(c => c.id === id ? { ...c, [field]: val } : c) }));

  const activeTemplate = RESUME_TEMPLATES.find(t => t.id === selectedTemplate) ?? RESUME_TEMPLATES[0];
  const TemplateComponent = activeTemplate.Component;

  const handleDownload = useCallback(() => {
    window.print();
  }, []);

  return (
    <>
      {/* Print CSS — portal element is direct body child so :not() works */}
      <style>{`
        @media print {
          body > *:not(#resume-print-root) { display: none !important; }
          #resume-print-root {
            display: block !important;
            width: 794px !important;
          }
          #resume-print-root > div {
            min-height: 0 !important;
            height: auto !important;
          }
          @page { size: A4; margin: 10mm; }
        }
      `}</style>

      <Navbar />
      <main className="min-h-screen bg-[#020817] text-slate-300 pt-16">
        {/* Header */}
        <div className="bg-[#060f23] border-b border-white/5 px-4 py-5">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h1 className="text-white font-bold text-xl">Free ATS Resume Builder</h1>
              <p className="text-slate-400 text-sm mt-0.5">Choose a template, fill your details, download as PDF — no signup needed</p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => setData(SAMPLE_RESUME_DATA)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs transition-colors"
              >
                <Shuffle className="w-3.5 h-3.5" /> Load Sample
              </button>
              <button
                onClick={() => setData(BLANK_RESUME_DATA)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" /> Clear All
              </button>
              <button
                onClick={() => setShowMobilePreview(v => !v)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-white/5 hover:bg-white/8 border border-white/10 text-slate-300 text-xs transition-colors lg:hidden"
              >
                <Eye className="w-3.5 h-3.5" /> Preview
              </button>
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
              >
                <Download className="w-4 h-4" /> Download PDF
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
          {/* Template Selector */}
          <div>
            <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold mb-3">Choose Template</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {RESUME_TEMPLATES.map(t => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`relative text-left p-4 rounded-xl border transition-all ${
                    selectedTemplate === t.id
                      ? "border-cyan-500/50 bg-cyan-500/8"
                      : "border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5"
                  }`}
                >
                  {/* Color swatch */}
                  <div className="w-full h-20 rounded-lg mb-3 overflow-hidden flex items-center justify-center" style={{ background: "#f8f9fa" }}>
                    <div className="w-full h-full p-2 flex flex-col gap-1.5">
                      <div className="h-2.5 rounded" style={{ background: t.accent, width: "60%" }} />
                      <div className="h-1 rounded bg-gray-300 w-full" />
                      <div className="h-1 rounded bg-gray-200 w-4/5" />
                      <div className="h-1 rounded bg-gray-200 w-3/5" />
                      <div className="h-1 rounded bg-gray-300 w-full mt-1" />
                      <div className="h-1 rounded bg-gray-200 w-4/5" />
                      <div className="h-1 rounded bg-gray-200 w-2/3" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-white font-semibold text-sm">{t.name}</span>
                    {selectedTemplate === t.id && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-slate-500 text-[10px] mt-0.5 leading-snug">{t.description}</p>
                  <span className={`mt-2 inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${ATS_COLOR[t.atsScore]}`}>
                    {t.atsScore === "Excellent" ? <CheckCircle2 className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                    ATS: {t.atsScore}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Builder: Form + Preview */}
          <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6">
            {/* Form column */}
            <div className="space-y-0">
              {/* Personal */}
              <Section title="Personal Info" open={openSections.personal} onToggle={() => toggle("personal")}>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2"><Field label="Full Name" value={data.personal.name} onChange={v => setPersonal("name", v)} placeholder="John Doe" /></div>
                  <div className="col-span-2"><Field label="Job Title / Desired Role" value={data.personal.title} onChange={v => setPersonal("title", v)} placeholder="Senior Software Engineer" /></div>
                  <Field label="Email" value={data.personal.email} onChange={v => setPersonal("email", v)} placeholder="john@example.com" type="email" />
                  <Field label="Phone" value={data.personal.phone} onChange={v => setPersonal("phone", v)} placeholder="(555) 123-4567" />
                  <div className="col-span-2"><Field label="Location" value={data.personal.location} onChange={v => setPersonal("location", v)} placeholder="City, State" /></div>
                  <Field label="LinkedIn URL" value={data.personal.linkedin} onChange={v => setPersonal("linkedin", v)} placeholder="linkedin.com/in/you" />
                  <Field label="GitHub / Portfolio" value={data.personal.github} onChange={v => setPersonal("github", v)} placeholder="github.com/you" />
                  <div className="col-span-2"><Field label="Website (optional)" value={data.personal.website} onChange={v => setPersonal("website", v)} placeholder="yoursite.com" /></div>
                </div>
              </Section>

              {/* Summary */}
              <Section title="Professional Summary" open={openSections.summary} onToggle={() => toggle("summary")}>
                <TextArea
                  label="Summary (2–3 sentences)"
                  value={data.summary}
                  onChange={v => setData(d => ({ ...d, summary: v }))}
                  placeholder="Results-driven engineer with X years of experience..."
                  rows={4}
                />
                <p className="text-[10px] text-slate-600">Tip: Mention years of experience, top skills, and 1 quantified achievement</p>
              </Section>

              {/* Experience */}
              <Section title="Work Experience" open={openSections.experience} onToggle={() => toggle("experience")} badge={data.experience.length}>
                {data.experience.map((exp, idx) => (
                  <div key={exp.id} className="border border-white/8 rounded-xl p-3 space-y-2.5 relative">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400 font-semibold">Position {idx + 1}</span>
                      {data.experience.length > 1 && (
                        <button onClick={() => removeExp(exp.id)} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2"><Field label="Job Title" value={exp.title} onChange={v => updateExp(exp.id, "title", v)} placeholder="Software Engineer" /></div>
                      <div className="col-span-2"><Field label="Company" value={exp.company} onChange={v => updateExp(exp.id, "company", v)} placeholder="Acme Corp" /></div>
                      <Field label="Location" value={exp.location} onChange={v => updateExp(exp.id, "location", v)} placeholder="SF, CA or Remote" />
                      <Field label="Start Date" value={exp.startDate} onChange={v => updateExp(exp.id, "startDate", v)} placeholder="Jan 2022" />
                      <Field label="End Date" value={exp.endDate} onChange={v => updateExp(exp.id, "endDate", v)} placeholder="Dec 2023" />
                      <div className="flex items-center gap-2 pt-4">
                        <input type="checkbox" id={`cur-${exp.id}`} checked={exp.current} onChange={e => updateExp(exp.id, "current", e.target.checked)} className="accent-cyan-500" />
                        <label htmlFor={`cur-${exp.id}`} className="text-[11px] text-slate-400 cursor-pointer">Current role</label>
                      </div>
                    </div>
                    <TextArea
                      label="Bullet Points (one per line)"
                      value={exp.bullets}
                      onChange={v => updateExp(exp.id, "bullets", v)}
                      placeholder={"Led team of 5 engineers to ship payment feature\nReduced API latency by 40% via caching layer\nMentored 2 junior engineers"}
                      rows={4}
                    />
                    <p className="text-[10px] text-slate-600">Tip: Start each bullet with an action verb + add a number</p>
                  </div>
                ))}
                <button onClick={addExp} className="flex items-center gap-1.5 text-cyan-400 text-xs hover:text-cyan-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Another Position
                </button>
              </Section>

              {/* Education */}
              <Section title="Education" open={openSections.education} onToggle={() => toggle("education")} badge={data.education.length}>
                {data.education.map((edu, idx) => (
                  <div key={edu.id} className="border border-white/8 rounded-xl p-3 space-y-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400 font-semibold">Degree {idx + 1}</span>
                      {data.education.length > 1 && (
                        <button onClick={() => removeEdu(edu.id)} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                    <Field label="School / University" value={edu.school} onChange={v => updateEdu(edu.id, "school", v)} placeholder="MIT" />
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Degree" value={edu.degree} onChange={v => updateEdu(edu.id, "degree", v)} placeholder="Bachelor of Science" />
                      <Field label="Field of Study" value={edu.field} onChange={v => updateEdu(edu.id, "field", v)} placeholder="Computer Science" />
                      <Field label="Location" value={edu.location} onChange={v => updateEdu(edu.id, "location", v)} placeholder="Cambridge, MA" />
                      <Field label="Graduation Date" value={edu.graduationDate} onChange={v => updateEdu(edu.id, "graduationDate", v)} placeholder="May 2022" />
                      <Field label="GPA (optional)" value={edu.gpa} onChange={v => updateEdu(edu.id, "gpa", v)} placeholder="3.9" />
                      <Field label="Honors (optional)" value={edu.honors} onChange={v => updateEdu(edu.id, "honors", v)} placeholder="Magna Cum Laude" />
                    </div>
                  </div>
                ))}
                <button onClick={addEdu} className="flex items-center gap-1.5 text-cyan-400 text-xs hover:text-cyan-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Another Degree
                </button>
              </Section>

              {/* Skills */}
              <Section title="Skills" open={openSections.skills} onToggle={() => toggle("skills")} badge={data.skills.length}>
                {data.skills.map((sg, idx) => (
                  <div key={sg.id} className="border border-white/8 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-slate-400 font-semibold">Category {idx + 1}</span>
                      {data.skills.length > 1 && (
                        <button onClick={() => removeSkill(sg.id)} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <Field label="Category Name" value={sg.name} onChange={v => updateSkill(sg.id, "name", v)} placeholder="Languages" />
                      <Field label="Skills (comma-separated)" value={sg.items} onChange={v => updateSkill(sg.id, "items", v)} placeholder="Python, JavaScript, Go" />
                    </div>
                  </div>
                ))}
                <button onClick={addSkill} className="flex items-center gap-1.5 text-cyan-400 text-xs hover:text-cyan-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Skill Category
                </button>
              </Section>

              {/* Projects */}
              <Section title="Projects (optional)" open={openSections.projects} onToggle={() => toggle("projects")} badge={data.projects.length}>
                {data.projects.map((proj, idx) => (
                  <div key={proj.id} className="border border-white/8 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400 font-semibold">Project {idx + 1}</span>
                      <button onClick={() => removeProject(proj.id)} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <Field label="Project Name" value={proj.name} onChange={v => updateProject(proj.id, "name", v)} placeholder="Open Source Tool" />
                    <Field label="Tech Stack" value={proj.tech} onChange={v => updateProject(proj.id, "tech", v)} placeholder="React, Node.js, PostgreSQL" />
                    <Field label="Link (optional)" value={proj.link} onChange={v => updateProject(proj.id, "link", v)} placeholder="github.com/you/project" />
                    <TextArea label="Description" value={proj.description} onChange={v => updateProject(proj.id, "description", v)} placeholder="Describe impact and what you built" rows={2} />
                  </div>
                ))}
                <button onClick={addProject} className="flex items-center gap-1.5 text-cyan-400 text-xs hover:text-cyan-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Project
                </button>
                {data.projects.length === 0 && (
                  <p className="text-[10px] text-slate-600">Projects are especially valuable for early-career candidates and developers</p>
                )}
              </Section>

              {/* Certifications */}
              <Section title="Certifications (optional)" open={openSections.certifications} onToggle={() => toggle("certifications")} badge={data.certifications.length}>
                {data.certifications.map((cert, idx) => (
                  <div key={cert.id} className="border border-white/8 rounded-xl p-3 space-y-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-slate-400 font-semibold">Certification {idx + 1}</span>
                      <button onClick={() => removeCert(cert.id)} className="text-red-400/60 hover:text-red-400 transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="col-span-2"><Field label="Certification Name" value={cert.name} onChange={v => updateCert(cert.id, "name", v)} placeholder="AWS Solutions Architect" /></div>
                      <Field label="Issuing Organization" value={cert.issuer} onChange={v => updateCert(cert.id, "issuer", v)} placeholder="Amazon Web Services" />
                      <Field label="Year" value={cert.date} onChange={v => updateCert(cert.id, "date", v)} placeholder="2024" />
                    </div>
                  </div>
                ))}
                <button onClick={addCert} className="flex items-center gap-1.5 text-cyan-400 text-xs hover:text-cyan-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Certification
                </button>
              </Section>

              {/* Bottom CTA */}
              <div className="pt-3 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDownload}
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
                >
                  <Download className="w-4 h-4" /> Download as PDF
                </button>
                <Link
                  href="/analyze"
                  className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-white/12 text-slate-300 text-sm hover:border-cyan-500/30 hover:text-white transition-colors"
                >
                  <Zap className="w-4 h-4 text-cyan-400" /> Check ATS Score
                </Link>
              </div>
              <p className="text-[10px] text-slate-600 text-center pb-4">Browser will open print dialog — select "Save as PDF" to download</p>
            </div>

            {/* Preview column */}
            <div className="hidden lg:block">
              <div className="sticky top-20">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">Live Preview — {activeTemplate.name}</p>
                  <span className="text-[10px] text-slate-600">Updates as you type</span>
                </div>
                <div
                  ref={previewWrapRef}
                  className="w-full overflow-hidden rounded-xl border border-white/8 bg-white shadow-2xl shadow-black/40"
                  style={{ height: Math.round(1123 * previewScale) }}
                >
                  <div style={{ transform: `scale(${previewScale})`, transformOrigin: "top left", width: 794 }}>
                    <TemplateComponent data={data} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile preview modal */}
        {showMobilePreview && (
          <div className="fixed inset-0 z-50 bg-black/80 flex flex-col lg:hidden" onClick={() => setShowMobilePreview(false)}>
            <div className="flex items-center justify-between px-4 py-3 bg-[#060f23] border-b border-white/5">
              <span className="text-white font-semibold text-sm">Preview — {activeTemplate.name}</span>
              <button onClick={() => setShowMobilePreview(false)} className="text-slate-400 hover:text-white text-sm">✕ Close</button>
            </div>
            <div className="flex-1 overflow-auto p-4" onClick={e => e.stopPropagation()}>
              <div className="overflow-hidden rounded-lg border border-white/8 bg-white" style={{ width: "100%", height: `${Math.round(1123 * 0.45)}px` }}>
                <div style={{ transform: "scale(0.45)", transformOrigin: "top left", width: 794 }}>
                  <TemplateComponent data={data} />
                </div>
              </div>
            </div>
            <div className="px-4 py-3 bg-[#060f23] border-t border-white/5">
              <button onClick={handleDownload} className="w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white font-semibold text-sm">
                Download PDF
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Portal: renders as direct body child — display:none overridden by print CSS */}
      {isMounted && createPortal(
        <div id="resume-print-root" style={{ display: "none" }}>
          <TemplateComponent data={data} />
        </div>,
        document.body
      )}
    </>
  );
}
