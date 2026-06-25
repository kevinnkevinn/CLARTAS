import { setRequestLocale, getTranslations } from "next-intl/server";
import { Check, Coins, Receipt } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { getCreditBalance, getCreditHistory } from "@/features/credits/service";
import { getSubscription, getTransactions } from "@/features/billing/service";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/states/empty-state";
import { CheckoutButton } from "@/features/billing/checkout-button";
import { PLANS, type PlanId } from "@/lib/constants";
import { cn, formatDate, formatCurrency } from "@/lib/utils";

export default async function BillingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("billing");
  const tp = await getTranslations("landing.pricing");
  const tb = await getTranslations("billing.plans");
  const tc = await getTranslations("credits");

  const user = await requireUser(safeLocale);
  const [credits, subscription, transactions, creditHistory] = await Promise.all([
    getCreditBalance(user.id),
    getSubscription(user.id),
    getTransactions(user.id),
    getCreditHistory(user.id),
  ]);

  const currentPlan = subscription?.plan_name ?? "free";

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">{t("currentPlan")}</CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Badge className="capitalize">{currentPlan}</Badge>
            {subscription?.status ? (
              <span className="text-xs text-muted-foreground">{subscription.status}</span>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm text-muted-foreground">{tc("balance")}</CardTitle>
            <Coins className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{credits}</p>
          </CardContent>
        </Card>
      </div>

      {/* Plans */}
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(PLANS) as PlanId[]).map((id) => {
          const plan = PLANS[id];
          const priceId = plan.paddlePriceIdEnv
            ? process.env[plan.paddlePriceIdEnv]
            : undefined;
          const isCurrent = currentPlan.toLowerCase() === id;
          return (
            <Card key={id} className={cn("flex flex-col", plan.popular && "border-primary")}>
              <CardHeader>
                <CardTitle className="text-lg">{tb(`${id}.name`)}</CardTitle>
                <p className="text-sm text-muted-foreground">{tb(`${id}.description`)}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold">${plan.price}</span>
                  <span className="text-sm text-muted-foreground">{tp("perMonth")}</span>
                </div>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col">
                <ul className="mb-4 space-y-2 text-sm">
                  {plan.featureKeys.map((f) => (
                    <li key={f} className="flex items-start gap-2">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-auto">
                  {isCurrent ? (
                    <Badge variant="secondary" className="w-full justify-center py-2">
                      {t("currentPlan")}
                    </Badge>
                  ) : id === "free" ? (
                    <Badge variant="outline" className="w-full justify-center py-2">
                      {tb("free.name")}
                    </Badge>
                  ) : (
                    <CheckoutButton
                      priceId={priceId}
                      userId={user.id}
                      email={user.email}
                      label={tp("cta")}
                      variant={plan.popular ? "default" : "outline"}
                    />
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Invoices / transactions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("invoices")}</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <EmptyState icon={Receipt} title={t("noInvoices")} />
            ) : (
              <ul className="space-y-2">
                {transactions.map((tx) => (
                  <li
                    key={tx.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <span>{formatDate(tx.created_at, safeLocale)}</span>
                    <span className="font-medium">
                      {formatCurrency(tx.amount, tx.currency, safeLocale)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Credit history */}
        <Card>
          <CardHeader>
            <CardTitle>{tc("history")}</CardTitle>
          </CardHeader>
          <CardContent>
            {creditHistory.length === 0 ? (
              <EmptyState icon={Coins} title={tc("noHistory")} />
            ) : (
              <ul className="space-y-2">
                {creditHistory.map((cx) => (
                  <li
                    key={cx.id}
                    className="flex items-center justify-between rounded-lg border p-3 text-sm"
                  >
                    <div>
                      <p className="font-medium">{cx.module}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(cx.created_at, safeLocale)}
                      </p>
                    </div>
                    <span
                      className={cn(
                        "font-semibold",
                        cx.amount >= 0 ? "text-emerald-600" : "text-destructive",
                      )}
                    >
                      {cx.amount >= 0 ? "+" : ""}
                      {cx.amount}
                    </span>
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
