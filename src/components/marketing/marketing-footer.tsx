import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";

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
        <p className="text-xs text-muted-foreground">© {year} CLARTAS</p>
      </div>
    </footer>
  );
}
