import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

export async function MarketingFooter() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border/60">
      <div className="container flex flex-col items-center justify-between gap-5 py-10 sm:flex-row">
        <div className="flex items-center gap-2.5">
          <span className="flex size-8 items-center justify-center rounded-xl bg-primary text-primary-foreground">
            <Sparkles className="size-4" />
          </span>
          <div>
            <p className="font-display text-sm font-bold lowercase tracking-tight">clartas</p>
            <p className="text-xs text-muted-foreground">{t("tagline")}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-muted-foreground">
          <Link href="/#features" className="transition hover:text-foreground">
            Features
          </Link>
          <Link href="/pricing" className="transition hover:text-foreground">
            Pricing
          </Link>
          <Link href="/privacy" className="transition hover:text-foreground hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-foreground hover:underline">
            Terms
          </Link>
          <span>© {year} CLARTAS</span>
        </div>
      </div>
    </footer>
  );
}
