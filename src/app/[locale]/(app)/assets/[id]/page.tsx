import { setRequestLocale, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { getAssetById } from "@/features/assets/service";
import { STORAGE_BUCKETS } from "@/lib/constants";
import { createClient } from "@/lib/supabase/server";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AssetDetailActions } from "@/features/assets/asset-detail-actions";
import { formatDate, formatBytes } from "@/lib/utils";

export default async function AssetDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("assets");
  const user = await requireUser(safeLocale);
  const asset = await getAssetById(user.id, id);
  if (!asset) notFound();

  const supabase = await createClient();
  const bucket =
    (asset.metadata as { source?: string })?.source === "ai" ||
    asset.file_path.includes("/processed/")
      ? STORAGE_BUCKETS.processed
      : STORAGE_BUCKETS.raw;
  const { data: signed } = await supabase!.storage
    .from(bucket)
    .createSignedUrl(asset.file_path, 3600);

  const tags = (asset.metadata?.tags as string[] | undefined) ?? [];
  const size = asset.metadata?.size as number | undefined;
  const isVideo = asset.file_type.startsWith("video/");

  return (
    <div className="space-y-6">
      <PageHeader title={asset.original_filename} description={t("detailSubtitle")} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardContent className="flex min-h-[300px] items-center justify-center p-4">
            {!isVideo && signed?.signedUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={signed.signedUrl} alt="" className="max-h-[480px] rounded-lg object-contain" />
            ) : (
              <p className="text-muted-foreground">{isVideo ? "Video preview" : "No preview"}</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="space-y-4 p-6">
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("type")}</dt>
                <dd>{asset.file_type}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("status")}</dt>
                <dd>
                  <Badge variant="secondary">{asset.processing_status}</Badge>
                </dd>
              </div>
              {size ? (
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">{t("size")}</dt>
                  <dd>{formatBytes(size)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted-foreground">{t("created")}</dt>
                <dd>{formatDate(asset.created_at, safeLocale)}</dd>
              </div>
            </dl>
            {tags.length > 0 ? (
              <div className="flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            ) : null}
            <AssetDetailActions
              assetId={asset.id}
              filename={asset.original_filename}
              downloadUrl={signed?.signedUrl ?? null}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
