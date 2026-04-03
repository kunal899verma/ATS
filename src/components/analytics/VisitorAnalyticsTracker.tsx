"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

export default function VisitorAnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const previousPath = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;

    const query = searchParams.toString();
    const fullPath = query ? `${pathname}?${query}` : pathname;

    if (previousPath.current === fullPath) return;

    const payload = {
      pathname: fullPath,
      referrer: previousPath.current ?? document.referrer ?? "",
      title: document.title ?? "",
    };

    previousPath.current = fullPath;

    void fetch("/api/analytics/page-view", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      keepalive: true,
      body: JSON.stringify(payload),
    }).catch(() => {
      // Ignore analytics failures — they should never break navigation
    });
  }, [pathname, searchParams]);

  return null;
}
