"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Zap, Menu, X, LogOut, ChevronDown,
  FileSearch, FileText, MessageSquare, LayoutTemplate,
  Users, Lightbulb, BookOpen, DollarSign
} from "lucide-react";

const PRIMARY_NAV_LINKS = [
  { href: "/", label: "Home", icon: null },
  { href: "/analyze", label: "Analyze", icon: FileSearch },
  { href: "/cover-letter", label: "Cover Letter", icon: FileText },
  { href: "/interview-prep", label: "Interview Prep", icon: MessageSquare },
  { href: "/templates", label: "Templates", icon: LayoutTemplate },
  { href: "/recruiter", label: "Recruiters", icon: Users },
];

const RESOURCE_LINKS = [
  { href: "/tips", label: "Tips", icon: Lightbulb },
  { href: "/blog", label: "Blog", icon: BookOpen },
  { href: "/pricing", label: "Pricing", icon: DollarSign },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [resourcesOpen, setResourcesOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, status } = useSession();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const resourcesMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
      if (resourcesMenuRef.current && !resourcesMenuRef.current.contains(e.target as Node)) {
        setResourcesOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/[0.06] shadow-lg shadow-black/20"
          : "bg-transparent"
      }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group flex-shrink-0" aria-label="ResumeATS home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Resume<span className="text-indigo-400">ATS</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden lg:flex items-center gap-0.5">
            {PRIMARY_NAV_LINKS.map((link) => {
              const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`relative px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors ${
                    isActive
                      ? "text-indigo-400"
                      : "text-slate-400 hover:text-white"
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <motion.div
                      layoutId="navbar-indicator"
                      className="absolute inset-0 bg-indigo-500/[0.08] rounded-lg"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}

            <div className="relative ml-1" ref={resourcesMenuRef}>
              <button
                type="button"
                onClick={() => setResourcesOpen((open) => !open)}
                className={`relative flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[13px] font-medium transition-colors ${
                  RESOURCE_LINKS.some((link) => pathname.startsWith(link.href))
                    ? "text-indigo-400"
                    : "text-slate-400 hover:text-white"
                }`}
                aria-expanded={resourcesOpen}
                aria-haspopup="true"
              >
                Resources
                <ChevronDown className={`h-3.5 w-3.5 transition-transform ${resourcesOpen ? "rotate-180" : ""}`} />
                {RESOURCE_LINKS.some((link) => pathname.startsWith(link.href)) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute inset-0 rounded-lg bg-indigo-500/[0.08]"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
              </button>

              <AnimatePresence>
                {resourcesOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -6, scale: 0.98 }}
                    transition={{ duration: 0.16 }}
                    className="absolute right-0 top-full mt-2 w-48 overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0e0e18]/95 p-1.5 shadow-2xl backdrop-blur-xl"
                  >
                    {RESOURCE_LINKS.map((link) => {
                      const Icon = link.icon;
                      const isActive = pathname.startsWith(link.href);
                      return (
                        <Link
                          key={link.href}
                          href={link.href}
                          onClick={() => setResourcesOpen(false)}
                          className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm transition-colors ${
                            isActive
                              ? "bg-indigo-500/[0.08] text-indigo-300"
                              : "text-slate-300 hover:bg-white/[0.04] hover:text-white"
                          }`}
                        >
                          {Icon && <Icon className="h-4 w-4 opacity-70" />}
                          {link.label}
                        </Link>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop right side */}
          <div className="hidden lg:flex items-center gap-3">
            {session?.user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User avatar"}
                      width={28}
                      height={28}
                      className="rounded-full ring-2 ring-white/10"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="text-slate-300 text-sm max-w-[120px] truncate">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className={`w-3.5 h-3.5 text-slate-500 transition-transform ${userMenuOpen ? "rotate-180" : ""}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-card p-1 shadow-xl"
                      role="menu"
                    >
                      <div className="px-3 py-2 border-b border-white/5 mb-1">
                        <p className="text-white text-sm font-medium truncate">{session.user.name}</p>
                        <p className="text-slate-500 text-xs truncate">{session.user.email}</p>
                      </div>
                      <button
                        onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                        className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/8 text-sm transition-colors"
                        role="menuitem"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign out
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                {status !== "loading" && (
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-sm font-medium transition-colors"
                  >
                    Sign In
                  </Link>
                )}
                {status === "loading" && (
                  <div className="w-16 h-5 rounded bg-white/5 animate-pulse" />
                )}
                <Link
                  href="/analyze"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  Analyze Resume
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="lg:hidden border-t border-white/5 bg-[#0a0a0f]/98 backdrop-blur-xl overflow-hidden"
            role="menu"
          >
            <div className="px-4 py-4 space-y-1 max-h-[80vh] overflow-y-auto">
              {PRIMARY_NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== "/" && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? "text-indigo-400 bg-indigo-500/[0.08]"
                        : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                    }`}
                    role="menuitem"
                  >
                    {Icon && <Icon className="w-4 h-4 opacity-60" />}
                    {link.label}
                  </Link>
                );
              })}

              <div className="pt-3">
                <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  Resources
                </p>
                <div className="space-y-1">
                  {RESOURCE_LINKS.map((link) => {
                    const Icon = link.icon;
                    const isActive = pathname.startsWith(link.href);
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => {
                          setResourcesOpen(false);
                          setMobileOpen(false);
                        }}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                          isActive
                            ? "text-indigo-400 bg-indigo-500/[0.08]"
                            : "text-slate-400 hover:text-white hover:bg-white/[0.04]"
                        }`}
                        role="menuitem"
                      >
                        {Icon && <Icon className="w-4 h-4 opacity-60" />}
                        {link.label}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <div className="pt-3 pb-1 border-t border-white/5 mt-2 space-y-2">
                {session?.user ? (
                  <>
                    <div className="flex items-center gap-3 px-4 py-2">
                      {session.user.image ? (
                        <Image
                          src={session.user.image}
                          alt={session.user.name ?? "User"}
                          width={32}
                          height={32}
                          className="rounded-full ring-2 ring-white/10"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                          {session.user.name?.[0]?.toUpperCase() ?? "U"}
                        </div>
                      )}
                      <div>
                        <p className="text-white text-sm font-medium">{session.user.name}</p>
                        <p className="text-slate-500 text-xs">{session.user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm font-medium"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="flex items-center justify-center w-full py-2.5 rounded-xl border border-white/8 text-slate-300 text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/analyze"
                      className="flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold"
                    >
                      Analyze Resume Free
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
