import { getTranslations } from "next-intl/server";
import {
  Sparkles,
  Image as ImageIcon,
  Clapperboard,
  PenLine,
  Workflow,
  Globe,
  ShieldCheck,
  Zap,
  Check,
  ArrowRight,
  Palette,
  FolderOpen,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { PLANS } from "@/lib/constants";
import { cn } from "@/lib/utils";

const FEATURE_LINKS: Record<string, string> = {
  photoEditor: "/editor",
  videoEditor: "/video-editor",
  contentGenerator: "/content",
  automation: "/automation",
  brandManagement: "/brand-kit",
  assetLibrary: "/assets",
};

export async function MarketingLanding({ locale: _locale }: { locale: string }) {
  const t = await getTranslations("landing");
  const tc = await getTranslations("common");
  const tb = await getTranslations("billing.plans");

  const features = [
    { key: "photoEditor", icon: ImageIcon },
    { key: "videoEditor", icon: Clapperboard },
    { key: "contentGenerator", icon: PenLine },
    { key: "automation", icon: Workflow },
    { key: "brandManagement", icon: Palette },
    { key: "assetLibrary", icon: FolderOpen },
  ] as const;

  const values = [
    { key: "speed", icon: Zap },
    { key: "consistency", icon: Sparkles },
    { key: "global", icon: Globe },
  ] as const;

  return (
    <div className="flex min-h-screen flex-col">
      <MarketingNav />

      <main className="flex-1">
        <section className="gradient-bg">
          <div className="container flex flex-col items-center py-20 text-center md:py-28">
            <Badge variant="secondary" className="mb-6 gap-1.5">
              <Sparkles className="size-3.5" />
              {t("hero.badge")}
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
              {t("hero.title")}
            </h1>
            <p className="mt-6 max-w-2xl text-lg text-muted-foreground">{t("hero.subtitle")}</p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/sign-up" className={buttonVariants({ size: "lg" })}>
                {t("hero.ctaPrimary")}
                <ArrowRight className="size-4" />
              </Link>
              <Link href="/pricing" className={buttonVariants({ size: "lg", variant: "outline" })}>
                {t("hero.ctaSecondary")}
              </Link>
            </div>
          </div>
        </section>

        <section className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t("value.title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("value.subtitle")}</p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {values.map(({ key, icon: Icon }) => (
              <Card key={key}>
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle>{t(`value.items.${key}.title`)}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  {t(`value.items.${key}.description`)}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section id="features" className="border-y bg-muted/30">
          <div className="container py-20">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map(({ key, icon: Icon }) => (
                <Link key={key} href={FEATURE_LINKS[key] ?? "/editor"}>
                  <Card className="h-full overflow-hidden transition hover:border-primary hover:shadow-md">
                    <CardHeader>
                      <div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <Icon className="size-6" />
                      </div>
                      <CardTitle className="text-xl">{t(`${key}.title`)}</CardTitle>
                    </CardHeader>
                    <CardContent className="text-muted-foreground">{t(`${key}.description`)}</CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section id="pricing" className="container py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight">{t("pricing.title")}</h2>
            <p className="mt-3 text-muted-foreground">{t("pricing.subtitle")}</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-6xl gap-6 md:grid-cols-2 lg:grid-cols-4">
            {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((id) => {
              const plan = PLANS[id];
              return (
                <Card
                  key={id}
                  className={cn("relative flex flex-col", plan.popular && "border-primary shadow-md")}
                >
                  {plan.comingSoon ? (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="secondary">
                      {tc("comingSoon")}
                    </Badge>
                  ) : plan.popular ? (
                    <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">{t("pricing.mostPopular")}</Badge>
                  ) : null}
                  <CardHeader>
                    <CardTitle className="text-lg">{tb(`${id}.name`)}</CardTitle>
                    <p className="text-sm text-muted-foreground">{tb(`${id}.description`)}</p>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className="text-4xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">{t("pricing.perMonth")}</span>
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
                      href={plan.comingSoon ? "/pricing" : "/sign-up"}
                      className={cn(
                        buttonVariants({ variant: plan.popular && !plan.comingSoon ? "default" : "outline" }),
                        "mt-6",
                        plan.comingSoon && "pointer-events-none opacity-60",
                      )}
                    >
                      {plan.comingSoon ? tc("comingSoon") : t("pricing.cta")}
                    </Link>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="border-t bg-muted/30">
          <div className="container grid gap-6 py-20 md:grid-cols-2">
            <Card>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Globe className="size-5" />
                </div>
                <CardTitle>{t("globalLanguages.title")}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{t("globalLanguages.description")}</CardContent>
            </Card>
            <Card>
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <ShieldCheck className="size-5" />
                </div>
                <CardTitle>{t("security.title")}</CardTitle>
              </CardHeader>
              <CardContent className="text-muted-foreground">{t("security.description")}</CardContent>
            </Card>
          </div>
        </section>

        <section className="container py-24 text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            {t("finalCta.title")}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("finalCta.subtitle")}</p>
          <Link href="/sign-up" className={cn(buttonVariants({ size: "lg" }), "mt-8")}>
            {t("finalCta.cta")}
            <ArrowRight className="size-4" />
          </Link>
        </section>
      </main>

      <MarketingFooter />
    </div>
  );
}
