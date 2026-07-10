import type { AIAction } from "@/lib/constants";

/** Normalisasi respons provider AI ke format output standar CLARTAS. */
export function normalizeAIOutput(
  action: AIAction,
  raw: unknown,
  input: Record<string, unknown>,
): Record<string, unknown> {
  const data = raw as Record<string, unknown>;

  switch (action) {
    case "remove-background": {
      const url =
        pickUrl(data.image) ??
        pickUrl(data) ??
        (typeof data.image === "string" ? data.image : null) ??
        input.imageUrl;
      return { imageUrl: url };
    }
    case "product-studio":
    case "object-cleanup": {
      const images = data.images as Array<{ url?: string }> | undefined;
      const url =
        images?.[0]?.url ??
        pickUrl(data.image) ??
        pickUrl(data) ??
        input.imageUrl;
      return { imageUrl: url };
    }
    case "enhance-image": {
      const output = data.output;
      const url =
        (typeof output === "string" ? output : null) ??
        (Array.isArray(output) ? output[0] : null) ??
        pickUrl(data) ??
        input.imageUrl;
      return { imageUrl: url };
    }
    case "generate-copy": {
      const output = data.output;
      let text = "";
      if (typeof output === "string") text = output;
      else if (Array.isArray(output)) text = output.join("");
      else if (typeof data === "string") text = data;
      else text = String(data.text ?? data.content ?? "");
      return { text: text.trim() };
    }
    case "text-to-speech": {
      const output = data.output;
      const url =
        (typeof output === "string" ? output : null) ??
        (Array.isArray(output) ? output[0] : null) ??
        pickUrl(data.audio) ??
        pickUrl(data);
      return { audioUrl: url };
    }
    case "video-slideshow": {
      const url = pickUrl(data.video) ?? pickUrl(data) ?? null;
      return { videoUrl: url };
    }
    default:
      return { raw: data };
  }
}

function pickUrl(val: unknown): string | null {
  if (!val) return null;
  if (typeof val === "string" && val.startsWith("http")) return val;
  if (typeof val === "object" && val !== null && "url" in val) {
    const u = (val as { url?: string }).url;
    return typeof u === "string" ? u : null;
  }
  return null;
}
