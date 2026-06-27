import { Link } from "@/i18n/navigation";
import {
  Wand2,
  Clapperboard,
  PenLine,
  Palette,
  Camera,
  Megaphone,
  TrendingUp,
  MessageCircle,
  Radio,
  Bot,
  Workflow,
  BarChart3,
  Images,
  Sparkles,
  Rocket,
  Briefcase,
  Brain,
  Users,
  CheckSquare,
  Settings,
  ArrowRight,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MODULES = [
  { href: "/editor", icon: Wand2, title: "Photo Editor", desc: "30+ tools AI & basic editing" },
  { href: "/video-editor", icon: Clapperboard, title: "Video Editor", desc: "Cut, split, merge, export" },
  { href: "/content", icon: PenLine, title: "Content Generator", desc: "Judul, ads, caption, script" },
  { href: "/design", icon: Palette, title: "Design Generator", desc: "Banner, flyer, logo, packaging" },
  { href: "/photography", icon: Camera, title: "Product Photography", desc: "Batch 12–48 variasi foto" },
  { href: "/video-ad", icon: Megaphone, title: "Video Ad Factory", desc: "Video iklan multi-platform" },
  { href: "/ecommerce", icon: TrendingUp, title: "E-Commerce Assistant", desc: "Listing, harga, kompetitor" },
  { href: "/intelligence/research", icon: BarChart3, title: "Market Research", desc: "Opportunity & trend score" },
  { href: "/intelligence/assistant", icon: MessageCircle, title: "Customer Service AI", desc: "WhatsApp, Telegram, IG DM" },
  { href: "/intelligence/live-selling", icon: Radio, title: "Live Selling", desc: "Script & virtual host" },
  { href: "/agents", icon: Bot, title: "AI Agents", desc: "Marketing, Design, Sales, CS" },
  { href: "/automation", icon: Workflow, title: "Automation Engine", desc: "IF/THEN workflow builder" },
  { href: "/assets", icon: Images, title: "Digital Asset Management", desc: "Smart search & AI tagging" },
  { href: "/analytics", icon: BarChart3, title: "Analytics", desc: "CTR, ROI, revenue dashboard" },
  { href: "/ai-tools", icon: Sparkles, title: "AI Tools Hub", desc: "Semua tool AI terpusat" },
  { href: "/intelligence", icon: Brain, title: "Intelligence Hub", desc: "Research, CS, live selling" },
  { href: "/brand-kit", icon: Palette, title: "Brand Kit", desc: "Warna, logo, brand voice" },
  { href: "/workspace", icon: Users, title: "Team & Workspace", desc: "Kolaborasi tim" },
  { href: "/approvals", icon: CheckSquare, title: "Approvals", desc: "Workflow persetujuan" },
  { href: "/settings", icon: Settings, title: "Settings", desc: "Pengaturan akun" },
  { href: "/future", icon: Rocket, title: "Future Technology", desc: "AR, VR, AGI roadmap" },
  { href: "/investor", icon: Briefcase, title: "Investor Pack", desc: "BMC, SWOT, financials" },
];

export function FeatureHub() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {MODULES.map((m) => {
        const Icon = m.icon;
        return (
          <Link key={m.href} href={m.href}>
            <Card className="h-full transition hover:border-primary hover:shadow-md">
              <CardHeader className="pb-2">
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-5" />
                </div>
                <CardTitle className="text-base">{m.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{m.desc}</p>
                <ArrowRight className="size-4 shrink-0 text-primary" />
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
