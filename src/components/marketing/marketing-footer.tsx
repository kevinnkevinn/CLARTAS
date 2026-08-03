import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

export async function MarketingFooter() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();
  return (
    <footer className="relative overflow-hidden bg-muted/25 text-foreground dark:bg-[#090f1c] dark:text-white">
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[radial-gradient(ellipse_at_bottom,rgba(255,145,56,0.10),transparent_65%)] dark:bg-[radial-gradient(ellipse_at_bottom,rgba(255,145,56,0.22),transparent_65%)]" />

      <div className="container grid gap-8 py-10 md:grid-cols-[1.15fr_0.85fr] md:py-12">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2.5">
            <span className="flex size-8 items-center justify-center rounded-xl bg-white/10 text-white">
              <Sparkles className="size-4" />
            </span>
            <div>
              <p className="font-display text-sm font-bold lowercase tracking-tight text-foreground dark:text-white">clartas</p>
              <p className="text-xs text-muted-foreground dark:text-slate-300">{t("tagline")}</p>
            </div>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground dark:text-slate-300">
            Agentic workflow for e-commerce teams: automate the repetitive layer and keep human
            judgment exactly where it matters.
          </p>
        </div>

        <div className="flex flex-wrap items-start gap-x-10 gap-y-3 text-sm text-muted-foreground md:justify-end dark:text-slate-300">
          <Link href="/#features" className="transition hover:text-foreground dark:hover:text-white">
            Features
          </Link>
          <Link href="/pricing" className="transition hover:text-foreground dark:hover:text-white">
            Pricing
          </Link>
          <Link href="/privacy" className="transition hover:text-foreground dark:hover:text-white">
            Privacy
          </Link>
          <Link href="/terms" className="transition hover:text-foreground dark:hover:text-white">
            Terms
          </Link>
        </div>
      </div>

      <div className="container flex flex-col gap-2 py-4 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between dark:text-slate-400">
        <span>© {year} CLARTAS. All rights reserved.</span>
        <span>Built for speed, consistency, and review-safe execution.</span>
      </div>
    </footer>
  );
}
