import { handlers } from "@/auth";
import type { NextRequest } from "next/server";

// Wrap handlers to match Next.js 16 route signature (which requires context param)
export function GET(req: NextRequest) {
  return handlers.GET(req);
}

export function POST(req: NextRequest) {
  return handlers.POST(req);
}
