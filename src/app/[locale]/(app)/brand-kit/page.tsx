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
                <Card key={kit.id}>
                  <CardHeader>
                    <CardTitle className="text-base">{kit.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div className="flex flex-wrap gap-2">
                      {kit.brand_colors.map((c) => (
                        <span
                          key={c}
                          className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
                        >
                          <span
                            className="size-3 rounded-full border"
                            style={{ backgroundColor: c }}
                          />
                          {c}
                        </span>
                      ))}
                    </div>
                    {kit.brand_fonts.length ? (
                      <p className="text-muted-foreground">{kit.brand_fonts.join(", ")}</p>
                    ) : null}
                    {kit.brand_voice ? (
                      <p className="italic text-muted-foreground">“{kit.brand_voice}”</p>
                    ) : null}
                  </CardContent>
                </Card>
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
