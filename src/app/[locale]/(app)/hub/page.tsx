import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";
import { FeatureHub } from "@/features/hub/feature-hub";

export default async function HubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  return (
    <div>
      <PageHeader title="Feature Hub" description="All CLARTAS modules" />
      <FeatureHub />
    </div>
  );
}
