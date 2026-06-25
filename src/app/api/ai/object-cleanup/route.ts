import { handleAIRequest } from "@/lib/ai/handler";
import { objectCleanupSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  return handleAIRequest(request, {
    action: "object-cleanup",
    schema: objectCleanupSchema,
  });
}
