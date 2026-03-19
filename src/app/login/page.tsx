"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Zap, Sparkles, Shield, BarChart2, FileText } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { FloatingOrbs } from "@/components/ui/FloatingOrbs";

function LoginInner() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/analyze";
  const [loading, setLoading] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testPassword, setTestPassword] = useState("");
  const [credError, setCredError] = useState("");

  useEffect(() => {
    if (session) router.replace(callbackUrl);
  }, [session, router, callbackUrl]);

  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signIn("google", { callbackUrl });
  };

  const handleCredentialsSignIn = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    setCredError("");
    setLoading(true);
    const result = await signIn("credentials", {
      email: testEmail,
      password: testPassword,
      callbackUrl,
      redirect: false,
    });
    setLoading(false);
    if (result?.error) {
      setCredError("Invalid email or password");
    } else if (result?.url) {
      router.replace(result.url);
    }
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    );
  }

  const PERKS = [
    { icon: BarChart2, text: "Unlimited ATS checks" },
    { icon: FileText, text: "Resume history & tracking" },
    { icon: Shield, text: "Private & secure — no spam" },
    { icon: Sparkles, text: "Career Intelligence insights" },
  ];

  return (
    <main className="min-h-screen bg-[#020817] flex flex-col items-center justify-center px-4 relative overflow-hidden">
      {/* Background glows */}
      <div className="fixed top-1/4 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed bottom-1/4 right-1/4 w-96 h-96 bg-violet-500/6 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <FloatingOrbs count={4} />

      {/* Logo */}
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link href="/" className="flex items-center gap-2 mb-10 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-xl text-white">
            Resume<span className="text-cyan-400">ATS</span>
          </span>
        </Link>
      </motion.div>

      {/* Card */}
      <motion.div
        className="relative z-10 w-full max-w-md glass rounded-2xl border border-white/8 p-8"
        initial={{ opacity: 0, y: 32, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/25 bg-violet-500/8 text-violet-300 text-xs font-medium mb-5">
            <Sparkles className="w-3 h-3" />
            Free forever · No credit card
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">
            Continue with your account
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Sign in to unlock unlimited ATS checks and track your resume progress over time.
          </p>
        </div>

        {/* Perks list */}
        <motion.div
          className="grid grid-cols-2 gap-3 mb-8"
          variants={{ show: { transition: { staggerChildren: 0.07 } } }}
          initial="hidden"
          animate="show"
        >
          {PERKS.map(({ icon: Icon, text }) => (
            <motion.div
              key={text}
              variants={{ hidden: { opacity: 0, scale: 0.9 }, show: { opacity: 1, scale: 1 } }}
              transition={{ duration: 0.4 }}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-white/3 border border-white/5"
            >
              <div className="w-7 h-7 rounded-lg bg-cyan-500/15 flex items-center justify-center flex-shrink-0">
                <Icon className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="text-slate-300 text-xs font-medium leading-tight">{text}</span>
            </motion.div>
          ))}
        </motion.div>

        {/* Google sign-in button */}
        <motion.button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-white hover:bg-slate-100 transition-colors text-slate-900 font-semibold text-sm disabled:opacity-60 disabled:cursor-not-allowed shadow-lg"
          whileHover={{ boxShadow: "0 0 30px rgba(255,255,255,0.15)" }}
          whileTap={{ scale: 0.98 }}
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-slate-400/40 border-t-slate-600 rounded-full animate-spin" />
          ) : (
            <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          )}
          {loading ? "Signing in…" : "Continue with Google"}
        </motion.button>

        {/* Divider */}
        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/6" />
          <span className="text-slate-600 text-xs">or test account</span>
          <div className="flex-1 h-px bg-white/6" />
        </div>

        {/* Test credentials form */}
        <form onSubmit={handleCredentialsSignIn} className="space-y-3">
          <div className="px-3 py-2 rounded-lg bg-amber-500/8 border border-amber-500/20 text-amber-300 text-xs">
            🧪 Test login — <strong>admin@test.com</strong> / <strong>test1234</strong>
          </div>
          <input
            type="email"
            placeholder="Email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          <input
            type="password"
            placeholder="Password"
            value={testPassword}
            onChange={(e) => setTestPassword(e.target.value)}
            className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
          />
          {credError && <p className="text-red-400 text-xs">{credError}</p>}
          <motion.button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/25 text-cyan-300 hover:bg-cyan-500/20 text-sm font-medium transition-colors disabled:opacity-50"
            whileTap={{ scale: 0.97 }}
          >
            {loading ? "Signing in…" : "Sign in with test account"}
          </motion.button>
        </form>

        <div className="flex items-center gap-3 my-5">
          <div className="flex-1 h-px bg-white/6" />
          <span className="text-slate-600 text-xs">or</span>
          <div className="flex-1 h-px bg-white/6" />
        </div>

        <Link
          href="/analyze"
          className="flex items-center justify-center w-full py-3 rounded-xl border border-white/8 text-slate-400 hover:text-white hover:border-white/16 text-sm transition-colors"
        >
          Use once without signing in
        </Link>

        <p className="text-center text-slate-600 text-xs mt-6 leading-relaxed">
          By continuing you agree to our{" "}
          <Link href="/privacy" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</Link>
          {" "}and{" "}
          <Link href="/terms" className="text-slate-400 hover:text-white transition-colors">Terms of Service</Link>.
        </p>
      </motion.div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#020817] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin" />
      </div>
    }>
      <LoginInner />
    </Suspense>
  );
}
