import { handleAIRequest } from "@/lib/ai/handler";
import { videoSlideshowSchema } from "@/lib/ai/schemas";

export async function POST(request: Request) {
  return handleAIRequest(request, {
    action: "video-slideshow",
    schema: videoSlideshowSchema,
  });
}
