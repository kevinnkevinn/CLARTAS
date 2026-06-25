import { setRequestLocale, getTranslations } from "next-intl/server";
import { Palette } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { getPrimaryWorkspace } from "@/features/workspace/service";
import { getBrandKits } from "@/features/brand-kit/service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/states/empty-state";
import { BrandKitForm } from "@/features/brand-kit/brand-kit-form";
import { BrandKitCard } from "@/features/brand-kit/brand-kit-card";

export default async function BrandKitPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("brandKit");
  const user = await requireUser(safeLocale);
  const workspace = await getPrimaryWorkspace(user.id);
  const kits = workspace ? await getBrandKits(workspace.id) : [];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div>
          {kits.length === 0 ? (
            <EmptyState icon={Palette} title={t("empty")} />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {kits.map((kit) => (
                <BrandKitCard key={kit.id} kit={kit} />
              ))}
            </div>
          )}
        </div>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">{t("create")}</CardTitle>
          </CardHeader>
          <CardContent>
            <BrandKitForm />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
