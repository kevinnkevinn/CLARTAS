import { createAdminClient } from "@/lib/supabase/admin";
import { deductCredits, addCredits } from "@/features/credits/service";
import { runAIAction } from "@/lib/ai/providers";
import { persistProcessedImage } from "@/lib/ai/storage";
import { ACTION_PROVIDER, type AIAction } from "@/lib/constants";
import { logError } from "@/lib/logger";
import { sendEmail } from "@/lib/resend/client";
import { aiJobCompletedEmail, aiJobFailedEmail } from "@/lib/resend/templates";
import { triggerMakeWebhook } from "@/lib/make/client";

const IMAGE_ACTIONS: AIAction[] = [
  "remove-background",
  "product-studio",
  "object-cleanup",
  "enhance-image",
];

export interface ProcessJobParams {
  jobId: string | null;
  userId: string;
  userEmail: string | null;
  action: AIAction;
  input: Record<string, unknown>;
  cost: number;
}

export async function processAIJob(params: ProcessJobParams): Promise<Record<string, unknown>> {
  const { jobId, userId, userEmail, action, input, cost } = params;
  const provider = ACTION_PROVIDER[action];
  const admin = createAdminClient();
  let creditsDeducted = false;

  try {
    if (admin && jobId) {
      await admin.from("ai_jobs").update({ status: "processing" }).eq("id", jobId);
    }

    const result = await runAIAction(action, provider, input);
    const deduction = await deductCredits(userId, cost, action.toUpperCase(), action);
    creditsDeducted = deduction.ok;

    let output = { ...result.output };
    const workspaceId = typeof input.workspaceId === "string" ? input.workspaceId : null;

    if (IMAGE_ACTIONS.includes(action)) {
      const imageUrl =
        typeof output.imageUrl === "string"
          ? output.imageUrl
          : typeof input.imageUrl === "string"
            ? input.imageUrl
            : null;
      if (imageUrl) {
        const saved = await persistProcessedImage(userId, imageUrl, {
          action,
          jobId,
          workspaceId,
          sourceAssetId: typeof input.assetId === "string" ? input.assetId : undefined,
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

    if (userEmail) {
      const tpl = aiJobCompletedEmail(action);
      void sendEmail({ to: userEmail, ...tpl });
    }
    void triggerMakeWebhook("ai.job.completed", {
      userId,
      jobId,
      action,
      mock: result.mock,
    });

    return { output, mock: result.mock, creditCost: deduction.ok ? cost : 0 };
  } catch (error) {
    await logError(`ai:${action}`, error, { jobId }, userId);

    if (creditsDeducted) {
      await addCredits(userId, cost, "AI_REFUND", `Refund for failed ${action}`);
    }

    if (admin && jobId) {
      await admin
        .from("ai_jobs")
        .update({ status: "failed", error_message: "Processing failed" })
        .eq("id", jobId);
    }

    if (userEmail) {
      const tpl = aiJobFailedEmail(action);
      void sendEmail({ to: userEmail, ...tpl });
    }
    void triggerMakeWebhook("ai.job.failed", { userId, jobId, action });

    throw error;
  }
}

/** Fire-and-forget wrapper for async AI under load. */
export function enqueueAIJob(params: ProcessJobParams): void {
  void processAIJob(params).catch(() => {
    /* errors logged inside processAIJob */
  });
}
