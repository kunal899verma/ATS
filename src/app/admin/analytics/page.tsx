import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Activity,
  BarChart3,
  Clock,
  Cpu,
  Globe2,
  Languages,
  LayoutGrid,
  Mail,
  MapPin,
  Monitor,
  Phone,
  Shield,
  Smartphone,
  Sparkles,
  Tablet,
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

function formatDate(value?: string) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
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

function scoreColor(score?: number) {
  if (score === undefined) return "text-slate-400";
  if (score >= 80) return "text-emerald-300";
  if (score >= 60) return "text-amber-300";
  return "text-red-400";
}

function gradeBadgeClass(grade?: string) {
  if (!grade) return "bg-slate-500/10 text-slate-400";
  const g = grade.toUpperCase();
  if (g.startsWith("A")) return "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20";
  if (g.startsWith("B")) return "bg-cyan-500/15 text-cyan-300 border border-cyan-500/20";
  if (g.startsWith("C")) return "bg-amber-500/15 text-amber-300 border border-amber-500/20";
  return "bg-red-500/15 text-red-400 border border-red-500/20";
}

function DeviceIcon({ type }: { type?: string }) {
  if (type === "mobile") return <Smartphone className="h-3.5 w-3.5 text-violet-300" />;
  if (type === "tablet") return <Tablet className="h-3.5 w-3.5 text-amber-300" />;
  return <Monitor className="h-3.5 w-3.5 text-cyan-300" />;
}

function ProviderBadge({ provider }: { provider: string }) {
  const isGoogle = provider.toLowerCase().includes("google");
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${
      isGoogle
        ? "bg-blue-500/15 text-blue-300 border border-blue-500/20"
        : "bg-slate-500/15 text-slate-300 border border-slate-500/20"
    }`}>
      {isGoogle ? "Google" : provider}
    </span>
  );
}

function Avatar({ name, image }: { name: string; image?: string }) {
  if (image) {
    // eslint-disable-next-line @next/next/no-img-element
    return (
      <img
        src={image}
        alt={name}
        className="h-10 w-10 rounded-full object-cover ring-1 ring-white/10 flex-shrink-0"
      />
    );
  }
  const initials = name.split(" ").map((p: string) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  return (
    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white ring-1 ring-white/10 flex-shrink-0">
      {initials}
    </div>
  );
}

type UserEntry = {
  email: string;
  name: string;
  image?: string;
  phone?: string;
  visits: number;
  analyses: number;
  signIns: number;
  lastSeen: string;
  firstSeen: string;
  signUpAt?: string;
  location: string;
  lastDevice: string;
  lastBrowser: string;
  providers: string[];
  devices: string[];
  browsers: string[];
  lastScore?: number;
  lastGrade?: string;
  lastRole?: string;
  os: string[];
  timezone?: string;
  language?: string;
  screenResolution?: string;
  pagesVisited: string[];
};

function UserCard({ user }: { user: UserEntry }) {
  const displayedPages = user.pagesVisited.slice(0, 6);
  const extraPages = user.pagesVisited.length - displayedPages.length;

  return (
    <div className="glass-card border border-white/[0.06] rounded-2xl p-5 space-y-4">
      {/* Header row: avatar + name + email */}
      <div className="flex items-center gap-3">
        <Avatar name={user.name} image={user.image} />
        <div className="min-w-0">
          <p className="font-semibold text-white leading-tight truncate">{user.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <Mail className="h-3 w-3 text-slate-500 flex-shrink-0" />
            <p className="text-xs text-slate-400 truncate">{user.email}</p>
          </div>
        </div>
        {/* Provider badges pushed right */}
        <div className="ml-auto flex flex-wrap gap-1 justify-end">
          {user.providers.length > 0
            ? user.providers.map(p => <ProviderBadge key={p} provider={p} />)
            : <span className="text-[10px] text-slate-600">Unknown provider</span>
          }
        </div>
      </div>

      {/* Identity row */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
        <div className="flex items-center gap-1.5">
          <Phone className="h-3 w-3 text-slate-500 flex-shrink-0" />
          <span className={user.phone ? "text-slate-300" : "text-slate-600"}>
            {user.phone ?? "—"}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="h-3 w-3 text-slate-500 flex-shrink-0" />
          <span className="text-slate-400">Signed up {formatDate(user.signUpAt)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-slate-500 flex-shrink-0" />
          <span className="text-slate-400">First seen {formatDate(user.firstSeen)}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="h-3 w-3 text-cyan-500 flex-shrink-0" />
          <span className="text-slate-400">Last seen {formatTimestamp(user.lastSeen)}</span>
        </div>
      </div>

      <div className="border-t border-white/[0.05]" />

      {/* Location + Tech row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Location */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600 font-medium">Location</p>
          {user.location && user.location !== "Unknown" ? (
            <div className="flex items-start gap-1.5">
              <MapPin className="h-3.5 w-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
              <span className="text-slate-300 leading-snug">{user.location}</span>
            </div>
          ) : (
            <span className="text-slate-600">—</span>
          )}
        </div>

        {/* Tech */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600 font-medium">Tech</p>
          <div className="space-y-1">
            {user.os.length > 0 && (
              <div className="flex items-center gap-1.5">
                <Cpu className="h-3 w-3 text-indigo-400 flex-shrink-0" />
                <span className="text-slate-300">{user.os.join(", ")}</span>
              </div>
            )}
            {user.devices.length > 0 && (
              <div className="flex items-center gap-1.5">
                <DeviceIcon type={user.devices[0]} />
                <span className="text-slate-300 capitalize">{user.devices[0]}</span>
                {user.lastBrowser && user.lastBrowser !== "Unknown" && (
                  <span className="text-slate-500">· {user.lastBrowser}</span>
                )}
              </div>
            )}
            {user.screenResolution && (
              <div className="flex items-center gap-1.5">
                <Monitor className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-slate-400">{user.screenResolution}</span>
              </div>
            )}
            {user.timezone && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-slate-400 truncate">{user.timezone}</span>
              </div>
            )}
            {user.language && (
              <div className="flex items-center gap-1.5">
                <Languages className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-slate-400">{user.language}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border-t border-white/[0.05]" />

      {/* Last analysis + Pages visited */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        {/* Last analysis */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600 font-medium">Last Analysis</p>
          {user.lastScore !== undefined ? (
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className={`text-lg font-bold ${scoreColor(user.lastScore)}`}>{user.lastScore}</span>
                {user.lastGrade && (
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${gradeBadgeClass(user.lastGrade)}`}>
                    {user.lastGrade}
                  </span>
                )}
              </div>
              {user.lastRole && (
                <p className="text-slate-400 truncate">{user.lastRole}</p>
              )}
            </div>
          ) : (
            <span className="text-slate-600">No analysis yet</span>
          )}
        </div>

        {/* Pages visited */}
        <div className="space-y-1.5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-slate-600 font-medium">Pages Visited</p>
          {displayedPages.length > 0 ? (
            <div className="space-y-0.5">
              {displayedPages.map(page => (
                <p key={page} className="text-slate-400 truncate font-mono text-[11px]">{page}</p>
              ))}
              {extraPages > 0 && (
                <p className="text-slate-600 text-[11px]">+{extraPages} more</p>
              )}
            </div>
          ) : (
            <span className="text-slate-600">—</span>
          )}
        </div>
      </div>

      {/* Activity counts footer */}
      <div className="flex items-center gap-4 pt-1 text-xs border-t border-white/[0.05]">
        <div className="flex items-center gap-1.5">
          <LayoutGrid className="h-3 w-3 text-cyan-400" />
          <span className="text-slate-400">{user.visits} page views</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3 w-3 text-amber-400" />
          <span className="text-slate-400">{user.analyses} analyses</span>
        </div>
      </div>
    </div>
  );
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
              Add your email to the <code className="text-slate-300">ADMIN_EMAILS</code> environment variable.
            </p>
            <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3 font-mono text-xs text-slate-300">
              ADMIN_EMAILS={session.user.email}
            </p>
          </div>
        </div>
      </main>
    );
  }

  const snapshot = await getAnalyticsSnapshot(200);

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

        {/* Header */}
        <section className="glass-card border border-white/[0.06] p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="page-eyebrow">Owner Dashboard</div>
              <h1 className="mt-3 text-3xl font-semibold text-white">Analytics & User Details</h1>
              <p className="mt-2 max-w-3xl text-sm leading-relaxed text-slate-400">
                Real-time user details, login type, location, device, OS, and analysis data. Vercel Blob stores all events persistently.
              </p>
            </div>
            <div className={`rounded-2xl border px-4 py-3 text-sm ${snapshot.configured ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-300" : "border-amber-500/20 bg-amber-500/10 text-amber-300"}`}>
              {snapshot.configured ? "Persistent tracking enabled" : "Blob storage not configured"}
            </div>
          </div>
        </section>

        {/* Summary cards */}
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

        {/* Registered Users — card grid */}
        <section className="glass-card border border-white/[0.06] p-5">
          <div className="mb-5 flex items-center gap-3">
            <UserRound className="h-4 w-4 text-emerald-300" />
            <h2 className="text-lg font-semibold text-white">Registered Users</h2>
            <span className="ml-auto rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-300 border border-emerald-500/20">
              {snapshot.recentUsers.length} users
            </span>
          </div>

          {snapshot.recentUsers.length > 0 ? (
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {snapshot.recentUsers.map((user) => (
                <UserCard key={user.email} user={user} />
              ))}
            </div>
          ) : (
            <div className="py-10 text-center">
              <UserRound className="h-8 w-8 text-slate-600 mx-auto mb-3" />
              <p className="text-sm text-slate-500">No signed-in users yet.</p>
              <p className="mt-1 text-xs text-slate-600">Users will appear here after their first login.</p>
            </div>
          )}
        </section>

        {/* Top pages + locations */}
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

        {/* Recent activity */}
        <section className="glass-card border border-white/[0.06] p-5">
          <div className="mb-4 flex items-center gap-3">
            <MapPin className="h-4 w-4 text-amber-300" />
            <h2 className="text-lg font-semibold text-white">Recent activity</h2>
            <span className="ml-auto text-xs text-slate-500">{snapshot.recentEvents.length} events total</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] text-left text-sm">
              <thead>
                <tr className="border-b border-white/[0.06] text-xs uppercase tracking-[0.16em] text-slate-500">
                  <th className="pb-3 pr-4 font-medium">When</th>
                  <th className="pb-3 pr-4 font-medium">Type</th>
                  <th className="pb-3 pr-4 font-medium">User / Visitor</th>
                  <th className="pb-3 pr-4 font-medium">Page</th>
                  <th className="pb-3 pr-4 font-medium">Location</th>
                  <th className="pb-3 font-medium">Device</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {snapshot.recentEvents.length > 0 ? snapshot.recentEvents.slice(0, 40).map((event) => (
                  <tr key={event.id} className="align-top hover:bg-white/[0.02] transition-colors">
                    <td className="py-3 pr-4 text-slate-400 text-xs whitespace-nowrap">{formatTimestamp(event.createdAt)}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                        event.type === "sign_in"
                          ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          : event.type === "analysis"
                            ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                            : "bg-white/[0.04] text-slate-300 border border-white/[0.06]"
                      }`}>
                        {eventLabel(event.type)}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div>
                        <p className="text-white text-xs font-medium">{event.userName || event.userEmail || "—"}</p>
                        {event.userEmail && event.userName && (
                          <p className="mt-0.5 text-[11px] text-slate-500 truncate max-w-[160px]">{event.userEmail}</p>
                        )}
                        {!event.userEmail && (
                          <p className="mt-0.5 text-[11px] text-slate-600 font-mono truncate max-w-[140px]">{event.visitorId}</p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-slate-300 text-xs">
                      {event.pathname || event.detectedRole || "—"}
                    </td>
                    <td className="py-3 pr-4 text-slate-400 text-xs">
                      {[event.city, event.region, event.country].filter(Boolean).join(", ") || "—"}
                    </td>
                    <td className="py-3 text-slate-400 text-xs">
                      <div className="flex items-center gap-1.5">
                        <DeviceIcon type={event.deviceType} />
                        <span>{[event.browser, event.deviceType].filter(Boolean).join(" · ") || "—"}</span>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                      No analytics events recorded yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="glass-card border border-white/[0.06] p-5 text-sm text-slate-400">
          <p className="font-medium text-white">
            Dashboard at <Link href="/admin/analytics" className="text-cyan-300 hover:text-cyan-200">/admin/analytics</Link>
          </p>
          <p className="mt-2 leading-relaxed">
            Page views are tracked via <code className="text-slate-300">/api/analytics/track</code> — location from Vercel geo headers, device and OS from user-agent, screen resolution/timezone/language from the browser. Sign-in events capture name, email, phone (if provided by Google), provider, and sign-up date.
          </p>
        </section>
      </div>
    </main>
  );
}
