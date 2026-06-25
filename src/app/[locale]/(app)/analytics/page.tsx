import { setRequestLocale, getTranslations } from "next-intl/server";
import { BarChart3, Images, Sparkles, Coins, TrendingUp } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { getUsageAnalytics } from "@/features/analytics/service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatBytes } from "@/lib/utils";
import { EmptyState } from "@/components/states/empty-state";

export default async function AnalyticsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("analytics");
  const user = await requireUser(safeLocale);
  const stats = await getUsageAnalytics(user.id);

  const statCards = [
    { label: t("totalAssets"), value: stats.totalAssets, icon: Images },
    { label: t("totalJobs"), value: stats.totalJobs, icon: Sparkles },
    { label: t("succeededJobs"), value: stats.succeededJobs, icon: TrendingUp },
    { label: t("failedJobs"), value: stats.failedJobs, icon: BarChart3 },
    { label: t("creditsUsed"), value: stats.creditsUsed, icon: Coins },
    { label: t("storageUsage"), value: formatBytes(stats.storageBytes), icon: Images },
    { label: t("totalTransactions"), value: stats.totalTransactions, icon: Coins },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: t("ctr"), key: "ctr" },
          { label: t("conversionRate"), key: "conversion" },
          { label: t("engagementRate"), key: "engagement" },
          { label: t("roi"), key: "roi" },
          { label: t("revenue"), key: "revenue" },
          { label: t("grossRevenue"), key: "gross" },
          { label: t("netProfit"), key: "net" },
          { label: t("campaignPerformance"), key: "campaign" },
        ].map(({ label, key }) => (
          <Card key={key} className="border-dashed">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-muted-foreground">—</p>
              <p className="mt-1 text-xs text-muted-foreground">{t("notConnected")}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("jobsByAction")}</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(stats.jobsByAction).length === 0 ? (
              <EmptyState icon={BarChart3} title={t("noActivity")} />
            ) : (
              <ul className="space-y-2">
                {Object.entries(stats.jobsByAction).map(([action, count]) => (
                  <li
                    key={action}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span className="capitalize">{action.replace(/-/g, " ")}</span>
                    <span className="font-semibold">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("recentActivity")}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length === 0 ? (
              <EmptyState icon={BarChart3} title={t("noActivity")} />
            ) : (
              <ul className="space-y-2">
                {stats.recentActivity.map(({ date, jobs }) => (
                  <li
                    key={date}
                    className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                  >
                    <span>{date}</span>
                    <span className="font-semibold">{jobs} jobs</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
