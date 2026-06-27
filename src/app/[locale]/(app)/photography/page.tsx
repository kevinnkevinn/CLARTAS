import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { BatchPhotographyStudio } from "@/features/photography/batch-photography";

export default async function PhotographyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);
  await requireUser(safeLocale);

  return (
    <div>
      <PageHeader
        title="AI Product Photography"
        description="1 foto → puluhan variasi studio, luxury, lifestyle"
      />
      <BatchPhotographyStudio />
    </div>
  );
}
