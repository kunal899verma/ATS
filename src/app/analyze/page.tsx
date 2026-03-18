"use client";

import { useState, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import Navbar from "@/components/ui/Navbar";
import {
  Upload, FileText, X, Loader2, AlertCircle, CheckCircle2,
  Sparkles, ClipboardPaste, Info,
} from "lucide-react";

type InputMode = "file" | "paste";

const ACCEPTED_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_FILE_SIZE = 5 * 1024 * 1024;

export default function AnalyzePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [pastedResume, setPastedResume] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");

  const validateFile = (f: File): string | null => {
    const ext = f.name.toLowerCase();
    const isValidType =
      ACCEPTED_TYPES.includes(f.type) ||
      ext.endsWith(".pdf") ||
      ext.endsWith(".docx") ||
      ext.endsWith(".txt");
    if (!isValidType) return "Please upload a PDF, DOCX, or TXT file.";
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
    { pct: 15, label: "Uploading resume..." },
    { pct: 35, label: "Extracting text..." },
    { pct: 60, label: "Analyzing structure..." },
    { pct: 80, label: "Scoring sections..." },
    { pct: 95, label: "Generating suggestions..." },
  ];

  const handleAnalyze = async () => {
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
    }, 400);

    try {
      const formData = new FormData();
      if (inputMode === "file" && file) {
        formData.append("resume", file);
      } else {
        formData.append("resumeText", pastedResume);
      }
      // No job description — general analysis mode

      const res = await fetch("/api/analyze", { method: "POST", body: formData });
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
      sessionStorage.setItem("atsJobDescription", "");

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

      <div className="relative z-10 max-w-2xl mx-auto px-4 sm:px-6 pt-28 pb-20">

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
                <div
                  className={`upload-zone rounded-xl p-10 text-center transition-all ${isDragging ? "dragging" : ""} ${file ? "has-file" : ""}`}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={() => setIsDragging(false)}
                  onClick={() => !file && fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.docx,.txt"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />

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
                </div>

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
            <div className="w-full animate-fade-in">
              <div className="flex justify-between text-xs text-slate-500 mb-2">
                <span>{progressLabel}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="progress-track">
                <div
                  className="progress-fill"
                  style={{ width: `${progress}%`, background: "linear-gradient(90deg, #00d4ff, #7c3aed)" }}
                />
              </div>
            </div>
          )}

          <button
            onClick={handleAnalyze}
            disabled={!hasResume || isAnalyzing}
            className="w-full btn-primary flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-base disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
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
      </div>
    </main>
  );
}
