import { handleAIRequest } from "@/lib/ai/handler";
import { productStudioSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  return handleAIRequest(request, {
    action: "product-studio",
    schema: productStudioSchema,
  });
}
