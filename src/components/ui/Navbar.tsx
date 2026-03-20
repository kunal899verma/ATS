"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Zap, Menu, X, LogOut, ChevronDown } from "lucide-react";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/analyze", label: "Analyze Resume" },
  { href: "/recruiter", label: "Recruiters" },
  { href: "/templates", label: "Templates" },
  { href: "/tips", label: "ATS Tips" },
  { href: "/blog", label: "Blog" },
  { href: "/pricing", label: "Pricing" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { data: session, status } = useSession();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020817]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">
              Resume<span className="text-cyan-400">ATS</span>
            </span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                  pathname === link.href
                    ? "text-cyan-400 bg-cyan-500/8"
                    : "text-slate-400 hover:text-white hover:bg-white/4"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Desktop right side */}
          <div className="hidden md:flex items-center gap-3">
            {session?.user ? (
              /* Logged-in: avatar dropdown */
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-white/5 transition-colors"
                >
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={28}
                      height={28}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <span className="text-slate-300 text-sm max-w-[120px] truncate">
                    {session.user.name?.split(" ")[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 max-w-[calc(100vw-2rem)] glass rounded-xl border border-white/8 p-1 shadow-xl shadow-black/40 animate-fade-in">
                    <div className="px-3 py-2 border-b border-white/5 mb-1">
                      <p className="text-white text-sm font-medium truncate">{session.user.name}</p>
                      <p className="text-slate-500 text-xs truncate">{session.user.email}</p>
                    </div>
                    <button
                      onClick={() => { setUserMenuOpen(false); signOut({ callbackUrl: "/" }); }}
                      className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-red-500/8 text-sm transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not logged in (includes loading state) — always show both buttons */
              <>
                {status !== "loading" && (
                  <Link
                    href="/login"
                    className="px-3 py-1.5 rounded-lg text-slate-400 hover:text-white text-sm transition-colors"
                  >
                    Sign In
                  </Link>
                )}
                {status === "loading" && (
                  <div className="w-16 h-5 rounded bg-white/5 animate-pulse" />
                )}
                <Link
                  href="/analyze"
                  className="px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-medium hover:opacity-90 transition-opacity shadow-lg shadow-cyan-500/20"
                >
                  Check My Resume
                </Link>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <button
            className="md:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-white/5 bg-[#020817]/95 backdrop-blur-xl px-4 py-4 space-y-1 animate-fade-in">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "text-cyan-400 bg-cyan-500/8"
                  : "text-slate-400 hover:text-white hover:bg-white/4"
              }`}
            >
              {link.label}
            </Link>
          ))}

          <div className="pt-2 pb-1 space-y-2">
            {session?.user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  {session.user.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name ?? "User"}
                      width={32}
                      height={32}
                      className="rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                      {session.user.name?.[0]?.toUpperCase() ?? "U"}
                    </div>
                  )}
                  <div>
                    <p className="text-white text-sm font-medium">{session.user.name}</p>
                    <p className="text-slate-500 text-xs">{session.user.email}</p>
                  </div>
                </div>
                <button
                  onClick={() => { setMobileOpen(false); signOut({ callbackUrl: "/" }); }}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-red-500/20 text-red-400 text-sm"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-2.5 rounded-xl border border-white/8 text-slate-300 text-sm font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/analyze"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-center w-full py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-violet-600 text-white text-sm font-semibold"
                >
                  Check My Resume Free
                </Link>
              </>
            )}
          </div>

        </div>
      )}
    </nav>
  );
}
