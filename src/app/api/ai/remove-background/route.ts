import { handleAIRequest } from "@/lib/ai/handler";
import { removeBackgroundSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  return handleAIRequest(request, {
    action: "remove-background",
    schema: removeBackgroundSchema,
  });
}
