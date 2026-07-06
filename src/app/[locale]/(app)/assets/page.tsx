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
import { getAssetsPage, withSignedUrls } from "@/features/assets/service";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function AssetsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;
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

  const page = Math.max(1, Number(pageParam) || 1);
  const { items: rawAssets, total, pageSize, hasMore } = await getAssetsPage(user.id, page);
  const assets = await withSignedUrls(rawAssets);
  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} action={<AssetUploader />} />
      {assets.length === 0 ? (
        <EmptyState icon={Images} title={t("empty")} description={t("emptyHint")} />
      ) : (
        <>
          <AssetLibrary assets={assets} locale={safeLocale} />
          {totalPages > 1 ? (
            <nav className="mt-6 flex items-center justify-center gap-2" aria-label="Pagination">
              {page > 1 ? (
                <Link href={`/assets?page=${page - 1}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  {t("prevPage")}
                </Link>
              ) : null}
              <span className="text-sm text-muted-foreground">
                {t("pageOf", { page, total: totalPages })}
              </span>
              {hasMore ? (
                <Link href={`/assets?page=${page + 1}`} className={cn(buttonVariants({ variant: "outline", size: "sm" }))}>
                  {t("nextPage")}
                </Link>
              ) : null}
            </nav>
          ) : null}
        </>
      )}
    </div>
  );
}
