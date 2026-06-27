import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { EcommerceAssistant } from "@/features/ecommerce/ecommerce-assistant";

export default async function EcommercePage({
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
      <PageHeader title="AI E-Commerce Assistant" description="Optimasi listing, kompetitor, harga optimal" />
      <EcommerceAssistant />
    </div>
  );
}
