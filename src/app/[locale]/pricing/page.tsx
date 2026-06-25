import { setRequestLocale, getTranslations } from "next-intl/server";
import { Check, ArrowRight } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("landing.pricing");
  const tp = await getTranslations("pricingPage");
  const tb = await getTranslations("billing.plans");

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />
      <main className="container flex-1 py-16">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-bold tracking-tight">{tp("title")}</h1>
          <p className="mt-3 text-muted-foreground">{tp("subtitle")}</p>
        </div>
        <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((id) => {
            const plan = PLANS[id];
            return (
              <Card
                key={id}
                className={cn("relative flex flex-col", plan.popular && "border-primary shadow-md")}
              >
                {plan.popular ? (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                    {t("mostPopular")}
                  </Badge>
                ) : null}
                <CardHeader>
                  <CardTitle className="text-lg">{tb(`${id}.name`)}</CardTitle>
                  <p className="text-sm text-muted-foreground">{tb(`${id}.description`)}</p>
                  <div className="mt-2 flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-sm text-muted-foreground">{t("perMonth")}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <ul className="space-y-2 text-sm">
                    {plan.featureKeys.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/sign-up"
                    className={cn(
                      buttonVariants({ variant: plan.popular ? "default" : "outline" }),
                      "mt-6",
                    )}
                  >
                    {t("cta")}
                    <ArrowRight className="size-4" />
                  </Link>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </main>
      <MarketingFooter />
    </div>
  );
}
