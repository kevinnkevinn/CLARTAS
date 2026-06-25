import { setRequestLocale, getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { getPrimaryWorkspace, getWorkspaceMembers } from "@/features/workspace/service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/empty-state";
import { SettingsForm } from "@/features/settings/settings-form";

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("settings");
  const user = await requireUser(safeLocale);
  const workspace = await getPrimaryWorkspace(user.id);
  const members = workspace ? await getWorkspaceMembers(workspace.id) : [];

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
        <CardHeader>
          <CardTitle>{t("workspace")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspace ? (
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="font-medium">{workspace.name}</p>
                <p className="text-xs text-muted-foreground">/{workspace.slug}</p>
              </div>
              <Badge variant="secondary">{t("role.owner")}</Badge>
            </div>
          ) : (
            <EmptyState icon={Users} title={t("workspace")} />
          )}

          <div>
            <h3 className="mb-2 text-sm font-semibold">{t("members")}</h3>
            {members.length === 0 ? (
              <p className="text-sm text-muted-foreground">—</p>
            ) : (
              <ul className="space-y-2">
                {members.map((m) => (
                  <li
                    key={m.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <span>{m.profile?.full_name || m.profile?.email || m.user_id}</span>
                    <Badge variant="outline">{t(`role.${m.role}`)}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
