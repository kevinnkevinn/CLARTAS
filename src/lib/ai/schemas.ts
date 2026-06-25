import { z } from "zod";

/** Per-action input validation. Image inputs accept a stored path or URL. */

const imageInput = z.object({
  imageUrl: z.string().url().optional(),
  assetId: z.string().uuid().optional(),
});

export const removeBackgroundSchema = imageInput;

export const productStudioSchema = imageInput.extend({
  prompt: z.string().min(3).max(1000),
  scene: z.string().max(100).optional(),
});

export const objectCleanupSchema = imageInput.extend({
  maskUrl: z.string().url().optional(),
  prompt: z.string().max(1000).optional(),
});

export const enhanceImageSchema = imageInput.extend({
  scale: z.number().int().min(2).max(4).optional().default(2),
});

export const generateCopySchema = z.object({
  productName: z.string().min(1).max(200),
  details: z.string().max(2000).optional(),
  tone: z.string().max(50).optional(),
  language: z.string().max(10).optional().default("en"),
  type: z.enum(["title", "description", "caption", "script"]).optional().default("description"),
});

export const videoSlideshowSchema = z.object({
  imageUrls: z.array(z.string().url()).min(1).max(20),
  aspectRatio: z.enum(["9:16", "1:1", "16:9"]).optional().default("9:16"),
  music: z.string().max(100).optional(),
});

export const textToSpeechSchema = z.object({
  text: z.string().min(1).max(5000),
  voice: z.string().max(50).optional().default("default"),
});

export type RemoveBackgroundInput = z.infer<typeof removeBackgroundSchema>;
export type GenerateCopyInput = z.infer<typeof generateCopySchema>;
