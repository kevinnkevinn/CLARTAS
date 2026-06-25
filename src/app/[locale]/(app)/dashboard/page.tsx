import { getTranslations, setRequestLocale } from "next-intl/server";
import { Coins, Images, Sparkles, Wand2, PenLine, Upload, ArrowRight } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/features/auth/guards";
import { getCreditBalance } from "@/features/credits/service";
import { getRecentAssets } from "@/features/assets/service";
import { getRecentJobs, getJobCount } from "@/features/ai/queries";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/empty-state";
import { formatDate } from "@/lib/utils";

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("dashboard");
  const user = await requireUser(safeLocale);

  const [credits, assets, jobs, jobCount] = await Promise.all([
    getCreditBalance(user.id),
    getRecentAssets(user.id),
    getRecentJobs(user.id),
    getJobCount(user.id),
  ]);

  const name = user.profile?.full_name?.split(" ")[0];

  const quickActions = [
    { href: "/editor?tool=remove-background", labelKey: "removeBackground", icon: Wand2 },
    { href: "/editor?tool=product-studio", labelKey: "generateStudio", icon: Sparkles },
    { href: "/editor?tool=caption-generator", labelKey: "writeCopy", icon: PenLine },
    { href: "/assets", labelKey: "uploadAsset", icon: Upload },
  ] as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          {name ? t("welcome", { name }) : t("welcomeGeneric")}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("creditBalance")}</CardTitle>
            <Coins className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{credits}</p>
            <p className="text-xs text-muted-foreground">{t("creditsRemaining", { count: credits })}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("usage.assets")}</CardTitle>
            <Images className="size-4 text-primary" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{assets.length}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("usage.jobs")}</CardTitle>
            <Sparkles className="size-4 text-fuchsia-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{jobCount}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("subscriptionStatus")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary" className="capitalize">
              {user.profile?.plan_status ?? "free"}
            </Badge>
          </CardContent>
        </Card>
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="mb-3 text-sm font-semibold text-muted-foreground">{t("quickActions")}</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {quickActions.map(({ href, labelKey, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-3 rounded-xl border bg-card p-4 text-sm font-medium transition-colors hover:border-primary hover:bg-accent"
            >
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              {t(`actions.${labelKey}`)}
              <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent assets */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{t("recentAssets")}</CardTitle>
            <Link href="/assets" className="text-sm text-primary hover:underline">
              {t("viewAll")}
            </Link>
          </CardHeader>
          <CardContent>
            {assets.length === 0 ? (
              <EmptyState icon={Images} title={t("noAssets")} />
            ) : (
              <ul className="space-y-2">
                {assets.map((a) => (
                  <li
                    key={a.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <span className="truncate font-medium">{a.original_filename}</span>
                    <span className="text-xs text-muted-foreground">
                      {formatDate(a.created_at, safeLocale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Recent jobs */}
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0">
            <CardTitle>{t("recentJobs")}</CardTitle>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <EmptyState icon={Sparkles} title={t("noJobs")} />
            ) : (
              <ul className="space-y-2">
                {jobs.map((j) => (
                  <li
                    key={j.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <span className="font-medium capitalize">{j.action.replace(/-/g, " ")}</span>
                    <Badge
                      variant={
                        j.status === "succeeded"
                          ? "success"
                          : j.status === "failed"
                            ? "destructive"
                            : "secondary"
                      }
                    >
                      {j.status}
                    </Badge>
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
