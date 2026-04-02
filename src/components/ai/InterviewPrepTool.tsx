"use client";

import { useState, useEffect, useRef } from "react";
import { getLastResumeText } from "@/lib/storage";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  Brain,
  Shuffle,
  Briefcase,
} from "lucide-react";

/* ── Types ─────────────────────────────────────────────────────────────────── */
type InterviewType = "Behavioral" | "Technical" | "Mixed" | "Case Study";
type Difficulty = "Easy" | "Medium" | "Hard";

const INTERVIEW_TYPES: { label: InterviewType; icon: React.ReactNode }[] = [
  { label: "Behavioral", icon: <MessageSquare className="w-3.5 h-3.5" /> },
  { label: "Technical", icon: <Brain className="w-3.5 h-3.5" /> },
  { label: "Mixed", icon: <Shuffle className="w-3.5 h-3.5" /> },
  { label: "Case Study", icon: <Briefcase className="w-3.5 h-3.5" /> },
];

const DIFFICULTIES: { label: Difficulty; color: string }[] = [
  { label: "Easy", color: "emerald" },
  { label: "Medium", color: "amber" },
  { label: "Hard", color: "red" },
];

/* ── Component ─────────────────────────────────────────────────────────────── */
export default function InterviewPrepTool() {
  const [resumeText, setResumeText] = useState("");
  const [autoLoaded, setAutoLoaded] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [interviewType, setInterviewType] = useState<InterviewType>("Mixed");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [rawText, setRawText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [expandedQuestions, setExpandedQuestions] = useState<Set<number>>(
    new Set()
  );
  const outputRef = useRef<HTMLDivElement>(null);

  /* Auto-load resume from last analysis */
  useEffect(() => {
    const saved = getLastResumeText();
    if (saved && saved.length > 50) {
      setResumeText(saved);
      setAutoLoaded(true);
    }
  }, []);

  /* ── Generate handler ──────────────────────────────────────────────────── */
  const handleGenerate = async () => {
    if (!resumeText.trim() || !jobDescription.trim()) {
      setError("Please provide both your resume and the target role / job description.");
      return;
    }
    setError(null);
    setIsGenerating(true);
    setRawText("");
    setExpandedQuestions(new Set());

    try {
      const response = await fetch("/api/ai/interview-prep", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText: resumeText.trim(),
          jobDescription: jobDescription.trim(),
          interviewType,
          difficulty,
        }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(
          data.error || `Request failed (${response.status})`
        );
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("No response stream available.");

      const decoder = new TextDecoder();
      let text = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        text += chunk;
        setRawText(text);
      }

      // Scroll to output
      setTimeout(() => {
        outputRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 200);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  /* ── Toggle answer guide ───────────────────────────────────────────────── */
  const toggleQuestion = (idx: number) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  /* ── Parse streamed text into sections ─────────────────────────────────── */
  const questionBlocks = rawText
    .split(/(?=##\s*(?:Question\s*\d|Q\d|\d+[\.\)]))/i)
    .filter((block) => block.trim().length > 20);

  const hasOutput = rawText.trim().length > 0;
  const hasResume = resumeText.trim().length >= 50;
  const hasJD = jobDescription.trim().length >= 10;
  const canGenerate = hasResume && hasJD && !isGenerating;

  /* ── Difficulty color helpers ──────────────────────────────────────────── */
  const difficultyColorMap: Record<string, string> = {
    Easy: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    Hard: "bg-red-500/10 text-red-400 border-red-500/20",
  };

  const typeColorMap: Record<string, string> = {
    Behavioral: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    Technical: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    Mixed: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    "Case Study": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
      {/* ── Input Section ──────────────────────────────────────────────────── */}
      <motion.div
        className="glass-card rounded-2xl border border-white/[0.06] overflow-hidden mb-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        {/* Resume textarea */}
        <div className="p-5 sm:p-6 border-b border-white/[0.06]">
          <label className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-3 h-3 text-indigo-400" />
            </div>
            Your Resume
          </label>

          {/* Auto-loaded banner */}
          {autoLoaded && resumeText.length > 0 && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mb-3">
              <div className="w-4 h-4 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
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
            value={resumeText}
            onChange={(e) => {
              setResumeText(e.target.value);
              setAutoLoaded(false);
            }}
            placeholder="Paste your full resume text here... (or analyze your resume first on the Analyze page — it will auto-fill here)"
            rows={autoLoaded && resumeText.length > 0 ? 4 : 6}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-slate-300 text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-indigo-500/40 focus:bg-indigo-500/[0.02] transition-all leading-relaxed font-mono"
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-slate-600">
              {resumeText.length} chars
              {resumeText.length >= 50 ? (
                <span className="text-emerald-500 ml-1">&#10003;</span>
              ) : (
                <span className="text-amber-500 ml-1">(min 50)</span>
              )}
            </span>
          </div>
        </div>

        {/* Job description textarea */}
        <div className="p-5 sm:p-6 border-b border-white/[0.06]">
          <label className="text-white font-semibold text-sm flex items-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-3 h-3 text-violet-400" />
            </div>
            Target Role / Job Description
            <span className="text-red-400 text-xs">*</span>
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            placeholder="Paste the job description or describe the role you're interviewing for. Include title, responsibilities, and required qualifications..."
            rows={5}
            className="w-full bg-white/[0.03] border border-white/[0.08] rounded-xl p-4 text-slate-300 text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-violet-500/40 focus:bg-violet-500/[0.02] transition-all leading-relaxed"
          />
          <div className="flex justify-end mt-1.5">
            <span className="text-[11px] text-slate-600">
              {jobDescription.length} chars
              {jobDescription.length >= 10 ? (
                <span className="text-emerald-500 ml-1">&#10003;</span>
              ) : (
                <span className="text-amber-500 ml-1">(required)</span>
              )}
            </span>
          </div>
        </div>

        {/* Interview type & difficulty selectors */}
        <div className="p-5 sm:p-6 space-y-5">
          {/* Interview type */}
          <div>
            <label className="text-white font-semibold text-sm mb-3 block">
              Interview Type
            </label>
            <div className="flex flex-wrap gap-2">
              {INTERVIEW_TYPES.map(({ label, icon }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setInterviewType(label)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    interviewType === label
                      ? "bg-indigo-500/15 text-indigo-400 border-indigo-500/30 shadow-[0_0_12px_rgba(99,102,241,0.15)]"
                      : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:border-white/[0.15] hover:text-slate-300"
                  }`}
                >
                  {icon}
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty */}
          <div>
            <label className="text-white font-semibold text-sm mb-3 block">
              Difficulty
            </label>
            <div className="flex flex-wrap gap-2">
              {DIFFICULTIES.map(({ label, color }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setDifficulty(label)}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                    difficulty === label
                      ? `bg-${color}-500/15 text-${color}-400 border-${color}-500/30 shadow-[0_0_12px_rgba(99,102,241,0.1)]`
                      : "bg-white/[0.03] text-slate-400 border-white/[0.08] hover:border-white/[0.15] hover:text-slate-300"
                  }`}
                  style={
                    difficulty === label
                      ? {
                          backgroundColor:
                            color === "emerald"
                              ? "rgba(16,185,129,0.15)"
                              : color === "amber"
                              ? "rgba(245,158,11,0.15)"
                              : "rgba(239,68,68,0.15)",
                          color:
                            color === "emerald"
                              ? "rgb(52,211,153)"
                              : color === "amber"
                              ? "rgb(251,191,36)"
                              : "rgb(248,113,113)",
                          borderColor:
                            color === "emerald"
                              ? "rgba(16,185,129,0.3)"
                              : color === "amber"
                              ? "rgba(245,158,11,0.3)"
                              : "rgba(239,68,68,0.3)",
                        }
                      : undefined
                  }
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Error */}
        <AnimatePresence>
          {error && (
            <motion.div
              className="mx-5 sm:mx-6 mb-4 flex items-start gap-3 p-4 rounded-xl bg-red-500/[0.08] border border-red-500/20 text-red-400"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p className="text-sm">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate button */}
        <div className="p-5 sm:p-6 pt-0">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!canGenerate}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generating Questions...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate Questions
              </>
            )}
          </button>

          {!canGenerate && !isGenerating && (
            <p className="text-slate-600 text-xs text-center mt-3">
              {!hasResume && !hasJD
                ? "Provide your resume and job description to continue"
                : !hasResume
                ? "Paste your resume text (min 50 characters)"
                : "Provide the target role or job description"}
            </p>
          )}
        </div>
      </motion.div>

      {/* ── Output Section ─────────────────────────────────────────────────── */}
      <div ref={outputRef}>
        <AnimatePresence>
          {(hasOutput || isGenerating) && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between mb-4">
                <h2
                  className="text-xl sm:text-2xl font-bold text-white flex items-center gap-3"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
                    <MessageSquare className="w-4 h-4 text-white" />
                  </div>
                  Your Interview Questions
                </h2>
                {!isGenerating && questionBlocks.length > 0 && (
                  <span className="text-sm text-slate-500 sm:text-right">
                    {questionBlocks.length} question
                    {questionBlocks.length !== 1 ? "s" : ""}
                  </span>
                )}
              </div>

              {/* Streaming / generating indicator */}
              {isGenerating && (
                <div className="flex items-center gap-2 mb-4 text-indigo-400 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating tailored questions...
                </div>
              )}

              {/* Question cards OR raw streamed text */}
              {!isGenerating && questionBlocks.length > 1 ? (
                <div className="space-y-4">
                  {questionBlocks.map((block, idx) => {
                    const lines = block.trim().split("\n");
                    const titleLine =
                      lines[0]
                        ?.replace(/^#+\s*/, "")
                        .replace(/^\d+[\.\)]\s*/, "")
                        .replace(/^Question\s*\d+[:\.\s]*/i, "")
                        .trim() || `Question ${idx + 1}`;
                    const body = lines.slice(1).join("\n").trim();
                    const isExpanded = expandedQuestions.has(idx);

                    return (
                      <motion.div
                        key={idx}
                        className="glass-card rounded-2xl border border-white/[0.06] overflow-hidden"
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                      >
                        <div className="p-5 sm:p-6">
                          {/* Question title */}
                          <p className="text-white font-medium leading-relaxed mb-3">
                            <span className="text-indigo-400 font-bold mr-2">
                              Q{idx + 1}.
                            </span>
                            {titleLine}
                          </p>

                          {/* Badges */}
                          <div className="flex flex-wrap gap-2 mb-3">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                                typeColorMap[interviewType] ||
                                "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
                              }`}
                            >
                              {interviewType}
                            </span>
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                                difficultyColorMap[difficulty] ||
                                "bg-amber-500/10 text-amber-400 border-amber-500/20"
                              }`}
                            >
                              {difficulty}
                            </span>
                          </div>

                          {/* Expand / collapse answer guide */}
                          {body && (
                            <>
                              <button
                                type="button"
                                onClick={() => toggleQuestion(idx)}
                                className="flex items-center gap-1.5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors font-medium"
                              >
                                {isExpanded ? (
                                  <>
                                    <ChevronUp className="w-4 h-4" />
                                    Hide Answer Guide
                                  </>
                                ) : (
                                  <>
                                    <ChevronDown className="w-4 h-4" />
                                    Show Answer Guide
                                  </>
                                )}
                              </button>

                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-4 pt-4 border-t border-white/[0.06]">
                                      <div className="prose-invert text-sm text-slate-300 leading-relaxed whitespace-pre-wrap [&_strong]:text-white [&_strong]:font-semibold">
                                        {body}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : hasOutput ? (
                /* Fallback: render streamed text nicely */
                <motion.div
                  className="glass-card rounded-2xl border border-white/[0.06] p-5 sm:p-6"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="text-sm text-slate-300 leading-relaxed whitespace-pre-wrap [&>*]:mb-2 font-mono">
                    {rawText.split("\n").map((line, i) => {
                      // Style headings
                      if (line.startsWith("##")) {
                        return (
                          <p
                            key={i}
                            className="text-white font-bold text-base mt-4 mb-2"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {line.replace(/^#+\s*/, "")}
                          </p>
                        );
                      }
                      if (line.startsWith("#")) {
                        return (
                          <p
                            key={i}
                            className="text-white font-bold text-lg mt-5 mb-2"
                            style={{ fontFamily: "var(--font-display)" }}
                          >
                            {line.replace(/^#+\s*/, "")}
                          </p>
                        );
                      }
                      // Style bold text within lines
                      if (line.startsWith("**") || line.startsWith("- **")) {
                        return (
                          <p key={i} className="text-white font-semibold mt-2">
                            {line.replace(/\*\*/g, "")}
                          </p>
                        );
                      }
                      // Bullet points
                      if (line.startsWith("- ") || line.startsWith("* ")) {
                        return (
                          <p key={i} className="pl-4 text-slate-300">
                            <span className="text-indigo-400 mr-2">
                              &#8226;
                            </span>
                            {line.slice(2)}
                          </p>
                        );
                      }
                      // Empty lines
                      if (!line.trim()) {
                        return <br key={i} />;
                      }
                      return (
                        <p key={i} className="text-slate-300">
                          {line}
                        </p>
                      );
                    })}
                    {isGenerating && (
                      <span className="inline-block w-2 h-4 bg-indigo-400 animate-pulse ml-0.5" />
                    )}
                  </div>
                </motion.div>
              ) : null}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
