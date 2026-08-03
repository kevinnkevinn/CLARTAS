"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/features/localization/language-switcher";
import { isDemoMode } from "@/lib/demo/config";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/#why", key: "why" as const },
  { href: "/#features", key: "platform" as const },
  { href: "/#preview", key: "solutions" as const },
  { href: "/pricing", key: "pricing" as const },
];

export function MarketingNav({ variant = "default" }: { variant?: "default" | "hero" }) {
  const t = useTranslations("nav");
  const tm = useTranslations("landing.nav");
  const demo = isDemoMode();
  const [open, setOpen] = useState(false);

  const isHero = variant === "hero";

  return (
    <header
      className={cn(
        "z-40 backdrop-blur-2xl",
        isHero
          ? "absolute inset-x-0 top-0 bg-transparent"
          : "sticky top-0 bg-background/80 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]",
      )}
    >
      <div className={cn("container flex h-16 items-center justify-between gap-3 md:h-[4.5rem]", isHero && "text-foreground dark:text-white")}>
        <Link href="/" className="group flex items-center gap-2.5 font-bold">
          <span
            className={cn(
              "flex size-9 items-center justify-center overflow-hidden rounded-2xl transition group-hover:scale-105",
              isHero
                ? "border border-border/70 bg-background/70 shadow-[0_10px_24px_-10px_rgba(0,0,0,0.12)] dark:border-white/15 dark:bg-white/10 dark:shadow-[0_10px_24px_-10px_rgba(255,255,255,0.15)]"
                : "border border-border/60 bg-card shadow-[0_10px_24px_-10px_hsl(var(--primary)/0.5)]",
            )}
          >
            <img src="/logo/Logo%20CLARTAS.png" alt="CLARTAS" className="size-full object-contain" />
          </span>
          <span className="font-display text-lg tracking-tight lowercase sm:text-xl">clartas</span>
        </Link>

        <nav
          className={cn(
            "hidden items-center gap-1 rounded-full p-1 text-sm lg:flex",
            isHero
              ? "border border-border/70 bg-background/70 text-foreground/85 dark:border-white/15 dark:bg-white/10 dark:text-white/85"
              : "border border-border/60 bg-card/70 text-muted-foreground",
          )}
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={demo && link.href.startsWith("/#") ? "/dashboard" : link.href}
              className={cn(
                "rounded-full px-4 py-2 transition-colors",
                isHero ? "hover:bg-muted hover:text-foreground dark:hover:bg-white/10 dark:hover:text-white" : "hover:bg-muted hover:text-foreground",
              )}
            >
              {link.key === "pricing" ? t("pricing") : tm(link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <ThemeToggle className="rounded-full" />
          <div className="hidden xs:block">
            <LanguageSwitcher />
          </div>
          {demo ? (
            <Link href="/dashboard" className={cn(buttonVariants({ size: "sm" }), "rounded-full")}>
              {t("home")}
            </Link>
          ) : (
            <>
              <Link
                href="/sign-in"
                className={cn(
                  buttonVariants({ variant: "ghost", size: "sm" }),
                  "hidden rounded-full sm:inline-flex",
                  isHero && "text-foreground hover:bg-muted hover:text-foreground dark:text-white dark:hover:bg-white/10 dark:hover:text-white",
                )}
              >
                {t("signIn")}
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden rounded-full border shadow-none sm:inline-flex",
                  isHero
                    ? "border-border/70 bg-background text-foreground hover:bg-muted dark:border-white/15 dark:bg-white dark:text-[#060b17] dark:hover:bg-[#f0f5ff]"
                    : "border-border/70 bg-card text-foreground hover:bg-muted",
                )}
              >
                {tm("bookDemo")}
              </Link>
            </>
          )}
          <button
            type="button"
            className={cn(
              "inline-flex size-9 items-center justify-center rounded-full lg:hidden",
              isHero ? "border border-border/70 bg-background/70 text-foreground dark:border-white/15 dark:bg-white/10 dark:text-white" : "border border-border/60 bg-card/80",
            )}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className={cn("lg:hidden", isHero ? "bg-background/95 text-foreground dark:bg-[#060b17]/95 dark:text-white" : "border-t border-border/50 bg-background/95")}>
          <nav className="container flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={demo && link.href.startsWith("/#") ? "/dashboard" : link.href}
                className={cn(
                  "rounded-2xl px-3 py-2.5 text-sm transition",
                  isHero ? "text-foreground/75 hover:bg-muted hover:text-foreground dark:text-white/75 dark:hover:bg-white/10 dark:hover:text-white" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
                onClick={() => setOpen(false)}
              >
                {link.key === "pricing" ? t("pricing") : tm(link.key)}
              </Link>
            ))}
            <div className={cn("mt-2 flex flex-col gap-2 pt-3 xs:hidden", isHero ? "border-t border-border/60 dark:border-white/10" : "border-t border-border/50")}>
              <LanguageSwitcher />
            </div>
            {!demo ? (
              <div className="mt-1 flex gap-2 pb-1">
                <Link
                  href="/sign-in"
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    "flex-1 rounded-full",
                    isHero && "border-border/70 bg-transparent text-foreground hover:bg-muted dark:border-white/15 dark:text-white dark:hover:bg-white/10",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/sign-up"
                  className={cn(
                    buttonVariants({ size: "sm" }),
                    "flex-1 rounded-full",
                    isHero && "bg-foreground text-background hover:bg-foreground/90 dark:bg-white dark:text-[#060b17] dark:hover:bg-[#f0f5ff]",
                  )}
                  onClick={() => setOpen(false)}
                >
                  {tm("bookDemo")}
                </Link>
              </div>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
