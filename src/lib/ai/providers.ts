import { getFalKey, getReplicateToken, isAiMockMode } from "@/lib/env";
import type { AIAction } from "@/lib/constants";

/**
 * Thin AI provider layer. All calls happen SERVER-SIDE only; keys never reach
 * the client. When no provider key is configured we run in MOCK mode and return
 * clearly-labeled simulated output instead of failing — useful for local dev.
 */

export interface AIResult {
  mock: boolean;
  output: Record<string, unknown>;
}

const FAL_ENDPOINTS: Partial<Record<AIAction, string>> = {
  "remove-background": "fal-ai/birefnet/bg-removal",
  "product-studio": "fal-ai/flux/dev",
  "object-cleanup": "fal-ai/flux/dev/image-to-image",
  "video-slideshow": "fal-ai/ltx-video",
};

const REPLICATE_MODELS: Partial<Record<AIAction, string>> = {
  "enhance-image": "nightmareai/real-esrgan",
  "text-to-speech": "jaaari/kokoro-82m",
};

/** Call fal.ai REST queue API with the server key. */
async function callFal(endpoint: string, input: Record<string, unknown>): Promise<unknown> {
  const res = await fetch(`https://fal.run/${endpoint}`, {
    method: "POST",
    headers: {
      Authorization: `Key ${getFalKey()}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });
  if (!res.ok) {
    throw new Error(`fal.ai request failed with status ${res.status}`);
  }
  return res.json();
}

/** Call Replicate's synchronous-ish predictions API with the server token. */
async function callReplicate(
  model: string,
  input: Record<string, unknown>,
): Promise<unknown> {
  const res = await fetch(`https://api.replicate.com/v1/models/${model}/predictions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getReplicateToken()}`,
      "Content-Type": "application/json",
      Prefer: "wait",
    },
    body: JSON.stringify({ input }),
  });
  if (!res.ok) {
    throw new Error(`Replicate request failed with status ${res.status}`);
  }
  return res.json();
}

/** Build a deterministic mock output so the UI flow can be tested end-to-end. */
function mockOutput(action: AIAction, input: Record<string, unknown>): AIResult {
  const base = { mock: true as const };
  switch (action) {
    case "generate-copy":
      return {
        ...base,
        output: {
          text: `[MOCK] Sample ${String(input.type ?? "description")} for "${String(
            input.productName ?? "your product",
          )}". Configure REPLICATE_API_TOKEN for real AI copy.`,
        },
      };
    case "text-to-speech":
      return { ...base, output: { audioUrl: null, note: "Mock TTS — no audio generated." } };
    case "video-slideshow":
      return { ...base, output: { videoUrl: null, note: "Mock video — configure FAL_KEY." } };
    default:
      // Image actions echo the input image so the editor preview still works.
      return {
        ...base,
        output: {
          imageUrl: input.imageUrl ?? null,
          note: "Mock result — configure FAL_KEY / REPLICATE_API_TOKEN for real processing.",
        },
      };
  }
}

/** Run an AI action, dispatching to the right provider or mock mode. */
export async function runAIAction(
  action: AIAction,
  provider: "fal" | "replicate",
  input: Record<string, unknown>,
): Promise<AIResult> {
  if (isAiMockMode()) {
    return mockOutput(action, input);
  }

  if (provider === "fal") {
    const endpoint = FAL_ENDPOINTS[action];
    if (!endpoint || !getFalKey()) return mockOutput(action, input);
    const raw = await callFal(endpoint, input);
    return { mock: false, output: { raw } };
  }

  const model = REPLICATE_MODELS[action];
  if (!model || !getReplicateToken()) return mockOutput(action, input);
  const raw = await callReplicate(model, input);
  return { mock: false, output: { raw } };
}
