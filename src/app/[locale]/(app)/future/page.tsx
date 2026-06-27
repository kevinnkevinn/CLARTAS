import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { FutureTechShowcase } from "@/features/future/future-showcase";

export default async function FuturePage({
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
      <PageHeader title="Future Technology" description="AR, VR, AGI, Quantum — roadmap 5–50 tahun" />
      <FutureTechShowcase />
    </div>
  );
}
