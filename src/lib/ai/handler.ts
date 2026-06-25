import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { getSessionUser } from "@/features/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { deductCredits, getCreditBalance, addCredits } from "@/features/credits/service";
import { runAIAction } from "@/lib/ai/providers";
import { persistProcessedImage } from "@/lib/ai/storage";
import { getBrandContext } from "@/lib/ai/brand-context";
import { CREDIT_COSTS, ACTION_PROVIDER, type AIAction } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { checkRateLimit } from "@/lib/rate-limit";
import { sendEmail } from "@/lib/resend/client";
import { aiJobCompletedEmail, aiJobFailedEmail } from "@/lib/resend/templates";
import { triggerMakeWebhook } from "@/lib/make/client";

interface HandlerOptions<T> {
  action: AIAction;
  schema: ZodSchema<T>;
}

const IMAGE_ACTIONS: AIAction[] = [
  "remove-background",
  "product-studio",
  "object-cleanup",
  "enhance-image",
];

export async function handleAIRequest<T>(
  request: Request,
  { action, schema }: HandlerOptions<T>,
): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = checkRateLimit(`ai:${user.id}:${action}`, 30, 60_000);
  if (!rate.ok) {
    return NextResponse.json({ error: "rate_limit_exceeded" }, { status: 429 });
  }

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

  if (action === "generate-copy" || action === "product-studio") {
    const brand = await getBrandContext(user.id);
    if (brand) {
      if (!input.tone && brand.voice) input.tone = brand.voice;
      if (!input.brandVoice && brand.voice) input.brandVoice = brand.voice;
      if (action === "product-studio" && brand.colors.length && !input.prompt) {
        input.prompt = `Brand colors: ${brand.colors.join(", ")}. ${brand.name ?? "Product"} studio shot.`;
      }
    }
  }

  const cost = CREDIT_COSTS[action];
  const provider = ACTION_PROVIDER[action];

  const balance = await getCreditBalance(user.id);
  if (balance < cost) {
    return NextResponse.json(
      { error: "insufficient_credits", required: cost, available: balance },
      { status: 402 },
    );
  }

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

  let creditsDeducted = false;

  try {
    const result = await runAIAction(action, provider, input);

    const deduction = await deductCredits(user.id, cost, action.toUpperCase(), action);
    creditsDeducted = deduction.ok;

    let output = { ...result.output };
    const workspaceId =
      typeof input.workspaceId === "string" ? input.workspaceId : null;

    if (IMAGE_ACTIONS.includes(action)) {
      const imageUrl =
        typeof output.imageUrl === "string"
          ? output.imageUrl
          : typeof input.imageUrl === "string"
            ? input.imageUrl
            : null;
      if (imageUrl) {
        const saved = await persistProcessedImage(user.id, imageUrl, {
          action,
          jobId,
          workspaceId,
          sourceAssetId:
            typeof input.assetId === "string" ? input.assetId : undefined,
        });
        if (saved) {
          output = {
            ...output,
            assetId: saved.assetId,
            imageUrl: saved.signedUrl ?? imageUrl,
            savedToLibrary: true,
          };
        }
      }
    }

    if (admin && jobId) {
      await admin
        .from("ai_jobs")
        .update({ status: "succeeded", output_payload: output })
        .eq("id", jobId);
    }

    if (user.email) {
      const tpl = aiJobCompletedEmail(action);
      void sendEmail({ to: user.email, ...tpl });
    }
    void triggerMakeWebhook("ai.job.completed", {
      userId: user.id,
      jobId,
      action,
      mock: result.mock,
    });

    return NextResponse.json({
      jobId,
      mock: result.mock,
      output,
      creditCost: deduction.ok ? cost : 0,
      creditWarning: deduction.ok ? undefined : deduction.reason,
    });
  } catch (error) {
    await logError(`ai:${action}`, error, { jobId }, user.id);

    if (creditsDeducted) {
      await addCredits(user.id, cost, "AI_REFUND", `Refund for failed ${action}`);
    }

    if (admin && jobId) {
      await admin
        .from("ai_jobs")
        .update({ status: "failed", error_message: "Processing failed" })
        .eq("id", jobId);
    }

    if (user.email) {
      const tpl = aiJobFailedEmail(action);
      void sendEmail({ to: user.email, ...tpl });
    }
    void triggerMakeWebhook("ai.job.failed", { userId: user.id, jobId, action });

    return NextResponse.json({ error: "processing_failed" }, { status: 502 });
  }
}
