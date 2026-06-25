import { setRequestLocale, getTranslations } from "next-intl/server";
import { Images, FileVideo } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { getAssets, withSignedUrls } from "@/features/assets/service";
import { PageHeader } from "@/components/page-header";
import { EmptyState } from "@/components/states/empty-state";
import { Badge } from "@/components/ui/badge";
import { AssetUploader } from "@/features/assets/asset-uploader";
import { formatDate } from "@/lib/utils";

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
  const rawAssets = await getAssets(user.id);
  const assets = await withSignedUrls(rawAssets);

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} action={<AssetUploader />} />

      {assets.length === 0 ? (
        <EmptyState icon={Images} title={t("empty")} description={t("emptyHint")} />
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {assets.map((a) => {
            const isVideo = a.file_type.startsWith("video/");
            return (
              <div key={a.id} className="overflow-hidden rounded-xl border bg-card">
                <div className="flex aspect-square items-center justify-center bg-muted">
                  {isVideo ? (
                    <FileVideo className="size-10 text-muted-foreground" />
                  ) : a.signedUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={a.signedUrl}
                      alt={a.original_filename}
                      className="size-full object-cover"
                    />
                  ) : (
                    <Images className="size-10 text-muted-foreground" />
                  )}
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-medium" title={a.original_filename}>
                    {a.original_filename}
                  </p>
                  <div className="mt-1 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatDate(a.created_at, safeLocale)}
                    </span>
                    <Badge variant="secondary">{t(`status.${a.processing_status === "ready" ? "ready" : a.processing_status === "failed" ? "failed" : "processing"}`)}</Badge>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
