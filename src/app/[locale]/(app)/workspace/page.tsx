import { setRequestLocale, getTranslations } from "next-intl/server";
import { Users } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import {
  getActiveWorkspace,
  getUserWorkspaces,
  getWorkspaceMembers,
} from "@/features/workspace/service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { WorkspaceSwitcher } from "@/features/workspace/workspace-switcher";
import { RenameWorkspaceForm } from "@/features/workspace/rename-workspace-form";
import { CreateWorkspaceForm } from "@/features/workspace/create-workspace-form";
import { InviteMemberForm } from "@/features/workspace/invite-member-form";
import { WorkspaceMembersPanel } from "@/features/workspace/workspace-members-panel";
import { EmptyState } from "@/components/states/empty-state";

export default async function WorkspacePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("workspace");
  const user = await requireUser(safeLocale);
  const workspaces = await getUserWorkspaces(user.id);
  const workspace = await getActiveWorkspace(user.id);
  const members = workspace ? await getWorkspaceMembers(workspace.id) : [];
  const isOwner = workspace?.owner_id === user.id;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <Card>
        <CardHeader>
          <CardTitle>{t("activeWorkspace")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {workspaces.length === 0 ? (
            <EmptyState icon={Users} title={t("noWorkspace")} />
          ) : (
            <WorkspaceSwitcher workspaces={workspaces} activeId={workspace!.id} />
          )}
          <CreateWorkspaceForm />
        </CardContent>
      </Card>

      {workspace && isOwner ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("renameWorkspace")}</CardTitle>
          </CardHeader>
          <CardContent>
            <RenameWorkspaceForm workspaceId={workspace.id} currentName={workspace.name} />
          </CardContent>
        </Card>
      ) : null}

      {workspace && isOwner ? (
        <Card>
          <CardHeader>
            <CardTitle>{t("inviteTitle")}</CardTitle>
          </CardHeader>
          <CardContent>
            <InviteMemberForm />
          </CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>{t("membersTitle")}</CardTitle>
        </CardHeader>
        <CardContent>
          {members.length === 0 ? (
            <p className="text-sm text-muted-foreground">—</p>
          ) : (
            <WorkspaceMembersPanel
              members={members}
              currentUserId={user.id}
              isOwner={isOwner}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
