import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";

export async function MarketingFooter() {
  const t = await getTranslations("common");
  const year = new Date().getFullYear();
  return (
    <footer className="border-t">
      <div className="container flex flex-col items-center justify-between gap-4 py-8 sm:flex-row">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <Sparkles className="size-4 text-primary" />
          CLARTAS
        </div>
        <p className="text-xs text-muted-foreground">{t("tagline")}</p>
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <Link href="/privacy" className="hover:text-foreground hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-foreground hover:underline">
            Terms
          </Link>
          <span>© {year} CLARTAS</span>
        </div>
      </div>
    </footer>
  );
}
