import { NextResponse } from "next/server";
import { getSessionUser } from "@/features/auth/session";
import { triggerMakeWebhook } from "@/lib/make/client";

/** Authenticated proxy to fire a Make.com automation event for the current user. */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    event?: string;
    payload?: Record<string, unknown>;
  };
  if (!body.event) {
    return NextResponse.json({ error: "event_required" }, { status: 400 });
  }

  const ok = await triggerMakeWebhook(body.event, {
    ...(body.payload ?? {}),
    userId: user.id,
  });
  return NextResponse.json({ triggered: ok });
}
