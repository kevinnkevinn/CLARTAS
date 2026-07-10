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

export type NavSection = "primary" | "tools" | "advanced";

export interface NavItem {
  href: string;
  labelKey: string;
  icon: LucideIcon;
  section: NavSection;
  adminOnly?: boolean;
  badge?: "new" | "beta";
}

/** Navigasi utama — fokus alur penjual. */
export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "home", icon: LayoutDashboard, section: "primary" },
  { href: "/listing-intelligence", labelKey: "listingIntelligence", icon: Rocket, section: "primary", badge: "new" },
  { href: "/editor", labelKey: "editor", icon: Wand2, section: "primary" },
  { href: "/content", labelKey: "content", icon: PenLine, section: "primary" },
  { href: "/assets", labelKey: "assets", icon: Images, section: "primary" },
  { href: "/video-editor", labelKey: "videoEditor", icon: Clapperboard, section: "tools" },
  { href: "/photography", labelKey: "photography", icon: Camera, section: "tools" },
  { href: "/design", labelKey: "design", icon: Palette, section: "tools" },
  { href: "/video-ad", labelKey: "videoAd", icon: Megaphone, section: "tools" },
  { href: "/ecommerce", labelKey: "ecommerce", icon: TrendingUp, section: "tools" },
  { href: "/brand-kit", labelKey: "brandKit", icon: Palette, section: "tools" },
  { href: "/ai-tools", labelKey: "aiTools", icon: Sparkles, section: "tools" },
  { href: "/analytics", labelKey: "analytics", icon: BarChart3, section: "advanced" },
  { href: "/approvals", labelKey: "approvals", icon: CheckSquare, section: "advanced" },
  { href: "/intelligence", labelKey: "intelligence", icon: Brain, section: "advanced" },
  { href: "/agents", labelKey: "agents", icon: Bot, section: "advanced", badge: "beta" },
  { href: "/automation", labelKey: "automation", icon: Workflow, section: "advanced" },
  { href: "/workspace", labelKey: "workspace", icon: Users, section: "advanced" },
  { href: "/future", labelKey: "future", icon: Rocket, section: "advanced" },
];

export const NAV_SECTIONS: { id: NavSection; labelKey: string }[] = [
  { id: "primary", labelKey: "navSectionPrimary" },
  { id: "tools", labelKey: "navSectionTools" },
  { id: "advanced", labelKey: "navSectionAdvanced" },
];
