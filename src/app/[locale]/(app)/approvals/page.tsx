import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckSquare } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { getPrimaryWorkspace, getWorkspaceMembers } from "@/features/workspace/service";
import { getApprovalRequests } from "@/features/approvals/service";
import { getAssets } from "@/features/assets/service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/empty-state";
import { ApprovalRequestForm } from "@/features/approvals/approval-request-form";
import { ApprovalReviewButtons } from "@/features/approvals/approval-review-buttons";
import { formatDate } from "@/lib/utils";

export default async function ApprovalsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("approvals");
  const user = await requireUser(safeLocale);
  const workspace = await getPrimaryWorkspace(user.id);
  const requests = workspace ? await getApprovalRequests(workspace.id) : [];
  const assets = await getAssets(user.id);
  const members = workspace ? await getWorkspaceMembers(workspace.id) : [];
  const myMembership = members.find((m) => m.user_id === user.id);
  const canReview =
    myMembership?.role === "owner" ||
    myMembership?.role === "admin" ||
    myMembership?.role === "editor";

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <Card>
          <CardHeader>
            <CardTitle>{t("title")}</CardTitle>
          </CardHeader>
          <CardContent>
            {requests.length === 0 ? (
              <EmptyState icon={CheckSquare} title={t("empty")} />
            ) : (
              <ul className="space-y-3">
                {requests.map((r) => (
                  <li key={r.id} className="rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium">Asset: {r.asset_id?.slice(0, 8)}…</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(r.created_at, safeLocale)}
                        </p>
                        {r.comment ? (
                          <p className="mt-1 text-sm text-muted-foreground">{r.comment}</p>
                        ) : null}
                      </div>
                      <Badge variant={r.status === "approved" ? "success" : r.status === "rejected" ? "destructive" : "secondary"}>
                        {t(`status.${r.status}`)}
                      </Badge>
                    </div>
                    {r.status === "pending" && canReview ? (
                      <div className="mt-3">
                        <ApprovalReviewButtons requestId={r.id} />
                      </div>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">{t("requestReview")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ApprovalRequestForm
              assets={assets.map((a) => ({ id: a.id, name: a.original_filename }))}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
