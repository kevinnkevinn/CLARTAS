import { NextResponse } from "next/server";
import type { ZodSchema } from "zod";
import { getSessionUser } from "@/features/auth/session";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCreditBalance } from "@/features/credits/service";
import { getBrandContext } from "@/lib/ai/brand-context";
import { enqueueAIJob, processAIJob } from "@/lib/ai/process-job";
import { CREDIT_COSTS, ACTION_PROVIDER, type AIAction } from "@/lib/constants";
import { checkRateLimit } from "@/lib/rate-limit";

interface HandlerOptions<T> {
  action: AIAction;
  schema: ZodSchema<T>;
}

function isAsyncMode(request: Request): boolean {
  if (process.env.AI_ASYNC_JOBS === "false") return false;
  if (request.headers.get("x-clartas-sync") === "1") return false;
  const url = new URL(request.url);
  if (url.searchParams.get("sync") === "1") return false;
  return process.env.AI_ASYNC_JOBS === "true";
}

export async function handleAIRequest<T>(
  request: Request,
  { action, schema }: HandlerOptions<T>,
): Promise<NextResponse> {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rate = await checkRateLimit(`ai:${user.id}:${action}`, 30, 60_000);
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
        status: isAsyncMode(request) ? "queued" : "processing",
        input_payload: input,
        credit_cost: cost,
      })
      .select("id")
      .single();
    jobId = data?.id ?? null;
  }

  const jobParams = {
    jobId,
    userId: user.id,
    userEmail: user.email,
    action,
    input,
    cost,
  };

  if (isAsyncMode(request)) {
    enqueueAIJob(jobParams);
    return NextResponse.json(
      {
        jobId,
        status: "queued",
        pollUrl: jobId ? `/api/ai/jobs/${jobId}` : null,
        message: "Job queued. Poll pollUrl until status is succeeded or failed.",
      },
      { status: 202 },
    );
  }

  try {
    const result = await processAIJob(jobParams);
    return NextResponse.json({
      jobId,
      mock: result.mock,
      output: result.output,
      creditCost: result.creditCost,
    });
  } catch {
    return NextResponse.json({ error: "processing_failed" }, { status: 502 });
  }
}
