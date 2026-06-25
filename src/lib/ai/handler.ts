import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { getSessionUser } from "@/features/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { deductCredits, getCreditBalance } from "@/features/credits/service";
import { runAIAction } from "@/lib/ai/providers";
import { CREDIT_COSTS, ACTION_PROVIDER, type AIAction } from "@/lib/constants";
import { logError } from "@/lib/logger";

interface HandlerOptions<T> {
  action: AIAction;
  schema: ZodSchema<T>;
}

/**
 * Shared, secure pipeline for every AI route handler:
 *  1. Require an authenticated user.
 *  2. Validate the JSON body.
 *  3. Check the AI credit balance (block if insufficient).
 *  4. Create an ai_jobs row.
 *  5. Run the AI action server-side (keys never leave the server).
 *  6. Deduct credits only after a successful run.
 *  7. Return a clean JSON response and log errors without leaking secrets.
 */
export async function handleAIRequest<T>(
  request: Request,
  { action, schema }: HandlerOptions<T>,
): Promise<NextResponse> {
  // 1. Auth
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // 2. Validate
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 },
    );
  }
  const input = parsed.data as Record<string, unknown>;

  const cost = CREDIT_COSTS[action];
  const provider = ACTION_PROVIDER[action];

  // 3. Credit check
  const balance = await getCreditBalance(user.id);
  if (balance < cost) {
    return NextResponse.json(
      { error: "insufficient_credits", required: cost, available: balance },
      { status: 402 },
    );
  }

  // 4. Create job row (best-effort; requires service role)
  const admin = createAdminClient();
  let jobId: string | null = null;
  if (admin) {
    const { data } = await admin
      .from("ai_jobs")
      .insert({
        user_id: user.id,
        action,
        provider,
        status: "processing",
        input_payload: input,
        credit_cost: cost,
      })
      .select("id")
      .single();
    jobId = data?.id ?? null;
  }

  // 5. Run
  try {
    const result = await runAIAction(action, provider, input);

    // 6. Deduct credits after success
    const deduction = await deductCredits(user.id, cost, action.toUpperCase(), action);

    if (admin && jobId) {
      await admin
        .from("ai_jobs")
        .update({ status: "succeeded", output_payload: result.output })
        .eq("id", jobId);
    }

    return NextResponse.json({
      jobId,
      mock: result.mock,
      output: result.output,
      creditCost: deduction.ok ? cost : 0,
      creditWarning: deduction.ok ? undefined : deduction.reason,
    });
  } catch (error) {
    await logError(`ai:${action}`, error, { jobId }, user.id);
    if (admin && jobId) {
      await admin
        .from("ai_jobs")
        .update({ status: "failed", error_message: "Processing failed" })
        .eq("id", jobId);
    }
    return NextResponse.json({ error: "processing_failed" }, { status: 502 });
  }
}
