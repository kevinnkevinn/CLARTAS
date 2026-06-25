import { setRequestLocale, getTranslations } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SettingsForm } from "@/features/settings/settings-form";
import { LanguageSwitcher } from "@/features/localization/language-switcher";
import { buttonVariants } from "@/components/ui/button";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("settings");
  const tw = await getTranslations("workspace");
  const user = await requireUser(safeLocale);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("profile")}</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            email={user.email}
            fullName={user.profile?.full_name ?? ""}
            preferredLocale={user.profile?.preferred_locale ?? safeLocale}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{t("preferredLanguage")}</CardTitle>
          <LanguageSwitcher align="end" />
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("languageSwitcherHint")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>{t("workspace")}</CardTitle>
          <Link href="/workspace" className={buttonVariants({ size: "sm", variant: "outline" })}>
            {tw("title")}
          </Link>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t("workspaceManageHint")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
