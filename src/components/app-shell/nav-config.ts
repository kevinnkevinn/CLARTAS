import {
  LayoutDashboard,
  Wand2,
  Images,
  Sparkles,
  Palette,
  BarChart3,
  CheckSquare,
  Brain,
  Users,
  Clapperboard,
  PenLine,
  Camera,
  Megaphone,
  TrendingUp,
  Bot,
  Workflow,
  Rocket,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "home", icon: LayoutDashboard },
  { href: "/editor", labelKey: "editor", icon: Wand2 },
  { href: "/video-editor", labelKey: "videoEditor", icon: Clapperboard },
  { href: "/content", labelKey: "content", icon: PenLine },
  { href: "/design", labelKey: "design", icon: Palette },
  { href: "/photography", labelKey: "photography", icon: Camera },
  { href: "/video-ad", labelKey: "videoAd", icon: Megaphone },
  { href: "/ecommerce", labelKey: "ecommerce", icon: TrendingUp },
  { href: "/assets", labelKey: "assets", icon: Images },
  { href: "/ai-tools", labelKey: "aiTools", icon: Sparkles },
  { href: "/brand-kit", labelKey: "brandKit", icon: Palette },
  { href: "/analytics", labelKey: "analytics", icon: BarChart3 },
  { href: "/approvals", labelKey: "approvals", icon: CheckSquare },
  { href: "/intelligence", labelKey: "intelligence", icon: Brain },
  { href: "/agents", labelKey: "agents", icon: Bot },
  { href: "/automation", labelKey: "automation", icon: Workflow },
  { href: "/workspace", labelKey: "workspace", icon: Users },
  { href: "/future", labelKey: "future", icon: Rocket },
];
