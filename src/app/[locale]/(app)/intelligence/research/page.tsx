import { setRequestLocale, getTranslations } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { MarketResearchPanel } from "@/features/research/market-research-panel";

export default async function ResearchPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);
  const t = await getTranslations("intelligence.marketResearch");
  await requireUser(safeLocale);

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <MarketResearchPanel />
    </div>
  );
}
