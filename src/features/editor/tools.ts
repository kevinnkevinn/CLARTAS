import {
  Scissors,
  Sparkles,
  Eraser,
  Wand2,
  Crop,
  Clapperboard,
  Mic,
  PenLine,
  Sun,
  Droplets,
  Scan,
  Layers,
  Palette,
  ImagePlus,
  Gem,
  Home,
  TreePine,
  Megaphone,
  Sparkle,
  User,
  ZoomIn,
  VolumeX,
  Wrench,
  Paintbrush,
  type LucideIcon,
} from "lucide-react";
import { CREDIT_COSTS, type AIAction } from "@/lib/constants";
import type { ClientAIAction } from "@/features/lab/client-ai";

export type ToolField =
  | "prompt"
  | "scene"
  | "aspectRatio"
  | "tone"
  | "language"
  | "voice"
  | "text"
  | "productName"
  | "keywords"
  | "marketplace"
  | "copyType"
  | "count"
  | "scale";

export type ToolCategory = "basic" | "ai" | "product" | "video" | "content";

export interface EditorTool {
  id: string;
  i18nKey: string;
  icon: LucideIcon;
  category: ToolCategory;
  action: AIAction | ClientAIAction | null;
  clientOnly?: boolean;
  inputType: "image" | "images" | "text" | "none";
  fields: ToolField[];
  cost: number;
}

const CLIENT_ACTIONS: ClientAIAction[] = [
  "reflection-removal",
  "shadow-generator",
  "product-retouch",
  "beauty-enhancement",
  "face-restoration",
  "noise-reduction",
  "image-repair",
  "color-correction",
  "white-background",
  "luxury-background",
  "studio-background",
  "marketplace-background",
  "custom-background",
  "batch-variations",
];

export function isClientAction(action: string): action is ClientAIAction {
  return CLIENT_ACTIONS.includes(action as ClientAIAction) || action === "remove-background";
}

export const TOOL_CATEGORIES: { id: ToolCategory; labelKey: string }[] = [
  { id: "basic", labelKey: "catBasic" },
  { id: "ai", labelKey: "catAi" },
  { id: "product", labelKey: "catProduct" },
  { id: "video", labelKey: "catVideo" },
  { id: "content", labelKey: "catContent" },
];

export const EDITOR_TOOLS: EditorTool[] = [
  // Basic
  {
    id: "crop-resize",
    i18nKey: "cropResize",
    icon: Crop,
    category: "basic",
    action: null,
    inputType: "image",
    fields: ["aspectRatio"],
    cost: 0,
  },
  {
    id: "adjustments",
    i18nKey: "adjustments",
    icon: Sun,
    category: "basic",
    action: null,
    inputType: "image",
    fields: [],
    cost: 0,
  },
  // AI editing
  {
    id: "remove-background",
    i18nKey: "removeBackground",
    icon: Scissors,
    category: "ai",
    action: "remove-background",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 1,
  },
  {
    id: "object-cleanup",
    i18nKey: "objectCleanup",
    icon: Eraser,
    category: "ai",
    action: "object-cleanup",
    clientOnly: true,
    inputType: "image",
    fields: ["prompt"],
    cost: 4,
  },
  {
    id: "reflection-removal",
    i18nKey: "reflectionRemoval",
    icon: Droplets,
    category: "ai",
    action: "reflection-removal",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 3,
  },
  {
    id: "shadow-generator",
    i18nKey: "shadowGenerator",
    icon: Layers,
    category: "ai",
    action: "shadow-generator",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 2,
  },
  {
    id: "product-retouch",
    i18nKey: "productRetouch",
    icon: Sparkle,
    category: "ai",
    action: "product-retouch",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 3,
  },
  {
    id: "beauty-enhancement",
    i18nKey: "beautyEnhancement",
    icon: User,
    category: "ai",
    action: "beauty-enhancement",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 3,
  },
  {
    id: "face-restoration",
    i18nKey: "faceRestoration",
    icon: Scan,
    category: "ai",
    action: "face-restoration",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 4,
  },
  {
    id: "smart-enhancer",
    i18nKey: "smartEnhancer",
    icon: ZoomIn,
    category: "ai",
    action: "enhance-image",
    clientOnly: true,
    inputType: "image",
    fields: ["scale"],
    cost: 2,
  },
  {
    id: "noise-reduction",
    i18nKey: "noiseReduction",
    icon: VolumeX,
    category: "ai",
    action: "noise-reduction",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 2,
  },
  {
    id: "image-repair",
    i18nKey: "imageRepair",
    icon: Wrench,
    category: "ai",
    action: "image-repair",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 3,
  },
  {
    id: "color-correction",
    i18nKey: "colorCorrection",
    icon: Paintbrush,
    category: "ai",
    action: "color-correction",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 2,
  },
  // Product backgrounds
  {
    id: "white-background",
    i18nKey: "whiteBackground",
    icon: ImagePlus,
    category: "product",
    action: "white-background",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 1,
  },
  {
    id: "product-studio",
    i18nKey: "productStudio",
    icon: Sparkles,
    category: "product",
    action: "product-studio",
    clientOnly: true,
    inputType: "image",
    fields: ["prompt", "scene"],
    cost: 5,
  },
  {
    id: "luxury-background",
    i18nKey: "luxuryBackground",
    icon: Gem,
    category: "product",
    action: "luxury-background",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 4,
  },
  {
    id: "studio-background",
    i18nKey: "studioBackground",
    icon: Palette,
    category: "product",
    action: "studio-background",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 3,
  },
  {
    id: "marketplace-background",
    i18nKey: "marketplaceBackground",
    icon: Megaphone,
    category: "product",
    action: "marketplace-background",
    clientOnly: true,
    inputType: "image",
    fields: [],
    cost: 3,
  },
  {
    id: "lifestyle-scene",
    i18nKey: "lifestyleScene",
    icon: Home,
    category: "product",
    action: "product-studio",
    clientOnly: true,
    inputType: "image",
    fields: ["scene"],
    cost: 4,
  },
  {
    id: "outdoor-scene",
    i18nKey: "outdoorScene",
    icon: TreePine,
    category: "product",
    action: "product-studio",
    clientOnly: true,
    inputType: "image",
    fields: ["scene"],
    cost: 4,
  },
  {
    id: "custom-background",
    i18nKey: "customBackground",
    icon: Wand2,
    category: "product",
    action: "custom-background",
    clientOnly: true,
    inputType: "image",
    fields: ["prompt"],
    cost: 5,
  },
  {
    id: "batch-variations",
    i18nKey: "batchVariations",
    icon: Layers,
    category: "product",
    action: "batch-variations",
    clientOnly: true,
    inputType: "image",
    fields: ["count"],
    cost: 10,
  },
  // Video
  {
    id: "video-slideshow",
    i18nKey: "videoSlideshow",
    icon: Clapperboard,
    category: "video",
    action: "video-slideshow",
    clientOnly: true,
    inputType: "images",
    fields: ["aspectRatio"],
    cost: 10,
  },
  {
    id: "voiceover",
    i18nKey: "voiceover",
    icon: Mic,
    category: "video",
    action: "text-to-speech",
    clientOnly: true,
    inputType: "text",
    fields: ["text", "voice"],
    cost: 3,
  },
  // Content
  {
    id: "caption-generator",
    i18nKey: "captionGenerator",
    icon: PenLine,
    category: "content",
    action: "generate-copy",
    clientOnly: true,
    inputType: "text",
    fields: ["productName", "text", "keywords", "tone", "language", "marketplace", "copyType"],
    cost: 1,
  },
];

export function getToolById(id: string | null | undefined): EditorTool {
  return EDITOR_TOOLS.find((t) => t.id === id) ?? EDITOR_TOOLS[0]!;
}

export function getToolsByCategory(category: ToolCategory): EditorTool[] {
  return EDITOR_TOOLS.filter((t) => t.category === category);
}

/** Legacy cost lookup for server actions */
export function getToolCost(action: string): number {
  const fromConstants = CREDIT_COSTS[action as AIAction];
  if (fromConstants !== undefined) return fromConstants;
  const tool = EDITOR_TOOLS.find((t) => t.action === action);
  return tool?.cost ?? 1;
}
