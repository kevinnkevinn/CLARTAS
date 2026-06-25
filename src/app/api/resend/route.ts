import { NextResponse } from "next/server";
import { getSessionUser } from "@/features/auth/session";
import { sendEmail } from "@/lib/resend/client";
import { onboardingEmail, operationalEmail } from "@/lib/resend/templates";

/**
 * Authenticated email trigger. Used for the onboarding email and operational
 * notifications. (Payment confirmation emails are sent from the Paddle webhook.)
 * In production, Make.com can also drive these flows automatically.
 */
export async function POST(request: Request) {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json().catch(() => ({}))) as {
    type?: "onboarding" | "operational";
    subject?: string;
    message?: string;
  };

  const tpl =
    body.type === "operational"
      ? operationalEmail(body.subject ?? "CLARTAS notification", body.message ?? "")
      : onboardingEmail(user.profile?.full_name ?? undefined);

  const sent = await sendEmail({ to: user.email, ...tpl });
  return NextResponse.json({ sent });
}
