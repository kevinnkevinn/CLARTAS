import { handleAIRequest } from "@/lib/ai/handler";
import { textToSpeechSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  return handleAIRequest(request, {
    action: "text-to-speech",
    schema: textToSpeechSchema,
  });
}
