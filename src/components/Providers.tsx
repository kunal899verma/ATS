"use client";

import { SessionProvider } from "next-auth/react";
import VisitorAnalyticsTracker from "@/components/analytics/VisitorAnalyticsTracker";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <VisitorAnalyticsTracker />
      {children}
    </SessionProvider>
  );
}
