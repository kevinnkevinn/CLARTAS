"use client";

import { useState } from "react";
import { Menu, X, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { NAV_ITEMS, NAV_SECTIONS } from "./nav-config";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileNav({ isAdmin }: { isAdmin: boolean }) {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(true)}
        className="flex size-9 items-center justify-center rounded-lg border border-border/60 bg-card/50"
        aria-label="Open menu"
      >
        <Menu className="size-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative flex w-64 flex-col border-r border-border/50 bg-card/95 backdrop-blur-2xl">
            <div className="flex h-16 items-center justify-between border-b border-border/50 px-4 font-bold">
              <span className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-violet-500 text-primary-foreground">
                  <Sparkles className="size-4" />
                </span>
                <span className="gradient-text">CLARTAS</span>
              </span>
              <button onClick={() => setOpen(false)} aria-label="Close menu">
                <X className="size-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-4 overflow-y-auto p-3">
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
                            onClick={() => setOpen(false)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium",
                              active
                                ? "bg-primary/15 text-primary glow-ring-sm"
                                : "text-muted-foreground hover:bg-accent/60",
                            )}
                          >
                            <Icon className="size-4 shrink-0" />
                            <span className="flex-1 truncate">{t(labelKey)}</span>
                            {badge === "new" ? (
                              <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">
                                New
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
          </div>
        </div>
      ) : null}
    </div>
  );
}
