import {
  Scissors,
  Sparkles,
  Eraser,
  Wand2,
  Crop,
  Clapperboard,
  Mic,
  PenLine,
  type LucideIcon,
} from "lucide-react";
import { CREDIT_COSTS, type AIAction } from "@/lib/constants";

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
  | "marketplace";

export interface EditorTool {
  id: string;
  /** Translation key under editor.tool.<key>. */
  i18nKey: string;
  icon: LucideIcon;
  /** API action; null means a local/no-AI tool. */
  action: AIAction | null;
  /** What kind of input the tool expects. */
  inputType: "image" | "images" | "text" | "none";
  fields: ToolField[];
  cost: number;
}

export const EDITOR_TOOLS: EditorTool[] = [
  {
    id: "remove-background",
    i18nKey: "removeBackground",
    icon: Scissors,
    action: "remove-background",
    inputType: "image",
    fields: [],
    cost: CREDIT_COSTS["remove-background"],
  },
  {
    id: "product-studio",
    i18nKey: "productStudio",
    icon: Sparkles,
    action: "product-studio",
    inputType: "image",
    fields: ["prompt", "scene"],
    cost: CREDIT_COSTS["product-studio"],
  },
  {
    id: "object-cleanup",
    i18nKey: "objectCleanup",
    icon: Eraser,
    action: "object-cleanup",
    inputType: "image",
    fields: ["prompt"],
    cost: CREDIT_COSTS["object-cleanup"],
  },
  {
    id: "smart-enhancer",
    i18nKey: "smartEnhancer",
    icon: Wand2,
    action: "enhance-image",
    inputType: "image",
    fields: [],
    cost: CREDIT_COSTS["enhance-image"],
  },
  {
    id: "crop-resize",
    i18nKey: "cropResize",
    icon: Crop,
    action: null,
    inputType: "image",
    fields: ["aspectRatio"],
    cost: 0,
  },
  {
    id: "video-slideshow",
    i18nKey: "videoSlideshow",
    icon: Clapperboard,
    action: "video-slideshow",
    inputType: "images",
    fields: ["aspectRatio"],
    cost: CREDIT_COSTS["video-slideshow"],
  },
  {
    id: "voiceover",
    i18nKey: "voiceover",
    icon: Mic,
    action: "text-to-speech",
    inputType: "text",
    fields: ["text", "voice"],
    cost: CREDIT_COSTS["text-to-speech"],
  },
  {
    id: "caption-generator",
    i18nKey: "captionGenerator",
    icon: PenLine,
    action: "generate-copy",
    inputType: "text",
    fields: ["productName", "text", "keywords", "tone", "language", "marketplace"],
    cost: CREDIT_COSTS["generate-copy"],
  },
];

export function getToolById(id: string | null | undefined): EditorTool {
  return EDITOR_TOOLS.find((t) => t.id === id) ?? EDITOR_TOOLS[0];
}
