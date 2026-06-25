import {
  LayoutDashboard,
  Wand2,
  Images,
  Sparkles,
  Palette,
  CreditCard,
  Settings,
  Shield,
  BarChart3,
  CheckSquare,
  Brain,
  Users,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  href: string;
  /** Translation key under the `nav` namespace. */
  labelKey: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", labelKey: "dashboard", icon: LayoutDashboard },
  { href: "/editor", labelKey: "editor", icon: Wand2 },
  { href: "/assets", labelKey: "assets", icon: Images },
  { href: "/ai-tools", labelKey: "aiTools", icon: Sparkles },
  { href: "/brand-kit", labelKey: "brandKit", icon: Palette },
  { href: "/analytics", labelKey: "analytics", icon: BarChart3 },
  { href: "/approvals", labelKey: "approvals", icon: CheckSquare },
  { href: "/intelligence", labelKey: "intelligence", icon: Brain },
  { href: "/workspace", labelKey: "workspace", icon: Users },
  { href: "/billing", labelKey: "billing", icon: CreditCard },
  { href: "/settings", labelKey: "settings", icon: Settings },
  { href: "/admin", labelKey: "admin", icon: Shield, adminOnly: true },
];
