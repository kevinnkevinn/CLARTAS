import { NextResponse } from "next/server";
import { isSupabaseConfigured, isAiMockMode } from "@/lib/env";
import { isDemoMode } from "@/lib/demo/config";

/** Endpoint kesehatan untuk load balancer / monitoring deploy. */
export async function GET() {
  const checks = {
    status: "ok" as "ok" | "degraded",
    timestamp: new Date().toISOString(),
    demoMode: isDemoMode(),
    supabase: isSupabaseConfigured,
    aiMock: isAiMockMode(),
    version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "local",
  };

  if (!checks.supabase || checks.demoMode) {
    checks.status = "degraded";
  }

  return NextResponse.json(checks, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}
