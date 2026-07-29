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

export function MarketingNav() {
  const t = useTranslations("nav");
  const tm = useTranslations("landing.nav");
  const demo = isDemoMode();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/50 bg-background/80 backdrop-blur-xl">
      <div className="container flex h-16 items-center justify-between gap-3 md:h-[4.25rem]">
        <Link href="/" className="group flex items-center gap-2.5 font-bold">
          <span className="flex size-9 items-center justify-center overflow-hidden rounded-2xl border border-border/60 bg-card shadow-[0_8px_24px_-8px_hsl(var(--primary))] transition group-hover:scale-105">
            <img src="/logo/Logo%20CLARTAS.png" alt="CLARTAS" className="size-7 object-contain" />
          </span>
          <span className="font-display text-lg tracking-tight lowercase sm:text-xl">clartas</span>
        </Link>

        <nav className="hidden items-center gap-7 text-sm text-muted-foreground lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.key}
              href={demo && link.href.startsWith("/#") ? "/dashboard" : link.href}
              className="transition-colors hover:text-foreground"
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
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "hidden rounded-full sm:inline-flex")}
              >
                {t("signIn")}
              </Link>
              <Link
                href="/sign-up"
                className={cn(
                  buttonVariants({ size: "sm" }),
                  "hidden rounded-full border border-border bg-card text-foreground shadow-none hover:bg-muted sm:inline-flex",
                )}
              >
                {tm("bookDemo")}
              </Link>
            </>
          )}
          <button
            type="button"
            className="inline-flex size-9 items-center justify-center rounded-full border border-border/60 lg:hidden"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </div>
      </div>

      {open ? (
        <div className="border-t border-border/50 bg-background lg:hidden">
          <nav className="container flex flex-col gap-1 py-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.key}
                href={demo && link.href.startsWith("/#") ? "/dashboard" : link.href}
                className="rounded-xl px-3 py-2.5 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
                onClick={() => setOpen(false)}
              >
                {link.key === "pricing" ? t("pricing") : tm(link.key)}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-border/50 pt-3 xs:hidden">
              <LanguageSwitcher />
            </div>
            {!demo ? (
              <div className="mt-1 flex gap-2 pb-1">
                <Link
                  href="/sign-in"
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex-1 rounded-full")}
                  onClick={() => setOpen(false)}
                >
                  {t("signIn")}
                </Link>
                <Link
                  href="/sign-up"
                  className={cn(buttonVariants({ size: "sm" }), "flex-1 rounded-full")}
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
