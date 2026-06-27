import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { InvestorPack } from "@/features/investor/investor-pack";

export default async function InvestorPage({
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
      <PageHeader title="Investor Ready" description="Executive summary, BMC, SWOT, proyeksi keuangan" />
      <InvestorPack />
    </div>
  );
}
