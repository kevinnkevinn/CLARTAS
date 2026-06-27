import { setRequestLocale } from "next-intl/server";
import { isValidLocale } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { isDemoMode } from "@/lib/demo/config";
import { MarketingLanding } from "@/features/marketing/marketing-landing";

export default async function RootPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  if (isDemoMode()) {
    redirect({ href: "/dashboard", locale: safeLocale });
  }

  return <MarketingLanding locale={safeLocale} />;
}
