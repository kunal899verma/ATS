"use client";

import { useState, useEffect, useRef } from "react";
import { getLastResumeText, getLastJobDescription } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import {
  FileText,
  Sparkles,
  Copy,
  Check,
  CheckCircle2,
  RefreshCw,
  Download,
  Loader2,
} from "lucide-react";

const TONES = ["Professional", "Confident", "Friendly", "Formal", "Creative"] as const;
type Tone = (typeof TONES)[number];

const FOCUS_AREAS = [
  "Technical Skills",
  "Leadership",
  "Problem Solving",
  "Culture Fit",
  "Innovation",
] as const;
type FocusArea = (typeof FOCUS_AREAS)[number];

export default function CoverLetterGenerator() {
  const [resumeText, setResumeText] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [hiringManager, setHiringManager] = useState("");
  const [tone, setTone] = useState<Tone>("Professional");
  const [focusAreas, setFocusAreas] = useState<FocusArea[]>([]);

  const [coverLetter, setCoverLetter] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [autoLoaded, setAutoLoaded] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);

  // Auto-load resume + JD from last analysis (no toggle needed)
  useEffect(() => {
    const saved = getLastResumeText();
    if (saved && saved.length > 0) {
      setResumeText(saved);
      setAutoLoaded(true);
    }
    const jd = getLastJobDescription();
    if (jd && jd.length > 0) {
      setJobDescription(jd);
    }
  }, []);

  const toggleFocus = (area: FocusArea) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    );
  };

  const isValid = jobDescription.trim().length >= 50 && resumeText.trim().length > 0;

  const handleGenerate = async () => {
    if (!isValid) return;
    setIsGenerating(true);
    setCoverLetter("");
    setError(null);

    try {
      const response = await fetch("/api/ai/cover-letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.slice(0, 8000),
          jobDescription: jobDescription.slice(0, 4000),
          companyName,
          hiringManager,
          tone,
          focusAreas,
        }),
      });

      if (response.status === 429) {
        const body = await response.json();
        throw new Error(body.error ?? "Rate limit exceeded. Please wait a moment.");
      }

      if (!response.ok) {
        let msg = "Failed to generate cover letter.";
        try {
          const body = await response.json();
          if (body.error) msg = body.error;
        } catch { /* not JSON */ }
        throw new Error(msg);
      }

      if (!response.body) throw new Error("No response body received.");

      // Read the plain text stream (toTextStreamResponse sends raw text chunks)
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        text += chunk;
        setCoverLetter(text);
      }

      // Auto-scroll preview to bottom as content streams in
      if (previewRef.current) {
        previewRef.current.scrollTop = previewRef.current.scrollHeight;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong.";
      setError(msg);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async () => {
    if (!coverLetter) return;
    try {
      await navigator.clipboard.writeText(coverLetter);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = coverLetter;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!coverLetter) return;
    const blob = new Blob([coverLetter], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cover-letter${companyName ? `-${companyName.replace(/\s+/g, "-").toLowerCase()}` : ""}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const wordCount = coverLetter
    ? coverLetter.trim().split(/\s+/).filter(Boolean).length
    : 0;

  const actionBtnClass =
    "btn-ghost inline-flex min-h-11 w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-slate-300 hover:border-white/[0.14] hover:bg-white/[0.06] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-all";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
      {/* LEFT PANEL — INPUTS */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-card p-6 sm:p-8 flex flex-col gap-6"
      >
        {/* Resume input */}
        <div className="flex flex-col gap-2">
          <label htmlFor="resume" className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Your Resume
          </label>

          {/* Auto-loaded banner */}
          {autoLoaded && resumeText.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <p className="text-emerald-400 text-xs font-medium flex-1">
                Auto-loaded from your last analysis ({resumeText.length.toLocaleString()} chars)
              </p>
              <button
                type="button"
                onClick={() => { setResumeText(""); setAutoLoaded(false); }}
                className="text-emerald-400/60 hover:text-emerald-400 text-xs transition-colors"
              >
                Clear
              </button>
            </div>
          )}

          <textarea
            id="resume"
            rows={autoLoaded && resumeText.length > 0 ? 4 : 6}
            value={resumeText}
            onChange={(e) => { setAutoLoaded(false); setResumeText(e.target.value); }}
            placeholder="Paste your full resume text here... (or analyze your resume first on the Analyze page — it will auto-fill here)"
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-200 placeholder:text-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition resize-none"
          />
          <p className="text-xs text-slate-500">
            {resumeText.length > 0 ? (
              <span className="text-emerald-400">Resume ready ({resumeText.length.toLocaleString()} chars)</span>
            ) : (
              "Paste your resume to get a tailored cover letter"
            )}
          </p>
        </div>

        {/* Job description */}
        <div className="flex flex-col gap-2">
          <label htmlFor="jd" className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Job Description <span className="text-red-400">*</span>
          </label>
          <textarea
            id="jd"
            rows={6}
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the full job description here (min. 50 characters)..."
            className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-200 placeholder:text-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition resize-none"
          />
          <p className="text-xs">
            {jobDescription.length < 50 ? (
              <span className="text-amber-400">{50 - jobDescription.length} more characters needed</span>
            ) : (
              <span className="text-emerald-400">Job description ready ({jobDescription.length} chars)</span>
            )}
          </p>
        </div>

        {/* Company + Hiring Manager */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="company" className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Company Name <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              id="company"
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Stripe"
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-200 placeholder:text-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="manager" className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
              Hiring Manager <span className="text-slate-500 font-normal">(optional)</span>
            </label>
            <input
              id="manager"
              type="text"
              value={hiringManager}
              onChange={(e) => setHiringManager(e.target.value)}
              placeholder="e.g. Jane Smith"
              className="w-full rounded-xl bg-white/[0.04] border border-white/[0.06] text-slate-200 placeholder:text-slate-500 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 transition"
            />
          </div>
        </div>

        {/* Tone selector */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>Tone</label>
          <div className="flex flex-wrap gap-2">
            {TONES.map((t) => (
              <motion.button
                key={t}
                type="button"
                whileTap={{ scale: 0.95 }}
                onClick={() => setTone(t)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  tone === t
                    ? "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/25"
                    : "bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/10"
                }`}
              >
                {t}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Focus areas */}
        <div className="flex flex-col gap-2">
          <label className="text-sm font-semibold text-white" style={{ fontFamily: "var(--font-display)" }}>
            Focus Areas <span className="text-slate-500 font-normal">(optional)</span>
          </label>
          <div className="flex flex-wrap gap-2">
            {FOCUS_AREAS.map((area) => {
              const active = focusAreas.includes(area);
              return (
                <motion.button
                  key={area}
                  type="button"
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleFocus(area)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-all ${
                    active
                      ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300"
                      : "bg-white/[0.04] border border-white/[0.06] text-slate-400 hover:text-white hover:border-white/10"
                  }`}
                >
                  {active && <Check className="w-3 h-3 inline mr-1 -mt-0.5" />}
                  {area}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="rounded-xl bg-red-500/10 border border-red-500/20 px-4 py-3 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <button
          type="button"
          disabled={!isValid || isGenerating}
          onClick={handleGenerate}
          className={`btn-primary w-full flex items-center justify-center gap-2.5 py-4 rounded-xl text-base font-semibold disabled:opacity-40 disabled:cursor-not-allowed ${
            isValid && !isGenerating ? "animate-glow-breathe" : ""
          }`}
        >
          {isGenerating ? (
            <><Loader2 className="w-5 h-5 animate-spin" /> Generating...</>
          ) : (
            <><Sparkles className="w-5 h-5" /> Generate Cover Letter</>
          )}
        </button>
      </motion.div>

      {/* RIGHT PANEL — LIVE PREVIEW */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
        className="glass-card p-6 sm:p-8 flex flex-col"
      >
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
            <FileText className="w-5 h-5 text-indigo-400" />
            Cover Letter Preview
          </h2>
          {coverLetter && (
            <span className="text-xs text-slate-500">{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
          )}
        </div>

        {/* Preview content */}
        <div
          ref={previewRef}
          className="flex-1 min-h-[300px] lg:min-h-[420px] rounded-xl bg-white/[0.02] border border-white/[0.06] p-5 overflow-y-auto"
        >
          <AnimatePresence mode="wait">
            {coverLetter ? (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
                  {coverLetter}
                  {isGenerating && (
                    <span className="inline-block w-2 h-4 ml-0.5 bg-indigo-400 animate-pulse rounded-sm" />
                  )}
                </div>
              </motion.div>
            ) : isGenerating ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-4 py-16"
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-2 border-indigo-500/30 border-t-indigo-500 animate-spin" />
                  <Sparkles className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <p className="text-sm text-slate-400">Crafting your cover letter...</p>
              </motion.div>
            ) : (
              <motion.div
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center h-full gap-3 py-16 text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <FileText className="w-7 h-7 text-indigo-400/60" />
                </div>
                <p className="text-sm text-slate-500 max-w-xs">
                  Your AI-generated cover letter will appear here. Fill in the details on the left and hit generate.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Actions bar */}
        <div className="grid grid-cols-1 gap-3 sm:flex sm:flex-wrap sm:items-center mt-4 pt-4 border-t border-white/[0.06]">
          <button type="button" disabled={!coverLetter || isGenerating} onClick={handleCopy} className={actionBtnClass}>
            {copied ? <><Check className="w-4 h-4 text-green-400" /> Copied!</> : <><Copy className="w-4 h-4" /> Copy</>}
          </button>
          <button type="button" disabled={!coverLetter || isGenerating} onClick={handleGenerate} className={actionBtnClass}>
            <RefreshCw className={`w-4 h-4 ${isGenerating ? "animate-spin" : ""}`} /> Regenerate
          </button>
          <button type="button" disabled={!coverLetter || isGenerating} onClick={handleDownload} className={actionBtnClass}>
            <Download className="w-4 h-4" /> Download
          </button>
        </div>
      </motion.div>
    </div>
  );
}
