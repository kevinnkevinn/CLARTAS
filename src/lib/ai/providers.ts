import { getFalKey, getReplicateToken, isAiMockMode } from "@/lib/env";
import type { AIAction } from "@/lib/constants";
import { buildCopyPrompt } from "@/lib/ai/copy-prompt";
import { normalizeAIOutput } from "@/lib/ai/normalize-output";
import { generateCopyText } from "@/lib/ai/fallback-copy";

/**
 * Lapisan provider AI. Semua panggilan SERVER-SIDE; kunci tidak pernah ke klien.
 * Mode mock aktif jika tidak ada kunci provider.
 */

export interface AIResult {
  mock: boolean;
  output: Record<string, unknown>;
}

const FAL_ENDPOINTS: Partial<Record<AIAction, string>> = {
  "remove-background": "fal-ai/birefnet",
  "product-studio": "fal-ai/flux/dev",
  "object-cleanup": "fal-ai/flux/dev/image-to-image",
  "video-slideshow": "fal-ai/ltx-video",
};

const REPLICATE_MODELS: Partial<Record<AIAction, string>> = {
  "enhance-image": "nightmareai/real-esrgan",
  "generate-copy": "meta/meta-llama-3-8b-instruct",
  "text-to-speech": "jaaari/kokoro-82m",
};

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
    const err = await res.text().catch(() => "");
    throw new Error(`fal.ai gagal (${res.status}): ${err.slice(0, 200)}`);
  }
  return res.json();
}

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
    const err = await res.text().catch(() => "");
    throw new Error(`Replicate gagal (${res.status}): ${err.slice(0, 200)}`);
  }
  return res.json();
}

function buildFalInput(action: AIAction, input: Record<string, unknown>): Record<string, unknown> {
  const imageUrl = input.imageUrl as string | undefined;
  switch (action) {
    case "remove-background":
      return { image_url: imageUrl };
    case "product-studio":
      return {
        image_url: imageUrl,
        prompt: input.prompt ?? "Professional product studio photography, clean white background, commercial lighting",
        num_images: 1,
      };
    case "object-cleanup":
      return {
        image_url: imageUrl,
        prompt: input.prompt ?? "Remove unwanted objects, clean product photo, professional e-commerce quality",
        strength: 0.85,
      };
    case "video-slideshow": {
      const urls = (input.imageUrls as string[]) ?? (imageUrl ? [imageUrl] : []);
      return {
        prompt: "Smooth product showcase video, professional e-commerce advertising",
        image_url: urls[0],
        aspect_ratio: mapAspectRatio(input.aspectRatio as string),
      };
    }
    default:
      return input;
  }
}

function buildReplicateInput(action: AIAction, input: Record<string, unknown>): Record<string, unknown> {
  switch (action) {
    case "enhance-image":
      return {
        image: input.imageUrl,
        scale: input.scale ?? 2,
        face_enhance: false,
      };
    case "generate-copy":
      return {
        prompt: buildCopyPrompt({
          productName: String(input.productName ?? "Product"),
          details: input.details as string | undefined,
          keywords: input.keywords as string | undefined,
          marketplace: input.marketplace as string | undefined,
          tone: input.tone as string | undefined,
          brandVoice: input.brandVoice as string | undefined,
          language: input.language as string | undefined,
          type: input.type as string | undefined,
        }),
        max_tokens: 1024,
        temperature: 0.7,
      };
    case "text-to-speech":
      return {
        text: input.text,
        voice: input.voice ?? "af_bella",
      };
    default:
      return input;
  }
}

function mapAspectRatio(ratio?: string): string {
  if (ratio === "1:1") return "1:1";
  if (ratio === "16:9") return "16:9";
  return "9:16";
}

function mockOutput(action: AIAction, input: Record<string, unknown>): AIResult {
  const base = { mock: true as const };
  switch (action) {
    case "generate-copy":
      return {
        ...base,
        output: {
          text: generateCopyText(input),
          note: "Mode mock — konfigurasi REPLICATE_API_TOKEN untuk AI copy nyata.",
        },
      };
    case "text-to-speech":
      return { ...base, output: { audioUrl: null, note: "Mock TTS — konfigurasi REPLICATE_API_TOKEN." } };
    case "video-slideshow":
      return { ...base, output: { videoUrl: null, note: "Mock video — konfigurasi FAL_KEY." } };
    default:
      return {
        ...base,
        output: {
          imageUrl: input.imageUrl ?? null,
          note: "Hasil mock — konfigurasi FAL_KEY / REPLICATE_API_TOKEN untuk pemrosesan nyata.",
        },
      };
  }
}

/** Jalankan aksi AI, dispatch ke provider atau mode mock. */
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
    const raw = await callFal(endpoint, buildFalInput(action, input));
    return { mock: false, output: normalizeAIOutput(action, raw, input) };
  }

  const model = REPLICATE_MODELS[action];
  if (!model || !getReplicateToken()) return mockOutput(action, input);
  const raw = await callReplicate(model, buildReplicateInput(action, input));
  return { mock: false, output: normalizeAIOutput(action, raw, input) };
}
