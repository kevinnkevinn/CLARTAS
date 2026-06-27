import { setRequestLocale, getTranslations } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { LiveSellingStudio } from "@/features/live-selling/live-studio";

export default async function LiveSellingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);
  const t = await getTranslations("intelligence.liveSelling");
  await requireUser(safeLocale);

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <LiveSellingStudio />
    </div>
  );
}
