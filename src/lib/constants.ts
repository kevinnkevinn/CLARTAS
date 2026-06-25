/**
 * Central product constants: AI actions, credit costs, plans, file limits.
 * These are the single source of truth used by both UI and API routes.
 */

export type AIAction =
  | "remove-background"
  | "product-studio"
  | "object-cleanup"
  | "enhance-image"
  | "generate-copy"
  | "video-slideshow"
  | "text-to-speech";

/** Credit cost per AI action (see blueprint section 7 + project spec). */
export const CREDIT_COSTS: Record<AIAction, number> = {
  "remove-background": 1,
  "product-studio": 5,
  "object-cleanup": 4,
  "enhance-image": 2,
  "generate-copy": 1,
  "video-slideshow": 10,
  "text-to-speech": 3,
};

/** Which provider each action is routed to by default. */
export const ACTION_PROVIDER: Record<AIAction, "fal" | "replicate"> = {
  "remove-background": "fal",
  "product-studio": "fal",
  "object-cleanup": "fal",
  "enhance-image": "replicate",
  "generate-copy": "replicate",
  "video-slideshow": "fal",
  "text-to-speech": "replicate",
};

export type PlanId = "free" | "premium" | "enterprise";

export interface Plan {
  id: PlanId;
  /** Monthly price in USD. */
  price: number;
  /** Monthly AI credit allotment. */
  credits: number;
  /** Paddle price id, configured per environment. */
  paddlePriceIdEnv?: string;
  featureKeys: string[];
  popular?: boolean;
}

export const PLANS: Record<PlanId, Plan> = {
  free: {
    id: "free",
    price: 0,
    credits: 20,
    featureKeys: ["20 AI credits / month", "Background removal", "AI copywriting", "1 workspace"],
  },
  premium: {
    id: "premium",
    price: 29,
    credits: 500,
    paddlePriceIdEnv: "NEXT_PUBLIC_PADDLE_PRICE_PREMIUM",
    popular: true,
    featureKeys: [
      "500 AI credits / month",
      "All AI tools",
      "Video generation",
      "Brand kit",
      "Priority processing",
    ],
  },
  enterprise: {
    id: "enterprise",
    price: 199,
    credits: 5000,
    paddlePriceIdEnv: "NEXT_PUBLIC_PADDLE_PRICE_ENTERPRISE",
    featureKeys: [
      "5000+ AI credits / month",
      "Custom credit limits",
      "Team workspaces & roles",
      "Approval workflows",
      "API access",
      "Dedicated support",
    ],
  },
};

/** Default credits granted to a brand-new free account. */
export const DEFAULT_FREE_CREDITS = PLANS.free.credits;

/** File upload validation rules. */
export const ALLOWED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"] as const;
export const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/quicktime", "video/webm"] as const;

export const MAX_IMAGE_BYTES = 10 * 1024 * 1024; // 10MB
export const MAX_VIDEO_BYTES = 100 * 1024 * 1024; // 100MB

export const STORAGE_BUCKETS = {
  raw: "raw-assets",
  processed: "processed-assets",
  brand: "brand-assets",
} as const;
