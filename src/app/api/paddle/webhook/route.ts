import { NextResponse } from "next/server";
import { verifyPaddleSignature } from "@/lib/paddle/verify";
import { createAdminClient } from "@/lib/supabase/admin";
import { logError } from "@/lib/logger";
import { sendEmail } from "@/lib/resend/client";
import { paymentConfirmationEmail } from "@/lib/resend/templates";
import { triggerMakeWebhook } from "@/lib/make/client";
import { addCredits } from "@/features/credits/service";
import { PLANS, type PlanId } from "@/lib/constants";

interface PaddleEvent {
  event_type: string;
  data: Record<string, unknown> & {
    id?: string;
    status?: string;
    customer_id?: string;
    subscription_id?: string;
    custom_data?: { user_id?: string } | null;
    items?: Array<{ price?: { name?: string }; product?: { name?: string } }>;
    details?: { totals?: { total?: string; currency_code?: string } };
    current_billing_period?: { ends_at?: string };
  };
}

/** Resolve our internal user id from Paddle custom_data or by customer email. */
async function resolveUserId(
  admin: ReturnType<typeof createAdminClient>,
  data: PaddleEvent["data"],
): Promise<string | null> {
  if (data.custom_data?.user_id) return data.custom_data.user_id;
  const email = (data as { customer?: { email?: string }; email?: string }).email
    ?? (data as { customer?: { email?: string } }).customer?.email;
  if (admin && email) {
    const { data: profile } = await admin
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle();
    return profile?.id ?? null;
  }
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("paddle-signature");

  // 1. Verify signature; reject invalid payloads.
  if (!verifyPaddleSignature(rawBody, signature)) {
    return NextResponse.json({ error: "invalid_signature" }, { status: 401 });
  }

  let event: PaddleEvent;
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const admin = createAdminClient();
  if (!admin) {
    // We accept (200) so Paddle doesn't retry forever, but log the misconfig.
    await logError("paddle:webhook", new Error("Service role not configured"), {
      event: event.event_type,
    });
    return NextResponse.json({ received: true, persisted: false });
  }

  try {
    const userId = await resolveUserId(admin, event.data);

    switch (event.event_type) {
      case "subscription.created":
      case "subscription.updated":
      case "subscription.activated":
      case "subscription.canceled": {
        const status =
          event.event_type === "subscription.canceled"
            ? "canceled"
            : (event.data.status as string) || "active";
        const planName =
          event.data.items?.[0]?.price?.name ??
          event.data.items?.[0]?.product?.name ??
          "premium";

        if (userId) {
          await admin.from("subscriptions").upsert(
            {
              user_id: userId,
              paddle_customer_id: event.data.customer_id ?? null,
              paddle_subscription_id: event.data.id ?? null,
              status,
              plan_name: planName,
              current_period_end: event.data.current_billing_period?.ends_at ?? null,
            },
            { onConflict: "paddle_subscription_id" },
          );

          await admin
            .from("profiles")
            .update({ plan_status: status === "canceled" ? "free" : planName })
            .eq("id", userId);

          // Grant monthly credits on (re)activation.
          if (status !== "canceled") {
            const planId = (planName.toLowerCase() as PlanId) in PLANS
              ? (planName.toLowerCase() as PlanId)
              : "premium";
            await addCredits(userId, PLANS[planId].credits, "SUBSCRIPTION_GRANT", planName);
          }
        }
        break;
      }

      case "transaction.completed": {
        const total = event.data.details?.totals?.total ?? "0";
        const currency = event.data.details?.totals?.currency_code ?? "USD";

        await admin.from("transactions").insert({
          user_id: userId,
          amount: Number(total) / 100, // Paddle totals are in minor units
          currency,
          status: "completed",
          gateway_ref: event.data.id ?? null,
          raw_payload: event.data,
        });

        // Invoice / payment confirmation email + automation hook (placeholders).
        const email = (event.data as { customer?: { email?: string } }).customer?.email;
        if (email) {
          const tpl = paymentConfirmationEmail("CLARTAS", `${Number(total) / 100} ${currency}`);
          await sendEmail({ to: email, ...tpl });
        }
        await triggerMakeWebhook("transaction.completed", {
          userId,
          amount: Number(total) / 100,
          currency,
          ref: event.data.id,
        });
        break;
      }

      default:
        // Unhandled event types are acknowledged without action.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    await logError("paddle:webhook", error, { event: event.event_type });
    return NextResponse.json({ error: "processing_error" }, { status: 500 });
  }
}
