"use client";

import { Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS, NAV_SECTIONS } from "./nav-config";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Sidebar({ isAdmin }: { isAdmin: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();

  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <aside className="relative hidden w-64 shrink-0 flex-col border-r border-border/50 bg-card/40 backdrop-blur-2xl md:flex">
      <div className="pointer-events-none absolute inset-0 mesh-bg opacity-40" />
      <Link
        href="/dashboard"
        className="relative z-10 flex h-16 items-center gap-2.5 border-b border-border/50 px-6 font-bold hover:opacity-90"
      >
        <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-violet-500 text-primary-foreground glow-ring-sm">
          <Sparkles className="size-5" />
        </span>
        <span className="gradient-text text-lg tracking-tight">CLARTAS</span>
      </Link>
      <nav className="relative z-10 flex-1 space-y-4 overflow-y-auto p-3">
        {NAV_SECTIONS.map((section) => {
          const sectionItems = items.filter((i) => i.section === section.id);
          if (!sectionItems.length) return null;
          return (
            <div key={section.id}>
              <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {t(section.labelKey)}
              </p>
              <div className="space-y-0.5">
                {sectionItems.map(({ href, labelKey, icon: Icon, badge }) => {
                  const active = isNavActive(pathname, href);
                  return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-200",
                        active
                          ? "bg-primary/15 text-primary glow-ring-sm"
                          : "text-muted-foreground hover:bg-accent/60 hover:text-foreground",
                      )}
                    >
                      <Icon className={cn("size-4 shrink-0", active && "text-primary")} />
                      <span className="flex-1 truncate">{t(labelKey)}</span>
                      {badge === "new" ? (
                        <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                          Baru
                        </Badge>
                      ) : badge === "beta" ? (
                        <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
                          Beta
                        </Badge>
                      ) : null}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
