"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { track } from "@vercel/analytics";
import Link from "next/link";
import Navbar from "@/components/ui/Navbar";
import {
  Upload, FileText, X, Loader2, AlertCircle, CheckCircle2,
  Sparkles, ClipboardPaste, Info, Lock, Code2, Briefcase, ChevronDown, ChevronUp,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { GitHubAnalysis } from "@/app/api/github/route";

type InputMode = "file" | "paste";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MIN_FILE_SIZE = 1;
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: session } = useSession();

  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedResume, setPastedResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [githubUrl, setGithubUrl] = useState("");
  const [showJD, setShowJD] = useState(false);
  const [showGithub, setShowGithub] = useState(false);
  const [githubData, setGithubData] = useState<GitHubAnalysis | null>(null);
  const [githubLoading, setGithubLoading] = useState(false);
  const [githubError, setGithubError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [showAuthGate, setShowAuthGate] = useState(false);

  // Show gate if free check already used and user is not signed in
  useEffect(() => {
    const alreadyUsed = document.cookie.includes("ats_free_used=1");
    if (alreadyUsed && !session) setShowAuthGate(true);
  }, [session]);

  const validateFile = (f: File): string | null => {
    const ext = f.name.toLowerCase();
    const isValidType =
      ACCEPTED_TYPES.includes(f.type) ||
      ext.endsWith(".pdf") ||
      ext.endsWith(".docx") ||
      ext.endsWith(".txt");
    if (!isValidType) return "Please upload a PDF, DOCX, or TXT file.";
    if (f.size < MIN_FILE_SIZE) return "That file is empty. Please choose a valid resume file.";
    if (f.size > MAX_FILE_SIZE) return "File size must be under 5MB.";
    return null;
  };

  const handleFile = (f: File) => {
    const err = validateFile(f);
    if (err) { setError(err); return; }
    setError(null);
    setFile(f);
    track("file_uploaded", { file_type: (f.type || f.name.split(".").pop()) ?? "unknown" });
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const PROGRESS_STEPS = [
    { pct: 8,  label: "Reading your resume..." },
    { pct: 18, label: "Extracting contact information..." },
    { pct: 28, label: "Parsing work experience..." },
    { pct: 38, label: "Identifying your skills..." },
    { pct: 48, label: "Analyzing keyword density..." },
    { pct: 58, label: "Checking ATS compatibility..." },
    { pct: 68, label: "Scoring bullet point quality..." },
    { pct: 76, label: "Evaluating formatting..." },
    { pct: 84, label: "Running recruiter readability check..." },
    { pct: 91, label: "Generating improvement suggestions..." },
    { pct: 96, label: "Finalizing your score..." },
  ];

  const handleAnalyze = async () => {
    // Gate: if free check already used and not signed in, show login prompt
    if (document.cookie.includes("ats_free_used=1") && !session) {
      setShowAuthGate(true);
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setProgress(0);
    setProgressLabel("Starting analysis...");
    track("resume_analysis_started", { input_mode: inputMode });

    let stepIdx = 0;
    const progressInterval = setInterval(() => {
      if (stepIdx < PROGRESS_STEPS.length) {
        setProgress(PROGRESS_STEPS[stepIdx].pct);
        setProgressLabel(PROGRESS_STEPS[stepIdx].label);
        stepIdx++;
      }
    }, 350);

    try {
      const formData = new FormData();
      if (inputMode === "file" && file) {
        formData.append("resume", file);
      } else {
        formData.append("resumeText", pastedResume);
      }
      if (jobDescription.trim().length >= 50) {
        formData.append("jobDescription", jobDescription.trim());
      }

      // Run ATS analysis + GitHub analysis in parallel
      const githubPromise = githubUrl.trim()
        ? fetch(`/api/github?url=${encodeURIComponent(githubUrl.trim())}`)
            .then((r) => r.json())
            .then((data: GitHubAnalysis & { error?: string }) => {
              if (data.error) return null;
              return data as GitHubAnalysis;
            })
            .catch(() => null)
        : Promise.resolve(null);

      const [res, ghData] = await Promise.all([
        fetch("/api/analyze", { method: "POST", body: formData }),
        githubPromise,
      ]);
      const data = await res.json();

      clearInterval(progressInterval);

      if (!res.ok || !data.success) {
        track("resume_analysis_error", { error: data.error ?? "unknown" });
        setError(data.error || "Analysis failed. Please try again.");
        setIsAnalyzing(false);
        setProgress(0);
        return;
      }

      setProgress(100);
      setProgressLabel("Complete!");
      track("resume_analysis_completed", {
        score: data.result.overallScore,
        grade: data.result.grade,
        input_mode: inputMode,
      });

      sessionStorage.setItem("atsResult", JSON.stringify(data.result));
      sessionStorage.setItem("atsFileName", inputMode === "file" ? (file?.name ?? "resume") : "pasted-resume");
      sessionStorage.setItem("atsResumeText", data.resumeText ?? (inputMode === "paste" ? pastedResume : ""));
      sessionStorage.setItem("atsJobDescription", jobDescription);
      if (ghData) {
        sessionStorage.setItem("atsGithubData", JSON.stringify(ghData));
      } else {
        sessionStorage.removeItem("atsGithubData");
      }

      setTimeout(() => router.push("/results"), 300);
    } catch {
      clearInterval(progressInterval);
      setError("Network error. Please check your connection and try again.");
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const hasResume = inputMode === "file" ? !!file : pastedResume.trim().length >= 80;
  const fileIcon = file?.name.endsWith(".pdf") ? "📄" : file?.name.endsWith(".docx") ? "📝" : "📃";

  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />

      <div className="fixed inset-0 bg-grid opacity-25 pointer-events-none" />
      <div className="fixed top-1/3 left-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/3 right-1/4 w-80 h-80 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >

        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-cyan-500/25 bg-cyan-500/5 text-cyan-400 text-xs font-medium mb-5">
            <Sparkles className="w-3 h-3" />
            Free · Instant · No Account Required
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">
            Check Your ATS Score
          </h1>
          <p className="text-slate-400 text-[15px]">
            Upload your resume and get a full ATS compatibility analysis in seconds.
          </p>
        </div>

        {/* Resume Input Card */}
        <div className="glass rounded-2xl border border-white/8 overflow-hidden mb-5">

          {/* Card header with mode switcher */}
          <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/5">
            <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
              <FileText className="w-3 h-3 text-cyan-400" />
            </div>
            <h2 className="text-white font-semibold">Your Resume</h2>

            {/* Mode switcher */}
            <div className="ml-auto flex items-center gap-1 p-0.5 rounded-lg bg-white/5 border border-white/5">
              {(["file", "paste"] as InputMode[]).map((mode) => (
                <button
                  key={mode}
                  onClick={() => { setInputMode(mode); setError(null); }}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${
                    inputMode === mode
                      ? "bg-white/10 text-white"
                      : "text-slate-500 hover:text-slate-300"
                  }`}
                >
                  {mode === "file" ? (
                    <span className="flex items-center gap-1"><Upload className="w-3 h-3" /> Upload</span>
                  ) : (
                    <span className="flex items-center gap-1"><ClipboardPaste className="w-3 h-3" /> Paste Text</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5">
            {inputMode === "file" ? (
              <div className="space-y-4">
                {/* Drop zone */}
                <motion.div
                  className={`relative upload-zone rounded-xl p-10 text-center transition-all ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => !file && fileInputRef.current?.click()}
                  whileHover={{ scale: 1.01 }}
                  animate={{ boxShadow: isDragging ? "0 0 40px rgba(6,182,212,0.25)" : "none" }}
                  transition={{ duration: 0.2 }}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />

                  <AnimatePresence>
                    {isDragging && (
                      <motion.div
                        className="absolute inset-0 rounded-2xl border-2 border-cyan-400/60 pointer-events-none"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                      />
                    )}
                  </AnimatePresence>

                  {file ? (
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-emerald-500/15 border border-emerald-500/25 flex items-center justify-center text-3xl">
                        {fileIcon}
                      </div>
                      <div>
                        <p className="text-white font-medium">{file.name}</p>
                        <p className="text-slate-500 text-sm mt-0.5">{(file.size / 1024).toFixed(0)} KB · Ready to analyze</p>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="flex items-center gap-1 text-slate-500 hover:text-red-400 text-xs transition-colors"
                      >
                        <X className="w-3 h-3" /> Remove file
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/8 flex items-center justify-center">
                        <Upload className="w-7 h-7 text-cyan-400" />
                      </div>
                      <div>
                        <p className="text-white font-semibold text-lg">Drop your resume here</p>
                        <p className="text-slate-500 text-sm mt-1">or click to browse your files</p>
                      </div>
                      <div className="flex gap-2">
                        {["PDF", "DOCX", "TXT"].map((ext) => (
                          <span key={ext} className="px-3 py-1 rounded-lg text-xs bg-white/5 text-slate-400 border border-white/8 font-medium">{ext}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </motion.div>

                {/* Parsing tips */}
                <div className="rounded-xl bg-white/2 border border-white/5 p-4">
                  <p className="text-slate-500 text-[11px] font-semibold uppercase tracking-wider mb-2.5">For best results</p>
                  <div className="space-y-1.5">
                    {[
                      "Use a text-based PDF (not a scanned image)",
                      "Avoid tables, columns, and text boxes",
                      "Standard fonts work best (Arial, Calibri, Times)",
                    ].map((tip) => (
                      <div key={tip} className="flex items-start gap-2 text-xs text-slate-500">
                        <div className="w-1 h-1 rounded-full bg-cyan-500/60 mt-1.5 flex-shrink-0" />
                        {tip}
                      </div>
                    ))}
                  </div>
                  <p className="text-slate-600 text-[11px] mt-2.5 pt-2 border-t border-white/5">
                    Parser not working? Switch to &quot;Paste Text&quot; mode above.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="relative">
                  <textarea
                    value={pastedResume}
                    onChange={(e) => setPastedResume(e.target.value)}
                    placeholder="Paste your full resume text here...

John Doe
john@email.com | LinkedIn: linkedin.com/in/johndoe

EXPERIENCE
Senior Software Engineer at Acme Corp (2021–Present)
• Led development of..."
                    className="w-full h-72 bg-white/3 border border-white/8 rounded-xl p-4 text-slate-300 text-sm placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500/40 focus:bg-cyan-500/3 transition-all leading-relaxed font-mono"
                  />
                  <div className="absolute bottom-3 right-3 text-slate-600 text-[11px]">
                    {pastedResume.length} chars {pastedResume.length >= 80
                      ? <span className="text-emerald-500">✓</span>
                      : <span className="text-amber-500">(min 80)</span>
                    }
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 rounded-lg bg-cyan-500/5 border border-cyan-500/10 text-xs text-slate-400">
                  <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0 mt-0.5" />
                  Copy everything from your resume — contact info, experience, skills, education. The more text, the more accurate the analysis.
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Job Description (optional) ────────────────────────────────────── */}
        <div className="glass rounded-2xl border border-white/8 overflow-hidden mb-3">
          <button
            type="button"
            onClick={() => setShowJD((v) => !v)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/2 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
              <Briefcase className="w-3 h-3 text-amber-400" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-white font-semibold text-sm">Job Description</span>
              <span className="ml-2 text-slate-500 text-xs">Optional · improves keyword matching</span>
            </div>
            {jobDescription.trim().length >= 50 && (
              <span className="text-emerald-400 text-[11px] mr-2">✓ Active</span>
            )}
            {showJD ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {showJD && (
            <div className="px-5 pb-4">
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste the job description here. We'll check your resume against the required keywords and skills..."
                className="w-full h-28 bg-white/3 border border-white/8 rounded-xl p-3 text-slate-300 text-xs placeholder-slate-600 resize-none focus:outline-none focus:border-amber-500/40 leading-relaxed"
              />
              <p className="text-[11px] mt-1.5">
                {jobDescription.length < 50
                  ? <span className="text-slate-600">Min 50 characters to activate · {50 - jobDescription.length} more</span>
                  : <span className="text-emerald-500">✓ JD active — targeted keyword analysis enabled</span>
                }
              </p>
            </div>
          )}
        </div>

        {/* ── GitHub Profile (optional) ─────────────────────────────────────── */}
        <div className="glass rounded-2xl border border-white/8 overflow-hidden mb-5">
          <button
            type="button"
            onClick={() => setShowGithub((v) => !v)}
            className="w-full flex items-center gap-3 px-5 py-4 hover:bg-white/2 transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
              <Code2 className="w-3 h-3 text-emerald-400" />
            </div>
            <div className="flex-1 text-left">
              <span className="text-white font-semibold text-sm">GitHub Profile</span>
              <span className="ml-2 text-slate-500 text-xs">Optional · adds coding activity insights</span>
            </div>
            {githubData && (
              <span className="text-emerald-400 text-[11px] mr-2">✓ Score {githubData.score}/100</span>
            )}
            {githubLoading && <Loader2 className="w-3.5 h-3.5 text-slate-500 animate-spin mr-2" />}
            {showGithub ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
          </button>
          {showGithub && (
            <div className="px-5 pb-4 space-y-3">
              <div className="flex gap-2">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => {
                    setGithubUrl(e.target.value);
                    setGithubData(null);
                    setGithubError(null);
                  }}
                  placeholder="https://github.com/yourusername"
                  className="flex-1 bg-white/3 border border-white/8 rounded-xl px-3 py-2.5 text-slate-300 text-sm placeholder-slate-600 focus:outline-none focus:border-emerald-500/40"
                />
                <button
                  type="button"
                  disabled={!githubUrl.trim() || githubLoading}
                  onClick={async () => {
                    if (!githubUrl.trim()) return;
                    setGithubLoading(true);
                    setGithubError(null);
                    setGithubData(null);
                    try {
                      const r = await fetch(`/api/github?url=${encodeURIComponent(githubUrl.trim())}`);
                      const d = await r.json();
                      if (d.error) { setGithubError(d.error); }
                      else { setGithubData(d as GitHubAnalysis); }
                    } catch {
                      setGithubError("Failed to fetch GitHub profile.");
                    } finally {
                      setGithubLoading(false);
                    }
                  }}
                  className="px-4 py-2.5 rounded-xl bg-emerald-500/15 border border-emerald-500/25 text-emerald-400 text-sm font-medium hover:bg-emerald-500/25 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {githubLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify"}
                </button>
              </div>
              {githubError && (
                <p className="text-red-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" /> {githubError}
                </p>
              )}
              {githubData && (
                <div className="rounded-xl bg-emerald-500/5 border border-emerald-500/15 p-3 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-300 font-semibold">@{githubData.username}</span>
                    <span className="text-emerald-400 font-bold">GitHub Score: {githubData.score}/100</span>
                  </div>
                  <div className="flex flex-wrap gap-3 text-slate-400">
                    <span>{githubData.stats.originalRepos} repos</span>
                    <span>{githubData.stats.followers} followers</span>
                    <span>{githubData.stats.totalStars} ★</span>
                    {githubData.stats.languages.slice(0, 4).map((l) => (
                      <span key={l} className="px-1.5 py-0.5 rounded bg-white/5 text-slate-300 border border-white/8">{l}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mb-5 flex items-start gap-3 p-4 rounded-xl bg-red-500/8 border border-red-500/20 text-red-400 animate-slide-up">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        {/* CTA */}
        <div className="flex flex-col items-center gap-4">
          {isAnalyzing && (
            <div className="w-full animate-fade-in flex flex-col items-center">
              {/* Morphing spinner rings */}
              <div className="relative w-20 h-20 mb-6">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-cyan-500/20"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border-2 border-violet-500/30 border-t-violet-400"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="absolute inset-4 rounded-full border-2 border-cyan-500/40 border-t-cyan-400"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-violet-500"
                    animate={{ scale: [1, 1.3, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
              </div>

              {/* Animated label */}
              <AnimatePresence mode="wait">
                <motion.p
                  key={progressLabel}
                  className="text-white font-medium text-base mb-2"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.3 }}
                >
                  {progressLabel}
                </motion.p>
              </AnimatePresence>

              {/* Progress bar */}
              <div className="w-56 h-1.5 bg-white/5 rounded-full overflow-hidden mb-4">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-400 to-violet-500 rounded-full"
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                />
              </div>

              <p className="text-slate-500 text-xs">{progress}% complete</p>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!hasResume || isAnalyzing}
            className={`w-full btn-primary flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none ${hasResume && !isAnalyzing ? "animate-glow-breathe" : ""}`}
          >
            {isAnalyzing ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Analyzing...</>
            ) : (
              <><Sparkles className="w-5 h-5" /> Get My ATS Score</>
            )}
          </button>

          {!hasResume && !isAnalyzing && (
            <p className="text-slate-600 text-sm text-center">
              {inputMode === "file"
                ? "Upload your resume file to continue"
                : "Paste your resume text (min 80 characters)"}
            </p>
          )}

          {hasResume && !isAnalyzing && (
            <div className="flex items-center gap-2 text-slate-500 text-xs">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              Ready · Full ATS analysis in ~5 seconds
            </div>
          )}
        </div>
      </motion.div>
      {/* Auth gate modal */}
      {showAuthGate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-sm glass rounded-2xl border border-white/8 p-8 text-center shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-violet-500/15 border border-violet-500/25 flex items-center justify-center mx-auto mb-5">
              <Lock className="w-6 h-6 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Free check used
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-6">
              You&apos;ve already used your free ATS check. Sign in for free to get unlimited checks and track your resume progress.
            </p>
            <Link
              href={`/login?callbackUrl=${encodeURIComponent("/analyze")}`}
              className="flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity mb-3"
            >
              Sign in — it&apos;s free
            </Link>
            <button
              onClick={() => setShowAuthGate(false)}
              className="text-slate-500 hover:text-slate-300 text-sm transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
