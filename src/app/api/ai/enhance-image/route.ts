import { handleAIRequest } from "@/lib/ai/handler";
import { enhanceImageSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  return handleAIRequest(request, {
    action: "enhance-image",
    schema: enhanceImageSchema,
  });
}
