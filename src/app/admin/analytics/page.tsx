import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  BarChart3,
  Globe2,
  MapPin,
  Shield,
  Sparkles,
  UserRound,
} from "lucide-react";
import { auth } from "@/auth";
import Navbar from "@/components/ui/Navbar";
import {
  getAnalyticsSnapshot,
  isAdminEmail,
} from "@/lib/visitor-analytics";

export const dynamic = "force-dynamic";

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function eventLabel(type: string) {
  switch (type) {
    case "sign_in":
      return "Sign-in";
    case "analysis":
      return "Analysis";
    default:
      return "Page view";
  }
}

export default async function AdminAnalyticsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login?callbackUrl=/admin/analytics");
  }

  if (!isAdminEmail(session.user.email)) {
    return (
      <main className="min-h-screen bg-[var(--bg-primary)]">
        <Navbar />
        <div className="page-shell pt-24 sm:pt-28 pb-16">
          <div className="glass-card border border-red-500/20 p-6 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-red-500/10 text-red-300">
              <Shield className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-semibold text-white">Analytics access is restricted</h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              Add your email to the `ADMIN_EMAILS` environment variable to unlock the owner dashboard for this account.
            </p>
            <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 font-mono text-xs text-slate-300">
              ADMIN_EMAILS={session.user.email}
            </p>
            <p className="mt-3 text-xs text-slate-500">
              Signed in as: {session.user.email}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const snapshot = await getAnalyticsSnapshot(120);

  const summaryCards = [
    { label: "Page Views", value: snapshot.totalPageViews, icon: Activity, accent: "text-cyan-300" },
    { label: "Unique Visitors", value: snapshot.uniqueVisitors, icon: UserRound, accent: "text-violet-300" },
    { label: "Signed-in Users", value: snapshot.signedInUsers, icon: Shield, accent: "text-emerald-300" },
    { label: "Resume Analyses", value: snapshot.analysesRun, icon: Sparkles, accent: "text-amber-300" },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />

      <div className="page-shell pt-24 sm:pt-28 pb-16 space-y-6">
        <section className="glass-card border border-white/[0.06] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="page-eyebrow">Owner Dashboard</div>
              <h1 className="mt-3 text-3xl font-semibold text-white">Visitor & location analytics</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
                See who is using the product, which pages they touch, and where traffic is coming from. This dashboard uses Vercel Blob for persistent event storage.
              </p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 text-sm ${snapshot.configured ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-amber-500/20 bg-amber-500/10 text-amber-300"}`}>
              {snapshot.configured ? "Persistent tracking enabled" : "Blob storage not configured"}
            </div>
          </div>
        </section>

        {!snapshot.configured && (
          <section className="glass-card border border-amber-500/20 bg-amber-500/[0.04] p-5">
            <h2 className="text-sm font-semibold text-amber-200">One setup step left</h2>
            <p className="mt-2 text-sm leading-relaxed text-amber-100/80">
              Add a Blob store to your Vercel project so page visits and locations persist across serverless invocations.
            </p>
            <div className="mt-4 space-y-2 rounded-2xl border border-white/[0.06] bg-[#05070d] px-4 py-3 font-mono text-xs text-slate-300">
              <p>1. In Vercel, create a Blob store for this project.</p>
              <p>2. Pull the generated `BLOB_READ_WRITE_TOKEN` into the project environment.</p>
              <p>3. Redeploy, then revisit this dashboard.</p>
            </div>
          </section>
        )}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {summaryCards.map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="glass-card border border-white/[0.06] p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">{label}</p>
                  <p className="mt-3 text-3xl font-semibold text-white">{value}</p>
                </div>
                <div className={`rounded-2xl bg-white/[0.04] p-3 ${accent}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </div>
          ))}
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="glass-card border border-white/[0.06] p-5">
            <div className="mb-4 flex items-center gap-3">
              <BarChart3 className="h-4 w-4 text-cyan-300" />
              <h2 className="text-lg font-semibold text-white">Top pages</h2>
            </div>
            <div className="space-y-3">
              {snapshot.topPages.length > 0 ? snapshot.topPages.map((entry) => (
                <div key={entry.label} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <span className="truncate pr-3 text-sm text-slate-300">{entry.label}</span>
                  <span className="rounded-full bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">{entry.count}</span>
                </div>
              )) : (
                <p className="text-sm text-slate-500">No tracked page views yet.</p>
              )}
            </div>
          </div>

          <div className="glass-card border border-white/[0.06] p-5">
            <div className="mb-4 flex items-center gap-3">
              <Globe2 className="h-4 w-4 text-violet-300" />
              <h2 className="text-lg font-semibold text-white">Top locations</h2>
            </div>
            <div className="space-y-3">
              {snapshot.topLocations.length > 0 ? snapshot.topLocations.map((entry) => (
                <div key={entry.label} className="flex items-center justify-between rounded-2xl border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                  <span className="truncate pr-3 text-sm text-slate-300">{entry.label}</span>
                  <span className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-300">{entry.count}</span>
                </div>
              )) : (
                <p className="text-sm text-slate-500">Location data will appear once traffic is tracked.</p>
              )}
            </div>
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
          <div className="glass-card border border-white/[0.06] p-5">
            <div className="mb-4 flex items-center gap-3">
              <Shield className="h-4 w-4 text-emerald-300" />
              <h2 className="text-lg font-semibold text-white">Known users</h2>
            </div>
            <div className="space-y-3">
              {snapshot.recentUsers.length > 0 ? snapshot.recentUsers.map((user) => (
                <div key={user.email} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium text-white">{user.name}</p>
                      <p className="mt-1 text-xs text-slate-400">{user.email}</p>
                    </div>
                    <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-semibold text-emerald-300">
                      {user.visits} visits
                    </span>
                  </div>
                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-slate-400">
                    <span>Analyses: {user.analyses}</span>
                    <span>Seen: {formatTimestamp(user.lastSeen)}</span>
                    <span className="col-span-2 truncate">Location: {user.location}</span>
                    <span className="col-span-2 truncate">Providers: {user.providers.join(", ") || "unknown"}</span>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-500">Signed-in visitors will appear here after they browse the site.</p>
              )}
            </div>
          </div>

          <div className="glass-card border border-white/[0.06] p-5">
            <div className="mb-4 flex items-center gap-3">
              <MapPin className="h-4 w-4 text-amber-300" />
              <h2 className="text-lg font-semibold text-white">Recent activity</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-[0.16em] text-slate-500">
                    <th className="pb-3 font-medium">When</th>
                    <th className="pb-3 font-medium">Type</th>
                    <th className="pb-3 font-medium">User / Visitor</th>
                    <th className="pb-3 font-medium">Page</th>
                    <th className="pb-3 font-medium">Location</th>
                    <th className="pb-3 font-medium">Device</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {snapshot.recentEvents.length > 0 ? snapshot.recentEvents.slice(0, 30).map((event) => (
                    <tr key={event.id} className="align-top">
                      <td className="py-3 pr-4 text-slate-400">{formatTimestamp(event.createdAt)}</td>
                      <td className="py-3 pr-4">
                        <span className="rounded-full bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-slate-300">
                          {eventLabel(event.type)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="space-y-1">
                          <p className="text-white">{event.userEmail || event.visitorId}</p>
                          {event.userName && <p className="text-xs text-slate-500">{event.userName}</p>}
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-slate-300">
                        {event.pathname || event.detectedRole || "—"}
                      </td>
                      <td className="py-3 pr-4 text-slate-400">{[event.city, event.region, event.country].filter(Boolean).join(", ") || "Unknown"}</td>
                      <td className="py-3 text-slate-400">{[event.browser, event.deviceType].filter(Boolean).join(" · ") || "Unknown"}</td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-sm text-slate-500">
                        No analytics events recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="glass-card border border-white/[0.06] p-5 text-sm text-slate-400">
          <p className="font-medium text-white">Open this dashboard later at <Link href="/admin/analytics" className="text-cyan-300 hover:text-cyan-200">/admin/analytics</Link></p>
          <p className="mt-2 leading-relaxed">
            The visitor table stores masked IPs only, plus approximate location data from Vercel request headers. If you want richer reporting later, we can add charting, date filters, and export.
          </p>
        </section>
      </div>
    </main>
  );
}
