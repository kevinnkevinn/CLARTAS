import { handleAIRequest } from "@/lib/ai/handler";
import { generateCopySchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  return handleAIRequest(request, {
    action: "generate-copy",
    schema: generateCopySchema,
  });
}
