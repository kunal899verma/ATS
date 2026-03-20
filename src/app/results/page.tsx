"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { motion, AnimatePresence } from "framer-motion";
import gsap from "gsap";
import ScoreConfetti from "@/components/ui/ScoreConfetti";
import { track } from "@vercel/analytics";
import Navbar from "@/components/ui/Navbar";
import ScoreRing from "@/components/ui/ScoreRing";
import ProgressBar from "@/components/ui/ProgressBar";
import { useHistory } from "@/hooks/useHistory";
import type { ATSResult, Suggestion, SectionScore, AIResponse } from "@/types";
import type { GitHubAnalysis } from "@/app/api/github/route";
import { EXPERIENCE_LABELS, EXPERIENCE_COLORS } from "@/lib/career-intelligence";
import {
  ArrowLeft, CheckCircle2, XCircle, AlertTriangle, TrendingUp,
  Zap, RefreshCw, ChevronDown, ChevronUp, Loader2, Info,
  Sparkles, AlertCircle, Users, Share2, Printer, Clock,
  BarChart3, History, X, Wand2, Copy, CheckCheck,
  BookOpen, Target, Star, Lightbulb, ArrowRight, Trophy, Code2, ExternalLink,
} from "lucide-react";

// Dynamically import recharts charts (avoids hydration mismatch)
const ScoreRadarChart = dynamic(
  () => import("@/components/results/ScoreRadarChart"),
  { ssr: false, loading: () => <div className="h-[260px] flex items-center justify-center"><Loader2 className="w-5 h-5 text-slate-600 animate-spin" /></div> }
);
const KeywordBarChart = dynamic(
  () => import("@/components/results/KeywordBarChart"),
  { ssr: false, loading: () => <div className="h-[280px] flex items-center justify-center"><Loader2 className="w-5 h-5 text-slate-600 animate-spin" /></div> }
);

// ─── Config maps ─────────────────────────────────────────────────────────────

const PRIORITY_CONFIG = {
  critical: { color: "text-red-400", bg: "bg-red-500/8", border: "border-red-500/20", dot: "bg-red-500", label: "Critical" },
  high:     { color: "text-orange-400", bg: "bg-orange-500/8", border: "border-orange-500/20", dot: "bg-orange-500", label: "High" },
  medium:   { color: "text-amber-400", bg: "bg-amber-500/8", border: "border-amber-500/20", dot: "bg-amber-500", label: "Medium" },
  low:      { color: "text-slate-400", bg: "bg-white/3", border: "border-white/8", dot: "bg-slate-500", label: "Low" },
};

const STATUS_CONFIG = {
  excellent: { label: "Excellent", color: "text-cyan-400",    icon: CheckCircle2 },
  good:      { label: "Good",      color: "text-emerald-400", icon: CheckCircle2 },
  needs_work:{ label: "Needs Work",color: "text-amber-400",   icon: AlertTriangle },
  missing:   { label: "Missing",   color: "text-red-400",     icon: XCircle },
};

const EFFORT_LABEL = { easy: "Quick fix", medium: "30 min", hard: "1–2 hrs" };
const EFFORT_COLOR = { easy: "text-emerald-400", medium: "text-amber-400", hard: "text-orange-400" };

function getScoreContext(score: number) {
  if (score >= 85) return { headline: "Top 10% — Outstanding", subtext: "Your resume is highly optimized. Focus on tailoring the summary and you're ready to apply.", color: "text-cyan-400", level: "🏆" };
  if (score >= 72) return { headline: "Top 25% — Strong", subtext: "A few targeted fixes will push you into the top tier. Check the critical suggestions first.", color: "text-emerald-400", level: "🎯" };
  if (score >= 58) return { headline: "Average — Room to Grow", subtext: "You're competitive but not standing out. Missing keywords and formatting issues are holding you back.", color: "text-amber-400", level: "📈" };
  if (score >= 42) return { headline: "Below Average — Needs Work", subtext: "Most ATS systems are filtering this out. Follow the critical suggestions immediately.", color: "text-orange-400", level: "⚠️" };
  return { headline: "Critical Issues — Act Now", subtext: "This resume likely isn't reaching recruiters. Significant improvements are needed.", color: "text-red-400", level: "🚨" };
}

function formatDate(ts: number) {
  return new Date(ts).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  const printRef = useRef<HTMLDivElement>(null);
  const { history, saveEntry, clearHistory } = useHistory();

  const [result, setResult] = useState<ATSResult | null>(null);
  const [fileName, setFileName] = useState("");
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "keywords" | "recruiter" | "suggestions" | "ai" | "career">("overview");
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [showAllKeywords, setShowAllKeywords] = useState(false);
  const [shareState, setShareState] = useState<"idle" | "copied">("idle");
  const [showHistory, setShowHistory] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);
  const [aiResult, setAiResult] = useState<AIResponse | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [githubData, setGithubData] = useState<GitHubAnalysis | null>(null);
  const [scoreRevealed, setScoreRevealed] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    const ghRaw = sessionStorage.getItem("atsGithubData");
    if (ghRaw) { try { setGithubData(JSON.parse(ghRaw)); } catch { /* ignore */ } }
  }, []);

  useEffect(() => {
    const stored = sessionStorage.getItem("atsResult");
    const name = sessionStorage.getItem("atsFileName");
    if (!stored) { router.push("/analyze"); return; }
    try {
      const parsed: ATSResult = JSON.parse(stored);
      setResult(parsed);
      setFileName(name ?? "resume");

      // Save to history once
      if (!savedToHistory) {
        saveEntry({
          fileName: name ?? "resume",
          score: parsed.overallScore,
          grade: parsed.grade,
          matchedCount: parsed.keywordAnalysis.matchedKeywords.length,
          missingCount: parsed.keywordAnalysis.missingKeywords.length,
          timestamp: Date.now(),
          result: parsed,
        });
        setSavedToHistory(true);
      }

      // Trigger score reveal after a short delay
      setTimeout(() => {
        setScoreRevealed(true);
        const obj = { val: 0 };
        gsap.to(obj, {
          val: parsed.overallScore,
          duration: 1.8,
          ease: "power3.out",
          onUpdate: () => setDisplayScore(Math.round(obj.val)),
        });
      }, 300);
    } catch {
      router.push("/analyze");
    }
    setLoading(false);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleShare = async () => {
    if (!result) return;
    const text = `I scored ${result.overallScore}/100 (Grade ${result.grade}) on my ATS resume check!\n\n` +
      `✅ ${result.keywordAnalysis.matchedKeywords.length} keywords matched\n` +
      `❌ ${result.keywordAnalysis.missingKeywords.length} keywords missing\n\n` +
      `Check yours free at: https://resumeats.app`;
    try {
      await navigator.clipboard.writeText(text);
      setShareState("copied");
      track("results_shared", { score: result.overallScore });
      setTimeout(() => setShareState("idle"), 2500);
    } catch {
      if (navigator.share) {
        navigator.share({ title: "My ATS Score", text });
      }
    }
  };

  const handlePrint = () => {
    track("results_printed");
    window.print();
  };

  const handleTabChange = (tab: typeof activeTab) => {
    setActiveTab(tab);
    track("results_tab_changed", { tab });
  };

  const handleAISuggest = async () => {
    if (!result) return;
    setAiLoading(true);
    setAiError(null);
    track("ai_suggestions_requested");

    const resumeText = sessionStorage.getItem("atsResumeText") ?? "";
    const jobDescription = sessionStorage.getItem("atsJobDescription") ?? "";

    try {
      const res = await fetch("/api/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          resumeText,
          jobDescription,
          atsScore: result.overallScore,
          missingKeywords: result.keywordAnalysis.missingKeywords,
          scoreBreakdown: result.scoreBreakdown,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Unknown error");
      setAiResult(data as AIResponse);
    } catch (err) {
      setAiError(err instanceof Error ? err.message : "Failed to get AI suggestions");
    } finally {
      setAiLoading(false);
    }
  };

  const handleCopySummary = async () => {
    if (!aiResult) return;
    await navigator.clipboard.writeText(aiResult.summaryRewrite);
    setCopiedSummary(true);
    setTimeout(() => setCopiedSummary(false), 2000);
  };

  const loadFromHistory = (entry: typeof history[0]) => {
    sessionStorage.setItem("atsResult", JSON.stringify(entry.result));
    sessionStorage.setItem("atsFileName", entry.fileName);
    setResult(entry.result);
    setFileName(entry.fileName);
    setShowHistory(false);
    setActiveTab("overview");
  };

  if (loading || !result) {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-slate-400 text-sm">Loading results...</p>
        </motion.div>
      </div>
    );
  }

  const ctx = getScoreContext(result.overallScore);
  const sections = Object.values(result.sections) as SectionScore[];
  const criticalCount = result.suggestions.filter((s) => s.priority === "critical").length;
  const keywords = showAllKeywords
    ? result.keywordAnalysis.matches
    : result.keywordAnalysis.matches.slice(0, 20);

  return (
    <main className="min-h-screen bg-[#020817]" ref={printRef}>
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none print:hidden" />

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">

        {/* ── Top bar ───────────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6 print:hidden">
          <div>
            <Link href="/analyze" className="inline-flex items-center gap-1.5 text-slate-500 hover:text-white text-xs transition-colors mb-1.5">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Analyzer
            </Link>
            <h1 className="text-2xl font-bold text-white">ATS Analysis Report</h1>
            <p className="text-slate-500 text-xs mt-0.5 truncate max-w-xs">{fileName}</p>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap min-w-0">
            {/* History button */}
            {history.length > 1 && (
              <button
                onClick={() => setShowHistory(!showHistory)}
                className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
              >
                <History className="w-3.5 h-3.5" />
                History ({history.length})
              </button>
            )}
            {/* Share */}
            <button
              onClick={handleShare}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              {shareState === "copied" ? "Copied!" : "Share"}
            </button>
            {/* Print */}
            <button
              onClick={handlePrint}
              className="btn-ghost flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs"
            >
              <Printer className="w-3.5 h-3.5" /> Print
            </button>
            <Link href="/analyze" className="btn-ghost flex items-center gap-2 px-4 py-2 rounded-lg text-sm">
              <RefreshCw className="w-3.5 h-3.5" /> New Analysis
            </Link>
          </div>
        </div>

        {/* ── History panel ────────────────────────────────────────────────── */}
        {showHistory && history.length > 1 && (
          <div className="glass rounded-2xl border border-white/8 p-5 mb-5 animate-fade-in print:hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <History className="w-4 h-4 text-violet-400" />
                <h3 className="text-white font-semibold text-sm">Previous Analyses</h3>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={clearHistory} className="text-slate-600 hover:text-red-400 text-xs transition-colors">
                  Clear history
                </button>
                <button onClick={() => setShowHistory(false)} className="text-slate-500 hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {history.slice(1).map((entry) => (
                <button
                  key={entry.id}
                  onClick={() => loadFromHistory(entry)}
                  className="bg-white/3 rounded-xl p-3.5 border border-white/5 hover:border-white/12 transition-all text-left group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <p className="text-white text-xs font-medium truncate max-w-[140px] group-hover:text-cyan-400 transition-colors">
                      {entry.fileName}
                    </p>
                    <span className="text-lg font-bold text-cyan-400 leading-none">{entry.score}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> {entry.matchedCount} matched
                    </span>
                    <span className="flex items-center gap-1">
                      <XCircle className="w-3 h-3 text-red-500" /> {entry.missingCount} missing
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-2 text-[10px] text-slate-600">
                    <Clock className="w-2.5 h-2.5" /> {formatDate(entry.timestamp)}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Print header (only visible when printing) ─────────────────────── */}
        <div className="hidden print:block mb-6">
          <h1 className="text-2xl font-bold text-black">ATS Resume Analysis Report</h1>
          <p className="text-gray-500 text-sm">File: {fileName} · Generated: {new Date().toLocaleDateString()}</p>
        </div>

        {/* ── Hero Score Card ─────────────────────────────────────────────── */}
        <div className="glass rounded-2xl border border-white/8 p-4 sm:p-6 lg:p-8 mb-5 print:border print:border-gray-200 print:shadow-none">
          <div className="flex flex-col lg:flex-row items-center gap-5 sm:gap-8">
            {/* Score ring */}
            <div className="flex-shrink-0">
              <div className="relative overflow-visible">
                <ScoreConfetti trigger={scoreRevealed} />
                <motion.div
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 120, delay: 0.1 }}
                >
                  <ScoreRing score={displayScore || result.overallScore} size={180} grade={result.grade} />
                </motion.div>
              </div>
            </div>

            {/* Score context + breakdown mini */}
            <div className="flex-1 text-center lg:text-left w-full">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8, duration: 0.5 }}
              >
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                  <span className="text-2xl">{ctx.level}</span>
                  <h2 className={`text-2xl font-bold ${ctx.color}`}>{ctx.headline}</h2>
                </div>
                <p className="text-slate-400 text-[15px] mb-6 leading-relaxed">{ctx.subtext}</p>
              </motion.div>

              <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-3 gap-2">
                {[
                  { label: "Keywords", value: result.scoreBreakdown.keywords, weight: "35%" },
                  { label: "Skills", value: result.scoreBreakdown.skills, weight: "20%" },
                  { label: "Experience", value: result.scoreBreakdown.experience, weight: "15%" },
                  { label: "Education", value: result.scoreBreakdown.education, weight: "10%" },
                  { label: "Formatting", value: result.scoreBreakdown.formatting, weight: "10%" },
                  { label: "ATS Compat.", value: result.scoreBreakdown.atsCompatibility, weight: "10%" },
                ].map((item) => (
                  <div key={item.label} className="bg-white/3 rounded-xl p-3 border border-white/5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-slate-500 text-[11px]">{item.label}</span>
                      <span className="text-slate-600 text-[10px]">{item.weight}</span>
                    </div>
                    <div className="text-lg font-bold" style={{ color: item.value >= 75 ? "#00d4ff" : item.value >= 55 ? "#34d399" : item.value >= 35 ? "#f59e0b" : "#f87171" }}>
                      {item.value}
                    </div>
                    <div className="progress-track mt-1.5">
                      <div className="progress-fill" style={{ width: `${item.value}%`, background: item.value >= 75 ? "#00d4ff" : item.value >= 55 ? "#34d399" : item.value >= 35 ? "#f59e0b" : "#f87171" }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Radar chart */}
            <div className="hidden sm:block flex-shrink-0 w-full lg:w-[280px] print:hidden">
              <p className="text-slate-500 text-[11px] font-medium uppercase tracking-wider text-center mb-2">Score Radar</p>
              <ScoreRadarChart breakdown={result.scoreBreakdown} />
            </div>
          </div>
        </div>

        {/* ── Quick wins badge row ─────────────────────────────────────────── */}
        <div className="flex flex-wrap gap-2 mb-5">
          {result.formatAnalysis.hasQuantifiedAchievements && (
            <span className="tag tag-matched"><CheckCircle2 className="w-3 h-3 mr-1" /> Quantified achievements</span>
          )}
          {result.formatAnalysis.hasActionVerbs && (
            <span className="tag tag-matched"><CheckCircle2 className="w-3 h-3 mr-1" /> Action verbs ({result.formatAnalysis.actionVerbCount})</span>
          )}
          {result.keywordAnalysis.synonymMatches.length > 0 && (
            <span className="tag tag-synonym">⚡ {result.keywordAnalysis.synonymMatches.length} synonym match(es)</span>
          )}
          {!result.formatAnalysis.hasQuantifiedAchievements && (
            <span className="tag tag-missing"><XCircle className="w-3 h-3 mr-1" /> No quantified achievements</span>
          )}
          {result.keywordAnalysis.stuffingDetected && (
            <span className="tag tag-missing"><AlertCircle className="w-3 h-3 mr-1" /> Keyword stuffing detected</span>
          )}
          {result.formatAnalysis.isOptimalLength && (
            <span className="tag tag-matched"><CheckCircle2 className="w-3 h-3 mr-1" /> Optimal length ({result.formatAnalysis.wordCount} words)</span>
          )}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────────── */}
        <div className="flex gap-1 p-1 glass rounded-xl border border-white/5 mb-5 w-full sm:w-fit overflow-x-auto print:hidden scrollbar-none">
          {(
            [
              { id: "overview" as const, label: "Section Scores", icon: BarChart3, badge: undefined as number | undefined, badgeColor: undefined as string | undefined },
              { id: "keywords" as const, label: "Keywords", icon: Zap, badge: result.keywordAnalysis.matches.length, badgeColor: undefined as string | undefined },
              { id: "recruiter" as const, label: "Recruiter Score", icon: Users, badge: undefined as number | undefined, badgeColor: undefined as string | undefined },
              { id: "suggestions" as const, label: "Fix List", icon: Sparkles, badge: criticalCount, badgeColor: "bg-red-500/20 text-red-400" },
              { id: "ai" as const, label: "AI Rewrite", icon: Wand2, badge: undefined as number | undefined, badgeColor: undefined as string | undefined },
              { id: "career" as const, label: "Career Path", icon: Target, badge: undefined as number | undefined, badgeColor: undefined as string | undefined },
            ]
          ).map((tab) => {
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-2.5 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                  activeTab === tab.id
                    ? tab.id === "ai"
                      ? "bg-violet-500/15 text-violet-300"
                      : tab.id === "career"
                        ? "bg-emerald-500/15 text-emerald-300"
                        : "bg-white/10 text-white"
                    : "text-slate-500 hover:text-slate-300"
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    tab.badgeColor ?? "bg-cyan-500/20 text-cyan-400"
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Tab panels (animated) ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >

        {/* ── Tab: Overview ───────────────────────────────────────────────── */}
        {activeTab === "overview" && (
          <div className="space-y-5 animate-fade-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sections.map((section, i) => {
                const cfg = STATUS_CONFIG[section.status];
                const StatusIcon = cfg.icon;
                return (
                  <motion.div
                    key={section.name}
                    className="glass rounded-2xl p-5 border border-white/7 hover:border-white/12 transition-colors"
                    initial={{ opacity: 0, y: 24 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.45, delay: i * 0.07, ease: [0.25, 0.1, 0.25, 1] }}
                    whileHover={{ y: -3, boxShadow: "0 12px 32px rgba(6,182,212,0.12)" }}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-white font-semibold text-[14px]">{section.name}</h3>
                      <span className={`flex items-center gap-1 text-[11px] font-medium ${cfg.color}`}>
                        <StatusIcon className="w-3 h-3" /> {cfg.label}
                      </span>
                    </div>
                    <ProgressBar value={section.score} delay={200 + i * 80} />
                    <ul className="mt-3 space-y-1.5">
                      {section.feedback.slice(0, 3).map((fb, j) => (
                        <li key={j} className={`flex items-start gap-1.5 text-[12px] ${fb.includes("✓") ? "text-slate-400" : "text-slate-500"}`}>
                          <div className="w-1 h-1 rounded-full bg-white/20 mt-1.5 flex-shrink-0" />
                          {fb}
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                );
              })}
            </div>

            {/* Score improvement potential */}
            {criticalCount > 0 && (
              <div className="glass rounded-2xl p-5 border border-amber-500/15 bg-amber-500/3">
                <div className="flex items-start gap-3">
                  <TrendingUp className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-white font-semibold text-sm mb-1">
                      Score improvement potential: +{result.suggestions.reduce((a, s) => a + (s.priority === "critical" ? s.impact : 0), 0)} pts
                    </p>
                    <p className="text-slate-400 text-xs leading-relaxed">
                      Fixing {criticalCount} critical issue{criticalCount > 1 ? "s" : ""} could push your score from{" "}
                      <span className="text-orange-400 font-medium">{result.overallScore}</span> to{" "}
                      <span className="text-emerald-400 font-medium">
                        {Math.min(100, result.overallScore + result.suggestions.reduce((a, s) => a + (s.priority === "critical" ? s.impact : 0), 0))}
                      </span>. Check the Fix List tab.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: Keywords ───────────────────────────────────────────────── */}
        {activeTab === "keywords" && (
          <div className="space-y-5 animate-fade-in">
            {/* Summary row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass rounded-2xl p-5 border border-emerald-500/20 text-center">
                <div className="text-3xl font-bold text-emerald-400">{result.keywordAnalysis.matchedKeywords.length}</div>
                <div className="text-slate-400 text-xs mt-1">Exact Matches</div>
              </div>
              <div className="glass rounded-2xl p-5 border border-amber-500/20 text-center">
                <div className="text-3xl font-bold text-amber-400">{result.keywordAnalysis.synonymMatches.length}</div>
                <div className="text-slate-400 text-xs mt-1">Synonym Matches</div>
                <div className="text-slate-600 text-[10px] mt-0.5">e.g., &quot;JS&quot; → &quot;JavaScript&quot;</div>
              </div>
              <div className="glass rounded-2xl p-5 border border-red-500/20 text-center">
                <div className="text-3xl font-bold text-red-400">{result.keywordAnalysis.missingKeywords.length}</div>
                <div className="text-slate-400 text-xs mt-1">Missing Keywords</div>
              </div>
            </div>

            {/* Bar chart */}
            <div className="glass rounded-2xl p-5 border border-white/7">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-white font-semibold text-sm">Keyword Frequency Chart</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    <span className="text-emerald-400">■</span> Matched &nbsp;
                    <span className="text-amber-400">■</span> Synonym &nbsp;
                    <span className="text-red-400">■</span> Missing (0 = absent)
                  </p>
                </div>
              </div>
              <KeywordBarChart matches={result.keywordAnalysis.matches} />
            </div>

            {/* Top missing - highlighted */}
            {result.keywordAnalysis.topMissingKeywords.length > 0 && (
              <div className="glass rounded-2xl p-5 border border-red-500/15 bg-red-500/3">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-4 h-4 text-red-400" />
                  <h3 className="text-white font-semibold text-sm">Top Missing Keywords (Add These First)</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {result.keywordAnalysis.topMissingKeywords.map((kw) => (
                    <span key={kw} className="tag tag-missing text-sm">{kw}</span>
                  ))}
                </div>
                <p className="text-slate-500 text-xs mt-3">
                  These are high-priority terms from the job description. Incorporating them naturally into your resume can significantly improve your ATS ranking.
                </p>
              </div>
            )}

            {/* Keyword detail table */}
            <div className="glass rounded-2xl border border-white/7 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-white/5 flex items-center justify-between">
                <h3 className="text-white font-semibold text-sm">All Keyword Matches</h3>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="tag tag-matched">Matched</span>
                  <span className="tag tag-synonym">Synonym</span>
                  <span className="tag tag-missing">Missing</span>
                </div>
              </div>

              <div className="divide-y divide-white/3">
                {keywords.map((km) => (
                  <div key={km.keyword} className="flex items-center justify-between px-5 py-3 hover:bg-white/2 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {km.found ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-3.5 h-3.5 text-red-400/70 flex-shrink-0" />
                      )}
                      <span className={`text-sm truncate ${km.found ? "text-white" : "text-slate-500"}`}>{km.keyword}</span>
                      {km.matchType === "synonym" && km.matchedAs && (
                        <span className="text-[11px] text-amber-400/70 flex-shrink-0">(as &quot;{km.matchedAs}&quot;)</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {km.found && km.count > 0 && (
                        <span className="text-slate-600 text-xs">×{km.count}</span>
                      )}
                      <span className={`tag ${km.found ? (km.matchType === "exact" ? "tag-matched" : "tag-synonym") : "tag-missing"}`}>
                        {km.found
                          ? (km.matchType === "exact" ? "Exact" : km.matchType === "synonym" ? "Synonym" : "Similar")
                          : km.importance === "critical" ? "🔴 Critical" : km.importance === "high" ? "🟠 High" : "Missing"
                        }
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {result.keywordAnalysis.matches.length > 20 && (
                <div className="px-5 py-3 border-t border-white/5 text-center">
                  <button
                    onClick={() => setShowAllKeywords(!showAllKeywords)}
                    className="text-cyan-400 text-sm hover:text-cyan-300 transition-colors"
                  >
                    {showAllKeywords ? "Show fewer" : `Show all ${result.keywordAnalysis.matches.length} keywords`}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Tab: Recruiter Score ─────────────────────────────────────────── */}
        {activeTab === "recruiter" && (
          <div className="space-y-5 animate-fade-in">
            <div className="glass rounded-2xl p-5 border border-white/7">
              <div className="flex items-start gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center flex-shrink-0">
                  <Users className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Recruiter Readability Score</h3>
                  <p className="text-slate-500 text-xs mt-0.5">
                    Unique to ResumeATS — grades how your resume performs for the human who opens it, not just the ATS bot.
                  </p>
                </div>
                <div className="ml-auto flex-shrink-0 text-right">
                  <div className="text-3xl font-bold text-pink-400">{result.recruiterScore.score}</div>
                  <div className="text-slate-500 text-xs">/ 100 · Grade {result.recruiterScore.grade}</div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { label: "Visual Clarity", value: result.recruiterScore.clarity, desc: "Easy to scan in 6 seconds?", icon: "👁" },
                  { label: "Impact & Achievements", value: result.recruiterScore.impact, desc: "Do results and metrics stand out?", icon: "🎯" },
                  { label: "Role Relevance", value: result.recruiterScore.relevance, desc: "Is content targeted to this role?", icon: "🎪" },
                  { label: "Authenticity", value: result.recruiterScore.authenticity, desc: "Does it read naturally, not AI-stuffed?", icon: "✍️" },
                ].map((dim) => (
                  <div key={dim.label} className="bg-white/3 rounded-xl p-4 border border-white/5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-1.5">
                        <span>{dim.icon}</span>
                        <span className="text-slate-300 text-sm font-medium">{dim.label}</span>
                      </div>
                      <span className="text-lg font-bold text-white">{dim.value}</span>
                    </div>
                    <ProgressBar value={dim.value} delay={200} />
                    <p className="text-slate-600 text-[11px] mt-1.5">{dim.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-2xl p-5 border border-white/7">
              <div className="flex items-center gap-2 mb-4">
                <Info className="w-4 h-4 text-cyan-400" />
                <h3 className="text-white font-semibold text-sm">Recruiter Feedback</h3>
              </div>
              <div className="space-y-2.5">
                {result.recruiterScore.feedback.map((fb, i) => (
                  <div key={i} className={`flex items-start gap-2 text-sm ${fb.includes("✓") ? "text-slate-300" : "text-slate-400"}`}>
                    {fb.includes("✓") ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    )}
                    {fb}
                  </div>
                ))}
              </div>
            </div>

            <div className="glass rounded-xl p-4 border border-cyan-500/10 bg-cyan-500/3">
              <p className="text-slate-400 text-xs leading-relaxed">
                <span className="text-cyan-400 font-medium">Why this matters:</span> ATS systems rank your resume — but a human still makes the call.
                A resume that scores 90% on ATS but reads as robotic or generic will lose to an 80% ATS score that sounds compelling and specific.
                Both scores matter.
              </p>
            </div>
          </div>
        )}

        {/* ── Tab: Suggestions ────────────────────────────────────────────── */}
        {activeTab === "suggestions" && (
          <div className="space-y-3 animate-fade-in">
            {result.suggestions.length === 0 && (
              <div className="glass rounded-2xl p-10 border border-emerald-500/20 text-center">
                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                <h3 className="text-white font-semibold mb-1">No major issues found</h3>
                <p className="text-slate-400 text-sm">Your resume looks well-optimized for this role. Keep applying!</p>
              </div>
            )}

            {result.suggestions.length > 0 && (() => {
              const quickWins = result.suggestions.filter(
                (s) => s.timeNeeded && (s.timeNeeded.includes("1 min") || s.timeNeeded.includes("2 min") || s.timeNeeded.includes("5 min"))
              );
              const totalEstGain = result.suggestions.reduce((sum, s) => sum + s.impact, 0);

              return (
                <>
                  {/* ── Score Impact Banner ─────────────────────────── */}
                  <div className="glass rounded-2xl border border-white/8 p-4 flex flex-wrap items-center gap-4">
                    <div className="flex-1">
                      <p className="text-white font-semibold text-sm">Fix all issues → up to +{totalEstGain} pts</p>
                      <p className="text-slate-500 text-xs mt-0.5">
                        {result.suggestions.filter(s => s.priority === "critical").length} critical ·{" "}
                        {result.suggestions.filter(s => s.priority === "high").length} high ·{" "}
                        {result.suggestions.filter(s => s.priority === "medium").length} medium issues
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(["critical", "high", "medium", "low"] as const).map((p) => {
                        const count = result.suggestions.filter((s) => s.priority === p).length;
                        if (!count) return null;
                        const cfg = PRIORITY_CONFIG[p];
                        return (
                          <div key={p} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg ${cfg.bg} border ${cfg.border}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                            <span className={`text-xs font-medium ${cfg.color}`}>{count} {cfg.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* ── Quick Wins ──────────────────────────────────── */}
                  {quickWins.length > 0 && (
                    <div className="glass rounded-2xl border border-emerald-500/20 bg-emerald-500/3 overflow-hidden">
                      <div className="flex items-center gap-2 px-5 py-3 border-b border-emerald-500/15">
                        <Zap className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300 font-semibold text-sm">Quick Wins</span>
                        <span className="text-slate-500 text-xs ml-1">— fixes under 5 min each</span>
                      </div>
                      <div className="divide-y divide-emerald-500/10">
                        {quickWins.map((s) => (
                          <div key={s.id} className="flex items-center gap-3 px-5 py-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 flex-shrink-0" />
                            <p className="text-slate-300 text-sm flex-1">{s.title}</p>
                            <span className="text-emerald-400/70 text-xs flex-shrink-0">+{s.impact} pts</span>
                            <span className="text-slate-600 text-xs flex-shrink-0">{s.timeNeeded}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Full Suggestion Cards ────────────────────────── */}
                  <motion.div
                    className="contents"
                    variants={{ show: { transition: { staggerChildren: 0.06 } } }}
                    initial="hidden"
                    animate="show"
                  >
                  {result.suggestions.map((s: Suggestion) => {
                    const cfg = PRIORITY_CONFIG[s.priority];
                    const isOpen = expandedSuggestion === s.id;
                    const hasBeforeAfter = !!(s.currentText && s.improvedText);
                    return (
                      <motion.div
                        key={s.id}
                        variants={{ hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } }}
                        transition={{ duration: 0.35 }}
                      >
                      <div className={`glass rounded-2xl border ${cfg.border} overflow-hidden`}>
                        <button
                          className="w-full flex items-start gap-4 p-5 text-left hover:bg-white/2 transition-colors"
                          onClick={() => setExpandedSuggestion(isOpen ? null : s.id)}
                        >
                          <div className={`w-2 h-2 rounded-full ${cfg.dot} flex-shrink-0 mt-2`} />
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-0.5">
                              <span className={`text-[11px] font-semibold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
                              <span className="text-slate-600 text-[11px]">·</span>
                              <span className="text-slate-500 text-[11px]">{s.category}</span>
                              <span className="text-slate-600 text-[11px]">·</span>
                              <span className={`text-[11px] ${EFFORT_COLOR[s.effort]}`}>{EFFORT_LABEL[s.effort]}</span>
                              {s.timeNeeded && (
                                <>
                                  <span className="text-slate-600 text-[11px]">·</span>
                                  <span className="text-slate-500 text-[11px]">{s.timeNeeded}</span>
                                </>
                              )}
                              {hasBeforeAfter && (
                                <span className="px-1.5 py-0.5 rounded text-[10px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">Before/After</span>
                              )}
                              <span className="ml-auto text-emerald-400/70 text-[11px]">+{s.impact} pts est.</span>
                            </div>
                            <h3 className="text-white font-semibold text-[15px]">{s.title}</h3>
                          </div>
                          <div className="flex-shrink-0 mt-1">
                            {isOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className={`px-5 pb-5 border-t ${cfg.border} ${cfg.bg} pt-4 space-y-4`}>
                            <p className="text-slate-300 text-sm leading-relaxed">{s.description}</p>

                            {/* Before / After */}
                            {hasBeforeAfter && (
                              <div className="rounded-xl overflow-hidden border border-white/8">
                                <div className="flex items-center gap-2 px-4 py-2 bg-red-500/8 border-b border-white/5">
                                  <div className="w-2 h-2 rounded-full bg-red-500" />
                                  <span className="text-red-400 text-[11px] font-semibold uppercase tracking-wider">Current (problematic)</span>
                                </div>
                                <div className="px-4 py-3 bg-black/20">
                                  <p className="text-slate-300 text-sm font-mono leading-relaxed whitespace-pre-wrap">{s.currentText}</p>
                                </div>
                                <div className="flex items-center justify-center py-2 border-y border-white/5 bg-white/2">
                                  <ArrowRight className="w-4 h-4 text-slate-600" />
                                  <span className="text-slate-600 text-[11px] ml-1">Suggested fix</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2 bg-emerald-500/8 border-b border-white/5">
                                  <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                  <span className="text-emerald-400 text-[11px] font-semibold uppercase tracking-wider">Improved version</span>
                                </div>
                                <div className="px-4 py-3 bg-black/20">
                                  <p className="text-slate-200 text-sm font-mono leading-relaxed whitespace-pre-wrap">{s.improvedText}</p>
                                </div>
                              </div>
                            )}

                            {/* Generic example (no before/after) */}
                            {!hasBeforeAfter && s.example && (
                              <div className="p-3.5 rounded-xl bg-black/30 border border-white/5">
                                <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Example</p>
                                <p className="text-slate-200 text-sm font-mono leading-relaxed whitespace-pre-wrap">{s.example}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      </motion.div>
                    );
                  })}
                  </motion.div>
                </>
              );
            })()}
          </div>
        )}

        {/* ── Tab: AI Rewrite ─────────────────────────────────────────────── */}
        {activeTab === "ai" && (
          <div className="space-y-5 animate-fade-in print:hidden">
            {/* Pre-generate state */}
            {!aiResult && !aiLoading && (
              <div className="glass rounded-2xl p-8 border border-violet-500/15 bg-violet-500/3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500/20 to-cyan-500/20 flex items-center justify-center mx-auto mb-4">
                  <Wand2 className="w-7 h-7 text-violet-400" />
                </div>
                <h3 className="text-white font-bold text-lg mb-2">AI Resume Rewriter</h3>
                <p className="text-slate-400 text-sm mb-1 max-w-md mx-auto">
                  Claude AI will analyze your resume against the job description and generate:
                </p>
                <ul className="text-slate-500 text-xs space-y-1 mb-6 max-w-xs mx-auto">
                  <li>• 3–5 rewritten bullet points (stronger, keyword-rich)</li>
                  <li>• Skill gap analysis with fix guidance</li>
                  <li>• Custom professional summary for this role</li>
                  <li>• 3 quick wins you can apply in under 15 min</li>
                </ul>
                {aiError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                    {aiError}
                  </div>
                )}
                <button
                  onClick={handleAISuggest}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-500 to-cyan-500 text-white font-semibold text-sm hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/20"
                >
                  <Wand2 className="w-4 h-4" /> Generate AI Suggestions
                </button>
                <p className="text-slate-600 text-xs mt-3">Powered by Claude Sonnet · ~15 seconds</p>
              </div>
            )}

            {/* Loading state */}
            {aiLoading && (
              <div className="glass rounded-2xl p-12 border border-violet-500/15 text-center">
                <Loader2 className="w-8 h-8 text-violet-400 animate-spin mx-auto mb-4" />
                <p className="text-white font-semibold mb-1">Analyzing your resume...</p>
                <p className="text-slate-500 text-sm">Claude is reading the job description and generating personalized suggestions</p>
              </div>
            )}

            {/* Results */}
            {aiResult && !aiLoading && (
              <>
                {/* Quick Wins */}
                <div className="glass rounded-2xl p-5 border border-emerald-500/20 bg-emerald-500/3">
                  <div className="flex items-center gap-2 mb-4">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <h3 className="text-white font-semibold text-sm">Quick Wins — Under 15 Minutes Each</h3>
                  </div>
                  <div className="space-y-2.5">
                    {aiResult.quickWins.map((win, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm">
                        <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                          {i + 1}
                        </span>
                        <p className="text-slate-300 leading-relaxed">{win}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bullet Improvements */}
                <div className="glass rounded-2xl p-5 border border-white/7">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-white font-semibold text-sm">Bullet Point Rewrites</h3>
                  </div>
                  <div className="space-y-4">
                    {aiResult.bulletImprovements.map((item, i) => (
                      <div key={i} className="rounded-xl overflow-hidden border border-white/6">
                        <div className="bg-red-500/5 border-b border-white/5 px-4 py-3">
                          <div className="text-[10px] font-semibold text-red-400/70 uppercase tracking-wider mb-1">Before</div>
                          <p className="text-slate-400 text-sm leading-relaxed">{item.original}</p>
                        </div>
                        <div className="bg-emerald-500/5 border-b border-white/5 px-4 py-3">
                          <div className="text-[10px] font-semibold text-emerald-400/70 uppercase tracking-wider mb-1">After</div>
                          <p className="text-slate-200 text-sm leading-relaxed">{item.improved}</p>
                        </div>
                        <div className="bg-white/2 px-4 py-2.5">
                          <p className="text-slate-500 text-xs"><span className="text-cyan-400/70 font-medium">Why: </span>{item.reason}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Skill Gaps */}
                <div className="glass rounded-2xl p-5 border border-white/7">
                  <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-white font-semibold text-sm">Skill Gaps to Address</h3>
                  </div>
                  <div className="space-y-3">
                    {aiResult.skillGaps.map((gap, i) => (
                      <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="tag tag-missing text-xs">{gap.skill}</span>
                        </div>
                        <p className="text-slate-400 text-xs mb-2 leading-relaxed"><span className="text-slate-500 font-medium">Context: </span>{gap.context}</p>
                        <p className="text-slate-300 text-xs leading-relaxed"><span className="text-cyan-400/80 font-medium">How to fix: </span>{gap.howToAddressIt}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Summary Rewrite */}
                <div className="glass rounded-2xl p-5 border border-violet-500/20 bg-violet-500/3">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Wand2 className="w-4 h-4 text-violet-400" />
                      <h3 className="text-white font-semibold text-sm">Optimized Professional Summary</h3>
                    </div>
                    <button
                      onClick={handleCopySummary}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/15 hover:bg-violet-500/25 text-violet-300 text-xs transition-colors"
                    >
                      {copiedSummary ? <CheckCheck className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copiedSummary ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <p className="text-slate-200 text-sm leading-relaxed bg-black/20 rounded-xl p-4 border border-white/5">
                    {aiResult.summaryRewrite}
                  </p>
                </div>

                {/* Regenerate */}
                <div className="text-center">
                  <button
                    onClick={() => { setAiResult(null); setAiError(null); }}
                    className="text-slate-500 hover:text-slate-300 text-xs transition-colors inline-flex items-center gap-1.5"
                  >
                    <RefreshCw className="w-3 h-3" /> Generate new suggestions
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {/* ── Tab: Career Path ────────────────────────────────────────────── */}
        {activeTab === "career" && (
          <div className="space-y-5 animate-fade-in print:hidden">
            {!result.careerIntelligence ? (
              <div className="glass rounded-2xl p-8 border border-white/7 text-center">
                <p className="text-slate-400">Career intelligence not available for this resume.</p>
              </div>
            ) : (() => {
              const ci = result.careerIntelligence!;
              const levelCfg = EXPERIENCE_COLORS[ci.experienceLevel];
              const PRIORITY_ICON = { must_learn: "🔥", high: "⚡", medium: "📘" };
              const READINESS_CFG = {
                ready:   { label: "Apply Now",    color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/25", icon: CheckCircle2 },
                stretch: { label: "Stretch Goal", color: "text-amber-400",   bg: "bg-amber-500/10",   border: "border-amber-500/25",   icon: TrendingUp },
                future:  { label: "Future Goal",  color: "text-slate-400",   bg: "bg-slate-500/10",   border: "border-slate-500/20",   icon: Star },
              };
              const ADDITION_ICON: Record<string, string> = {
                project: "🗂", skill: "🛠", certification: "🎓", metric: "📊", section: "📄",
              };
              return (
                <>
                  {/* Header — level + primary tech + stack */}
                  <div className="glass rounded-2xl p-5 border border-white/7">
                    <div className="flex flex-wrap items-center gap-3 mb-4">
                      <div className={`tag border ${levelCfg.bg} ${levelCfg.text} ${levelCfg.border} text-sm font-semibold px-3 py-1`}>
                        {EXPERIENCE_LABELS[ci.experienceLevel]}
                      </div>
                      {ci.primaryTech !== "General" && (
                        <div className="tag border bg-cyan-500/10 text-cyan-300 border-cyan-500/20 text-sm">
                          Primary: {ci.primaryTech}
                        </div>
                      )}
                    </div>
                    {ci.detectedStack.length > 0 && (
                      <div>
                        <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider mb-2">Detected in your resume</p>
                        <div className="flex flex-wrap gap-2">
                          {ci.detectedStack.map(tech => (
                            <span key={tech.name} className={`tag border ${tech.confidence === "confirmed" ? "bg-white/6 text-slate-200 border-white/10" : "bg-white/3 text-slate-400 border-white/6"}`}>
                              {tech.name}
                              {tech.confidence === "confirmed" && <CheckCircle2 className="w-2.5 h-2.5 ml-1 text-emerald-400" />}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Target Roles */}
                  <div className="glass rounded-2xl p-5 border border-white/7">
                    <div className="flex items-center gap-2 mb-4">
                      <Trophy className="w-4 h-4 text-amber-400" />
                      <h3 className="text-white font-semibold text-sm">Positions to Target</h3>
                    </div>
                    <div className="space-y-2.5">
                      {ci.targetRoles.map((role, i) => {
                        const cfg = READINESS_CFG[role.readiness];
                        const RoleIcon = cfg.icon;
                        return (
                          <div key={i} className={`flex items-start gap-3 p-3.5 rounded-xl border ${cfg.bg} ${cfg.border}`}>
                            <RoleIcon className={`w-4 h-4 ${cfg.color} flex-shrink-0 mt-0.5`} />
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-white text-sm font-medium">{role.title}</span>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>{cfg.label}</span>
                              </div>
                              {role.gap && (
                                <p className="text-slate-500 text-xs mt-1 leading-relaxed"><span className="text-slate-400">Gap: </span>{role.gap}</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Next Skills to Learn */}
                  <div className="glass rounded-2xl p-5 border border-white/7">
                    <div className="flex items-center gap-2 mb-4">
                      <BookOpen className="w-4 h-4 text-cyan-400" />
                      <h3 className="text-white font-semibold text-sm">Skills to Learn Next</h3>
                      <span className="text-[10px] text-slate-500 ml-auto">Based on your experience level</span>
                    </div>
                    <div className="space-y-3">
                      {ci.nextSkills.map((skill, i) => (
                        <div key={i} className="bg-white/3 rounded-xl p-4 border border-white/5">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-base">{PRIORITY_ICON[skill.priority]}</span>
                              <span className="text-white font-semibold text-sm">{skill.skill}</span>
                            </div>
                            <span className="text-[10px] text-slate-500 whitespace-nowrap bg-white/5 px-2 py-1 rounded-lg border border-white/5 flex-shrink-0">
                              {skill.timeframe}
                            </span>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed mb-2">{skill.reason}</p>
                          <div className="flex items-center gap-1.5">
                            <ArrowRight className="w-3 h-3 text-cyan-400/60 flex-shrink-0" />
                            <p className="text-cyan-400/80 text-[11px] leading-relaxed">{skill.resourceHint}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Level-Up Goals */}
                  <div className="glass rounded-2xl p-5 border border-emerald-500/15 bg-emerald-500/3">
                    <div className="flex items-center gap-2 mb-4">
                      <TrendingUp className="w-4 h-4 text-emerald-400" />
                      <h3 className="text-white font-semibold text-sm">Level-Up Goals — Reach the Next Tier</h3>
                    </div>
                    <div className="space-y-2.5">
                      {ci.levelUpGoals.map((goal, i) => (
                        <div key={i} className="flex items-start gap-3 text-sm">
                          <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center text-[10px] font-bold flex-shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <p className="text-slate-300 leading-relaxed">{goal}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resume Additions */}
                  <div className="glass rounded-2xl p-5 border border-white/7">
                    <div className="flex items-center gap-2 mb-4">
                      <Lightbulb className="w-4 h-4 text-amber-400" />
                      <h3 className="text-white font-semibold text-sm">Add These to Your Resume</h3>
                      <span className="text-[10px] text-slate-500 ml-auto">Role-specific additions</span>
                    </div>
                    <div className="space-y-3">
                      {ci.resumeAdditions.map((add, i) => (
                        <div key={i} className="flex items-start gap-3 p-3.5 bg-white/3 rounded-xl border border-white/5">
                          <span className="text-lg flex-shrink-0 mt-0.5">{ADDITION_ICON[add.category] ?? "📌"}</span>
                          <div>
                            <p className="text-white text-sm font-medium leading-snug">{add.item}</p>
                            <p className="text-slate-400 text-xs mt-1 leading-relaxed">
                              <span className="text-amber-400/80 font-medium">Why it matters: </span>{add.whyItMatters}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              );
            })()}
          </div>
        )}

          </motion.div>
        </AnimatePresence>

        {/* ── GitHub Profile Card ──────────────────────────────────────────── */}
        {githubData && (
          <div className="mt-6 glass rounded-2xl border border-emerald-500/20 overflow-hidden print:hidden">
            <div className="flex items-center gap-3 px-5 pt-4 pb-3 border-b border-white/5">
              <div className="w-7 h-7 rounded-full bg-emerald-500/15 flex items-center justify-center flex-shrink-0">
                <Code2 className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">GitHub Profile</h3>
                <p className="text-slate-500 text-[11px]">@{githubData.username}</p>
              </div>
              <a href={githubData.profileUrl} target="_blank" rel="noopener noreferrer"
                className="text-slate-500 hover:text-emerald-400 transition-colors mr-3">
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <div className="text-right">
                <div className="text-emerald-400 font-bold text-xl leading-none">{githubData.score}</div>
                <div className="text-slate-600 text-[10px]">/100</div>
              </div>
            </div>
            <div className="p-5">
              <div className="h-2 rounded-full bg-white/5 mb-4">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500"
                  style={{ width: `${githubData.score}%` }} />
              </div>
              <div className="grid grid-cols-4 gap-3 mb-4">
                {[
                  { label: "Repos", value: githubData.stats.originalRepos },
                  { label: "Followers", value: githubData.stats.followers },
                  { label: "Stars ★", value: githubData.stats.totalStars },
                  { label: "Languages", value: githubData.stats.languages.length },
                ].map((s) => (
                  <div key={s.label} className="rounded-xl bg-white/3 border border-white/5 p-3 text-center">
                    <div className="text-emerald-400 font-bold text-base">{s.value}</div>
                    <div className="text-slate-500 text-[11px]">{s.label}</div>
                  </div>
                ))}
              </div>
              {githubData.stats.languages.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {githubData.stats.languages.slice(0, 8).map((lang) => (
                    <span key={lang} className="px-2 py-0.5 rounded-md text-xs bg-emerald-500/8 text-emerald-300 border border-emerald-500/15">
                      {lang}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Bottom CTA ───────────────────────────────────────────────────── */}
        <div className="mt-10 glass rounded-2xl border border-white/7 p-5 sm:p-6 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 flex items-center justify-center flex-shrink-0">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm">Applied the fixes?</p>
              <p className="text-slate-500 text-xs mt-0.5">Re-analyze your updated resume to see your new score.</p>
            </div>
          </div>
          <div className="flex gap-3 flex-shrink-0 flex-wrap justify-center">
            <button
              onClick={handleShare}
              className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            >
              <Share2 className="w-4 h-4" /> {shareState === "copied" ? "Copied to clipboard!" : "Share Score"}
            </button>
            <button
              onClick={handlePrint}
              className="btn-ghost flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm"
            >
              <Printer className="w-4 h-4" /> Print Report
            </button>
            <Link
              href="/analyze"
              className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold"
            >
              <Zap className="w-4 h-4" /> Re-Analyze
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
