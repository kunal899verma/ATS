"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export function PageTracker() {
  const pathname = usePathname();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (lastTracked.current === pathname) return;
    lastTracked.current = pathname;

    if (pathname.startsWith("/admin") || pathname.startsWith("/api")) return;

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        pathname,
        referrer: document.referrer || undefined,
        title: document.title || undefined,
        screenResolution: `${window.screen.width}x${window.screen.height}`,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        language: navigator.language,
      }),
    }).catch(() => {});
  }, [pathname]);

  return null;
}
