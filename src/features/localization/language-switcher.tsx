"use client";

import { useEffect, useState, useTransition } from "react";
import { Globe, Check, ChevronDown } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, localeLabels, type Locale } from "@/i18n/routing";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Language switcher. Updates the URL locale (and NEXT_LOCALE cookie via next-intl)
 * so the choice persists across visits.
 */
export function LanguageSwitcher({ align = "end" }: { align?: "start" | "end" }) {
  const t = useTranslations("language");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    for (const l of locales) {
      if (l !== locale) {
        router.prefetch(pathname, { locale: l });
      }
    }
  }, [locale, pathname, router]);

  function onSelect(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    document.cookie = `NEXT_LOCALE=${next}; Path=/; Max-Age=31536000; SameSite=Lax`;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        aria-label={t("switch")}
        disabled={isPending}
        onClick={() => setOpen((v) => !v)}
        className="gap-1.5"
      >
        <Globe className="size-4" />
        <span className="hidden sm:inline">{localeLabels[locale]}</span>
        <ChevronDown className="size-3.5 opacity-60" />
      </Button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div
            className={cn(
              "absolute z-50 mt-2 w-48 overflow-hidden rounded-lg border bg-card p-1 shadow-lg",
              align === "end" ? "right-0" : "left-0",
            )}
          >
            {locales.map((l) => (
              <button
                key={l}
                onClick={() => onSelect(l)}
                className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
              >
                <span>{localeLabels[l]}</span>
                {l === locale ? <Check className="size-4 text-primary" /> : null}
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
