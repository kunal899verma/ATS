"use client";

import { useState, useCallback, useRef } from "react";
import Navbar from "@/components/ui/Navbar";
import type { ATSResult } from "@/types";
import { ROLE_LABELS, ROLE_COLORS } from "@/types";
import {
  Upload, X, Loader2, Users, TrendingUp, BarChart3,
  FileText, Download, Eye, ChevronUp, ChevronDown,
  CheckCircle2, AlertCircle, Zap, Target,
} from "lucide-react";

interface CandidateState {
  id: string;
  file: File;
  name: string;
  status: "pending" | "analyzing" | "done" | "error";
  result?: ATSResult;
  resumeText?: string;
  error?: string;
}

function extractName(text: string, fileName: string): string {
  const lines = text.split("\n").slice(0, 8);
  for (const line of lines) {
    const t = line.trim();
    if (!t) continue;
    const words = t.split(/\s+/);
    if (
      words.length >= 2 && words.length <= 4 &&
      words.every((w) => /^[A-Za-z.'-]+$/.test(w) && w.length >= 2) &&
      words.some((w) => /^[A-Z]/.test(w))
    ) {
      return t;
    }
  }
  return fileName.replace(/\.(pdf|docx|txt)$/i, "").replace(/[-_]/g, " ");
}

function getScoreColor(score: number) {
  if (score >= 85) return "text-cyan-400";
  if (score >= 70) return "text-emerald-400";
  if (score >= 55) return "text-amber-400";
  if (score >= 40) return "text-orange-400";
  return "text-red-400";
}

function getGradeBg(grade: string) {
  if (grade === "A+" || grade === "A") return "bg-cyan-500/15 text-cyan-400 border-cyan-500/25";
  if (grade === "B+" || grade === "B") return "bg-emerald-500/15 text-emerald-400 border-emerald-500/25";
  if (grade === "C+" || grade === "C") return "bg-amber-500/15 text-amber-400 border-amber-500/25";
  return "bg-red-500/15 text-red-400 border-red-500/25";
}

const ACCEPTED = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
];
const MAX_FILES = 20;

export default function RecruiterPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [candidates, setCandidates] = useState<CandidateState[]>([]);
  const [jd, setJD] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sortBy, setSortBy] = useState<"score" | "name">("score");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [isDragging, setIsDragging] = useState(false);

  const addFiles = useCallback(
    (newFiles: File[]) => {
      const valid = newFiles
        .filter((f) => ACCEPTED.includes(f.type) || /\.(pdf|docx|txt)$/i.test(f.name))
        .slice(0, MAX_FILES - candidates.length);
      setCandidates((prev) => [
        ...prev,
        ...valid.map((f) => ({
          id: `${f.name}-${f.size}-${Math.random()}`,
          file: f,
          name: f.name.replace(/\.(pdf|docx|txt)$/i, "").replace(/[-_]/g, " "),
          status: "pending" as const,
        })),
      ]);
    },
    [candidates.length]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      addFiles(Array.from(e.dataTransfer.files));
    },
    [addFiles]
  );

  const removeCandidate = (id: string) => {
    if (isAnalyzing) return;
    setCandidates((prev) => prev.filter((c) => c.id !== id));
  };

  const handleAnalyzeAll = async () => {
    const pending = candidates.filter((c) => c.status === "pending" || c.status === "error");
    if (pending.length === 0) return;
    setIsAnalyzing(true);

    for (const candidate of pending) {
      setCandidates((prev) =>
        prev.map((c) => (c.id === candidate.id ? { ...c, status: "analyzing" } : c))
      );

      try {
        const formData = new FormData();
        formData.append("resume", candidate.file);
        if (jd.trim().length >= 50) formData.append("jobDescription", jd.trim());

        const res = await fetch("/api/analyze", { method: "POST", body: formData });
        const data = await res.json();

        if (!res.ok || !data.success) {
          setCandidates((prev) =>
            prev.map((c) =>
              c.id === candidate.id ? { ...c, status: "error", error: data.error ?? "Analysis failed" } : c
            )
          );
          continue;
        }

        const name = extractName(data.resumeText ?? "", candidate.file.name);
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidate.id
              ? { ...c, status: "done", name, result: data.result, resumeText: data.resumeText }
              : c
          )
        );
      } catch {
        setCandidates((prev) =>
          prev.map((c) =>
            c.id === candidate.id ? { ...c, status: "error", error: "Network error" } : c
          )
        );
      }
    }

    setIsAnalyzing(false);
  };

  const handleViewReport = (c: CandidateState) => {
    if (!c.result) return;
    sessionStorage.setItem("atsResult", JSON.stringify(c.result));
    sessionStorage.setItem("atsFileName", c.name);
    sessionStorage.setItem("atsResumeText", c.resumeText ?? "");
    sessionStorage.setItem("atsJobDescription", jd);
    window.open("/results", "_blank");
  };

  const exportCSV = () => {
    const doneList = candidates.filter((c) => c.status === "done" && c.result);
    const sorted = [...doneList].sort((a, b) => b.result!.overallScore - a.result!.overallScore);
    const rows = [
      ["Rank", "Name", "Role", "Score", "Grade", "Match %", "Missing Keywords"],
      ...sorted.map((c, i) => [
        i + 1,
        c.name,
        ROLE_LABELS[c.result!.detectedRole],
        c.result!.overallScore,
        c.result!.grade,
        c.result!.keywordAnalysis.overallMatchRate + "%",
        c.result!.keywordAnalysis.topMissingKeywords.slice(0, 3).join("; "),
      ]),
    ];
    const csv = rows.map((r) => r.map((v) => `"${v}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "candidate-ranking.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const done = candidates.filter((c) => c.status === "done" && c.result);
  const analyzing = candidates.find((c) => c.status === "analyzing");
  const pendingCount = candidates.filter((c) => c.status === "pending").length;
  const errorCount = candidates.filter((c) => c.status === "error").length;

  const sortedDone = [...done].sort((a, b) => {
    const mul = sortDir === "desc" ? -1 : 1;
    if (sortBy === "score") return mul * (a.result!.overallScore - b.result!.overallScore);
    return mul * a.name.localeCompare(b.name);
  });

  const avgScore =
    done.length > 0
      ? Math.round(done.reduce((s, c) => s + c.result!.overallScore, 0) / done.length)
      : 0;
  const topCandidate =
    done.length > 0
      ? done.reduce((top, c) => (c.result!.overallScore > top.result!.overallScore ? c : top))
      : null;

  return (
    <main className="min-h-screen bg-[#020817]">
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">

        {/* Header */}
        <div className="mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/5 text-violet-400 text-xs font-medium mb-5">
            <Users className="w-3 h-3" />
            Recruiter Dashboard · Batch Analysis
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-3">Rank candidates in minutes</h1>
          <p className="text-slate-400 text-[15px]">
            Upload up to {MAX_FILES} resumes, optionally add a job description, and get a ranked leaderboard instantly.
          </p>
        </div>

        {/* Upload + JD row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">

          {/* Upload zone */}
          <div className="lg:col-span-2 glass rounded-2xl border border-white/8 overflow-hidden">
            <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/5">
              <div className="w-6 h-6 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                <FileText className="w-3 h-3 text-violet-400" />
              </div>
              <h2 className="text-white font-semibold">Resume Files</h2>
              <span className="ml-auto text-slate-500 text-xs">{candidates.length} / {MAX_FILES}</span>
            </div>
            <div className="p-5">
              <div
                className={`upload-zone rounded-xl p-8 text-center cursor-pointer mb-4 ${isDragging ? "dragging" : ""}`}
                onDrop={handleDrop}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt"
                  multiple
                  className="hidden"
                  onChange={(e) => addFiles(Array.from(e.target.files ?? []))}
                />
                <Upload className="w-8 h-8 text-violet-400 mx-auto mb-3" />
                <p className="text-white font-medium mb-1">Drop multiple resumes here</p>
                <p className="text-slate-500 text-sm">or click to browse · PDF, DOCX, TXT · up to {MAX_FILES} files</p>
              </div>

              {candidates.length > 0 && (
                <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
                  {candidates.map((c) => (
                    <div
                      key={c.id}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg text-xs border transition-colors ${
                        c.status === "done"      ? "bg-emerald-500/5 border-emerald-500/15" :
                        c.status === "analyzing" ? "bg-cyan-500/5 border-cyan-500/15" :
                        c.status === "error"     ? "bg-red-500/5 border-red-500/15" :
                                                   "bg-white/3 border-white/5"
                      }`}
                    >
                      <FileText className={`w-3.5 h-3.5 flex-shrink-0 ${
                        c.status === "done"      ? "text-emerald-400" :
                        c.status === "analyzing" ? "text-cyan-400" :
                        c.status === "error"     ? "text-red-400" : "text-slate-500"
                      }`} />
                      <span className="text-slate-300 truncate flex-1">{c.file.name}</span>
                      {c.status === "done" && c.result && (
                        <span className={`font-bold flex-shrink-0 ${getScoreColor(c.result.overallScore)}`}>
                          {c.result.overallScore}
                        </span>
                      )}
                      {c.status === "analyzing" && (
                        <Loader2 className="w-3 h-3 text-cyan-400 animate-spin flex-shrink-0" />
                      )}
                      {c.status === "error" && (
                        <span className="text-red-400 text-[11px] truncate max-w-[120px]">{c.error}</span>
                      )}
                      {c.status !== "analyzing" && (
                        <button
                          onClick={() => removeCandidate(c.id)}
                          className="text-slate-600 hover:text-red-400 transition-colors flex-shrink-0 ml-1"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* JD + Analyze button */}
          <div className="flex flex-col gap-4">
            <div className="glass rounded-2xl border border-white/8 overflow-hidden flex-1">
              <div className="flex items-center gap-3 px-5 pt-5 pb-4 border-b border-white/5">
                <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center flex-shrink-0">
                  <Target className="w-3 h-3 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-sm">Job Description</h2>
                  <p className="text-slate-500 text-[11px]">Optional · improves keyword ranking</p>
                </div>
              </div>
              <div className="p-4">
                <textarea
                  value={jd}
                  onChange={(e) => setJD(e.target.value)}
                  placeholder="Paste the job description here for keyword-matched ranking..."
                  className="w-full h-32 bg-white/3 border border-white/8 rounded-xl p-3 text-slate-300 text-xs placeholder-slate-600 resize-none focus:outline-none focus:border-cyan-500/40 leading-relaxed"
                />
                <p className="text-[11px] mt-1.5">
                  {jd.length < 50 ? (
                    <span className="text-amber-500/70">Min 50 chars to activate JD matching</span>
                  ) : (
                    <span className="text-emerald-500">✓ JD active — keyword matching on</span>
                  )}
                </p>
              </div>
            </div>

            <button
              onClick={handleAnalyzeAll}
              disabled={isAnalyzing || pendingCount + errorCount === 0}
              className="btn-primary flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-sm disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing {analyzing?.name?.split(" ")[0] ?? ""}...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Analyze{" "}
                  {pendingCount + errorCount > 0
                    ? `${pendingCount + errorCount} Candidate${pendingCount + errorCount !== 1 ? "s" : ""}`
                    : "All"}
                </>
              )}
            </button>
          </div>
        </div>

        {/* Empty state */}
        {candidates.length === 0 && (
          <div className="glass rounded-2xl border border-white/8 p-16 text-center">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-4" />
            <p className="text-slate-400 font-medium mb-1">No resumes uploaded yet</p>
            <p className="text-slate-600 text-sm">
              Upload up to {MAX_FILES} resumes above to start ranking candidates
            </p>
          </div>
        )}

        {/* Waiting to analyze */}
        {candidates.length > 0 && done.length === 0 && !isAnalyzing && (
          <div className="glass rounded-2xl border border-cyan-500/15 bg-cyan-500/3 p-10 text-center">
            <Zap className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
            <p className="text-white font-semibold mb-1">
              {candidates.length} resume{candidates.length !== 1 ? "s" : ""} ready
            </p>
            <p className="text-slate-400 text-sm">Click &quot;Analyze Candidates&quot; to start ranking</p>
          </div>
        )}

        {/* Results section */}
        {done.length > 0 && (
          <>
            {/* Summary stats */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
              {[
                { label: "Ranked", value: done.length, icon: Users, color: "text-violet-400" },
                {
                  label: "Avg Score",
                  value: avgScore,
                  icon: BarChart3,
                  color: avgScore >= 70 ? "text-emerald-400" : avgScore >= 50 ? "text-amber-400" : "text-red-400",
                },
                { label: "Top Score", value: topCandidate?.result?.overallScore ?? "—", icon: TrendingUp, color: "text-cyan-400" },
                { label: "Top Candidate", value: topCandidate?.name?.split(" ")[0] ?? "—", icon: CheckCircle2, color: "text-emerald-400" },
              ].map((stat) => {
                const Icon = stat.icon;
                return (
                  <div key={stat.label} className="glass rounded-2xl p-4 border border-white/8">
                    <div className="flex items-center gap-2 mb-2">
                      <Icon className={`w-3.5 h-3.5 ${stat.color}`} />
                      <span className="text-slate-500 text-[11px]">{stat.label}</span>
                    </div>
                    <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
                  </div>
                );
              })}
            </div>

            {/* Rankings table */}
            <div className="glass rounded-2xl border border-white/8 overflow-hidden">
              {/* Table controls */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
                <h2 className="text-white font-semibold flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-violet-400" />
                  Candidate Ranking
                  <span className="text-slate-600 text-xs font-normal">({sortedDone.length})</span>
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-white/5 border border-white/5">
                    {(["score", "name"] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          if (sortBy === s) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
                          else { setSortBy(s); setSortDir(s === "score" ? "desc" : "asc"); }
                        }}
                        className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1 ${
                          sortBy === s ? "bg-white/10 text-white" : "text-slate-500 hover:text-slate-300"
                        }`}
                      >
                        {s === "score" ? "Score" : "Name"}
                        {sortBy === s &&
                          (sortDir === "desc" ? <ChevronDown className="w-3 h-3" /> : <ChevronUp className="w-3 h-3" />)}
                      </button>
                    ))}
                  </div>
                  <button onClick={exportCSV} className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs">
                    <Download className="w-3.5 h-3.5" /> CSV
                  </button>
                </div>
              </div>

              {/* Rows */}
              <div className="divide-y divide-white/4">
                {sortedDone.map((c, i) => {
                  const r = c.result!;
                  const rc = ROLE_COLORS[r.detectedRole];
                  return (
                    <div
                      key={c.id}
                      className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 px-5 py-4 hover:bg-white/2 transition-colors"
                    >
                      {/* Rank */}
                      <div
                        className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold border ${
                          i === 0 ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                          i === 1 ? "bg-slate-400/15 text-slate-300 border-slate-400/20" :
                          i === 2 ? "bg-orange-700/15 text-orange-500 border-orange-700/25" :
                                    "bg-white/5 text-slate-500 border-white/8"
                        }`}
                      >
                        {i + 1}
                      </div>

                      {/* Name + role badge */}
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm truncate">{c.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium border ${rc.bg} ${rc.text} ${rc.border}`}>
                            {ROLE_LABELS[r.detectedRole]}
                          </span>
                          <span className="text-slate-600 text-[11px] truncate">{c.file.name}</span>
                        </div>
                      </div>

                      {/* Score */}
                      <div className="flex-shrink-0 text-center w-14">
                        <div className={`text-2xl font-bold leading-none ${getScoreColor(r.overallScore)}`}>
                          {r.overallScore}
                        </div>
                        <div className="text-slate-600 text-[10px]">/100</div>
                      </div>

                      {/* Grade */}
                      <div className="flex-shrink-0">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-bold border ${getGradeBg(r.grade)}`}>
                          {r.grade}
                        </span>
                      </div>

                      {/* Match % */}
                      <div className="flex-shrink-0 text-center w-14">
                        <div className="text-sm font-semibold text-slate-300">
                          {r.keywordAnalysis.overallMatchRate}%
                        </div>
                        <div className="text-slate-600 text-[10px]">match</div>
                      </div>

                      {/* Gaps */}
                      <div className="flex-1 flex flex-wrap gap-1 min-w-0 max-w-[200px]">
                        {r.keywordAnalysis.topMissingKeywords.slice(0, 3).map((kw) => (
                          <span
                            key={kw}
                            className="px-1.5 py-0.5 rounded text-[10px] bg-red-500/8 text-red-400 border border-red-500/15 truncate max-w-[80px]"
                          >
                            {kw}
                          </span>
                        ))}
                        {r.keywordAnalysis.topMissingKeywords.length === 0 && (
                          <span className="text-emerald-400 text-[11px] flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> No gaps
                          </span>
                        )}
                      </div>

                      {/* View report */}
                      <button
                        onClick={() => handleViewReport(c)}
                        className="btn-ghost flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs flex-shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" /> Report
                      </button>
                    </div>
                  );
                })}
              </div>

              {errorCount > 0 && (
                <div className="px-5 py-3 border-t border-white/5 bg-red-500/3 flex items-center gap-2 text-red-400 text-xs">
                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                  {errorCount} file{errorCount !== 1 ? "s" : ""} failed to parse. Click &quot;Analyze Candidates&quot; to retry.
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
