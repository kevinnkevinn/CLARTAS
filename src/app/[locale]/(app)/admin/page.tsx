import { setRequestLocale, getTranslations } from "next-intl/server";
import { Users, Sparkles, DollarSign, CreditCard } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  getAdminStats,
  listUsers,
  listJobs,
  listTransactions,
  listSubscriptions,
  listErrorLogs,
  listWorkspaces,
} from "@/features/admin/service";
import { CreditAdjustForm } from "@/features/admin/credit-adjust-form";
import { formatDate, formatCurrency, truncate } from "@/lib/utils";

export default async function AdminPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("admin");

  const [stats, users, jobs, transactions, subscriptions, logs, workspaces] = await Promise.all([
    getAdminStats(),
    listUsers(),
    listJobs(),
    listTransactions(),
    listSubscriptions(),
    listErrorLogs(),
    listWorkspaces(),
  ]);

  const statCards = [
    { label: t("totalUsers"), value: stats.totalUsers, icon: Users },
    { label: t("totalJobs"), value: stats.totalJobs, icon: Sparkles },
    {
      label: t("totalRevenue"),
      value: formatCurrency(stats.totalRevenue, "USD", safeLocale),
      icon: DollarSign,
    },
    { label: t("activeSubscriptions"), value: stats.activeSubscriptions, icon: CreditCard },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map(({ label, value, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
              <Icon className="size-4 text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Users */}
        <Card>
          <CardHeader>
            <CardTitle>{t("users")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminTable
              rows={users.map((u) => ({
                key: u.id,
                cells: [u.full_name || u.email, String(u.ai_credits), u.plan_status],
              }))}
              empty="—"
            />
          </CardContent>
        </Card>

        {/* Manual credit adjustment */}
        <Card>
          <CardHeader>
            <CardTitle>{t("creditAdjust")}</CardTitle>
          </CardHeader>
          <CardContent>
            <CreditAdjustForm />
          </CardContent>
        </Card>

        {/* Jobs */}
        <Card>
          <CardHeader>
            <CardTitle>{t("jobs")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminTable
              rows={jobs.map((j) => ({
                key: j.id,
                cells: [j.action, j.provider, j.status],
              }))}
              empty="—"
            />
          </CardContent>
        </Card>

        {/* Subscriptions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("subscriptions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminTable
              rows={subscriptions.map((s) => ({
                key: s.id,
                cells: [s.plan_name, s.status, formatDate(s.created_at, safeLocale)],
              }))}
              empty="—"
            />
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("transactions")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminTable
              rows={transactions.map((tx) => ({
                key: tx.id,
                cells: [
                  formatCurrency(Number(tx.amount), tx.currency, safeLocale),
                  tx.status,
                  formatDate(tx.created_at, safeLocale),
                ],
              }))}
              empty="—"
            />
          </CardContent>
        </Card>

        {/* Workspaces */}
        <Card>
          <CardHeader>
            <CardTitle>{t("workspaces")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminTable
              rows={workspaces.map((w) => ({
                key: w.id,
                cells: [w.name, w.slug, formatDate(w.created_at, safeLocale)],
              }))}
              empty="—"
            />
          </CardContent>
        </Card>

        {/* Error logs */}
        <Card>
          <CardHeader>
            <CardTitle>{t("errorLogs")}</CardTitle>
          </CardHeader>
          <CardContent>
            <AdminTable
              rows={logs.map((l) => ({
                key: l.id,
                cells: [l.scope, truncate(l.message, 40), formatDate(l.created_at, safeLocale)],
              }))}
              empty="—"
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function AdminTable({
  rows,
  empty,
}: {
  rows: { key: string; cells: string[] }[];
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>;
  }
  return (
    <ul className="space-y-1.5 text-sm">
      {rows.map((row) => (
        <li
          key={row.key}
          className="flex items-center justify-between gap-2 rounded-md border px-3 py-2"
        >
          {row.cells.map((cell, i) => (
            <span
              key={i}
              className={i === 0 ? "truncate font-medium" : "shrink-0 text-xs text-muted-foreground"}
            >
              {i === row.cells.length - 1 ? <Badge variant="secondary">{cell}</Badge> : cell}
            </span>
          ))}
        </li>
      ))}
    </ul>
  );
}
