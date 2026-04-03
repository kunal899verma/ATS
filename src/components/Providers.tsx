"use client";

import { Suspense } from "react";
import { SessionProvider } from "next-auth/react";
import VisitorAnalyticsTracker from "@/components/analytics/VisitorAnalyticsTracker";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Suspense fallback={null}>
        <VisitorAnalyticsTracker />
      </Suspense>
      {children}
    </SessionProvider>
  );
}
