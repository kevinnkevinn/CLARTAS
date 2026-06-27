import { setRequestLocale, getTranslations } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { isDemoMode } from "@/lib/demo/config";
import { PageHeader } from "@/components/page-header";
import { DemoAssetLibrary } from "@/features/demo/demo-asset-library";
import { EmptyState } from "@/components/states/empty-state";
import { Images } from "lucide-react";
import { AssetUploader } from "@/features/assets/asset-uploader";
import { AssetLibrary } from "@/features/assets/asset-library";
import { getAssets, withSignedUrls } from "@/features/assets/service";

export default async function AssetsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("assets");
  const user = await requireUser(safeLocale);

  if (isDemoMode()) {
    return (
      <div>
        <PageHeader title={t("title")} description={t("subtitle")} />
        <DemoAssetLibrary />
      </div>
    );
  }

  const rawAssets = await getAssets(user.id);
  const assets = await withSignedUrls(rawAssets);

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} action={<AssetUploader />} />
      {assets.length === 0 ? (
        <EmptyState icon={Images} title={t("empty")} description={t("emptyHint")} />
      ) : (
        <AssetLibrary assets={assets} locale={safeLocale} />
      )}
    </div>
  );
}
