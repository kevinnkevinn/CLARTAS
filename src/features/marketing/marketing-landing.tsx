import { getTranslations } from "next-intl/server";
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  Check,
  Clapperboard,
  FolderOpen,
  Globe,
  Image as ImageIcon,
  Palette,
  PenLine,
  ShieldCheck,
  Sparkles,
  Workflow,
  Zap,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MarketingNav } from "@/components/marketing/marketing-nav";
import { MarketingFooter } from "@/components/marketing/marketing-footer";
import { MarketingProviders } from "@/features/marketing/marketing-providers";
import { HeroVisual } from "@/features/marketing/hero-visual";
import { ProductPreview } from "@/features/marketing/product-preview";
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

export async function MarketingLanding({ locale }: { locale: string }) {
  void locale;
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

  const settingsItems = [
    { title: t("preview.settings.twoFa"), subtitle: t("preview.settings.twoFaSub") },
    { title: t("preview.settings.personal"), subtitle: t("preview.settings.personalSub") },
    { title: t("preview.settings.privacy"), subtitle: t("preview.settings.privacySub") },
    { title: t("preview.settings.notifications"), subtitle: t("preview.settings.notificationsSub") },
    { title: t("preview.settings.affiliate"), subtitle: t("preview.settings.affiliateSub") },
  ];

  return (
    <MarketingProviders>
      <div className="flex min-h-screen flex-col bg-background">
        <MarketingNav />

        <main className="flex-1">
          {/* Hero */}
          <section className="container pb-10 pt-10 md:pb-14 md:pt-14 lg:pt-16">
            <div className="grid items-end gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12">
              <div className="marketing-fade-up">
                <p className="font-display text-sm font-semibold lowercase tracking-wide text-primary">
                  clartas
                </p>
                <h1 className="mt-3 max-w-xl font-display text-4xl font-bold leading-[1.08] tracking-tight text-foreground xs:text-5xl sm:text-5xl md:text-6xl lg:text-[3.5rem]">
                  {t("hero.title")}
                </h1>
              </div>
              <div className="marketing-fade-up-delay flex flex-col items-start gap-4 lg:items-end lg:text-right">
                <div className="flex w-full flex-col gap-3 xs:flex-row lg:w-auto lg:justify-end">
                  <Link
                    href="/sign-up"
                    className={cn(
                      buttonVariants({ size: "lg" }),
                      "h-14 flex-1 rounded-full bg-[#F3EDE4] px-8 text-base font-semibold text-foreground shadow-none hover:bg-[#ebe3d7] dark:bg-[#1a1a1a] dark:text-white dark:hover:bg-[#242424] xs:flex-none",
                    )}
                  >
                    {t("hero.ctaPrimary")}
                  </Link>
                  <Link
                    href="/pricing"
                    className="inline-flex size-14 shrink-0 items-center justify-center rounded-full border border-border bg-card text-foreground transition hover:border-primary hover:text-primary"
                    aria-label={t("hero.ctaSecondary")}
                  >
                    <ArrowUpRight className="size-5" />
                  </Link>
                </div>
                <p className="max-w-sm text-sm leading-relaxed text-muted-foreground lg:ml-auto">
                  {t("hero.subtitle")}
                </p>
              </div>
            </div>

            <div className="marketing-fade-up-delay-2 mt-10 md:mt-12">
              <HeroVisual
                spendLabel={t("heroVisual.spendLabel")}
                spendStatus={t("heroVisual.spendStatus")}
                protectionTitle={t("heroVisual.protectionTitle")}
                protectionStatus={t("heroVisual.protectionStatus")}
                activateLabel={t("heroVisual.activate")}
                learnMoreLabel={tc("learnMore")}
              />
            </div>
          </section>

          {/* Why / stack + security */}
          <section id="why" className="container border-t border-border/60 py-14 md:py-20">
            <div className="grid gap-10 md:grid-cols-2 md:gap-0">
              <div className="md:pr-10 lg:pr-16">
                <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-secondary dark:bg-white/5">
                  <Box className="size-7 text-foreground" strokeWidth={1.5} />
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                  {t("stack.title")}
                </h2>
                <p className="mt-3 max-w-md text-muted-foreground">{t("stack.description")}</p>
              </div>
              <div className="border-t border-border/60 pt-10 md:border-l md:border-t-0 md:pl-10 md:pt-0 lg:pl-16">
                <div className="mb-5 flex size-14 items-center justify-center rounded-2xl bg-secondary dark:bg-white/5">
                  <ShieldCheck className="size-7 text-foreground" strokeWidth={1.5} />
                </div>
                <h2 className="font-display text-2xl font-bold tracking-tight md:text-3xl">
                  {t("security.title")}
                </h2>
                <p className="mt-3 max-w-md text-muted-foreground">{t("security.description")}</p>
              </div>
            </div>
          </section>

          {/* Value props */}
          <section className="border-y border-border/60 bg-muted/20 py-14 md:py-20">
            <div className="container">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  {t("value.title")}
                </h2>
                <p className="mt-3 text-muted-foreground">{t("value.subtitle")}</p>
              </div>
              <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {values.map(({ key, icon: Icon }) => (
                  <div
                    key={key}
                    className="rounded-3xl border border-border/60 bg-card p-6 transition hover:border-primary/40"
                  >
                    <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="font-display text-lg font-bold">{t(`value.items.${key}.title`)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(`value.items.${key}.description`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Product preview */}
          <section id="preview" className="container py-14 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t("preview.title")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("preview.subtitle")}</p>
            </div>
            <div className="mt-10 md:mt-12">
              <ProductPreview
                greeting={t("preview.greeting")}
                balanceLabel={t("preview.balanceLabel")}
                transferLabel={t("preview.transfer")}
                addLabel={t("preview.add")}
                notificationsTitle={t("preview.notifications")}
                contactsLabel={t("preview.contacts")}
                missedCalls={t("preview.missedCalls")}
                lastChats={t("preview.lastChats")}
                withdrawalTitle={t("preview.withdrawal")}
                youSend={t("preview.youSend")}
                withdrawCta={t("preview.withdrawCta", { amount: "{amount}" })}
                settingsTitle={t("preview.settingsTitle")}
                settingsItems={settingsItems}
              />
            </div>
          </section>

          {/* Features */}
          <section id="features" className="border-y border-border/60 bg-muted/20">
            <div className="container py-14 md:py-20">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                  {t("featuresTitle")}
                </h2>
                <p className="mt-3 text-muted-foreground">{t("featuresSubtitle")}</p>
              </div>
              <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {features.map(({ key, icon: Icon }) => (
                  <Link
                    key={key}
                    href={FEATURE_LINKS[key] ?? "/editor"}
                    className="group rounded-3xl border border-border/60 bg-card p-6 transition hover:border-primary/50 hover:shadow-[0_20px_40px_-24px_hsl(var(--primary)/0.45)]"
                  >
                    <div className="mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="size-6" />
                    </div>
                    <h3 className="font-display text-xl font-bold">{t(`${key}.title`)}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                      {t(`${key}.description`)}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section id="pricing" className="container py-14 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
                {t("pricing.title")}
              </h2>
              <p className="mt-3 text-muted-foreground">{t("pricing.subtitle")}</p>
            </div>
            <div className="mx-auto mt-12 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((id) => {
                const plan = PLANS[id];
                return (
                  <div
                    key={id}
                    className={cn(
                      "relative flex flex-col rounded-3xl border border-border/60 bg-card p-6",
                      plan.popular && "border-primary shadow-[0_24px_48px_-28px_hsl(var(--primary)/0.55)]",
                    )}
                  >
                    {plan.comingSoon ? (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2" variant="secondary">
                        {tc("comingSoon")}
                      </Badge>
                    ) : plan.popular ? (
                      <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                        {t("pricing.mostPopular")}
                      </Badge>
                    ) : null}
                    <h3 className="font-display text-lg font-bold">{tb(`${id}.name`)}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{tb(`${id}.description`)}</p>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-4xl font-bold">${plan.price}</span>
                      <span className="text-sm text-muted-foreground">{t("pricing.perMonth")}</span>
                    </div>
                    <ul className="mt-5 space-y-2 text-sm">
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
                        buttonVariants({
                          variant: plan.popular && !plan.comingSoon ? "default" : "outline",
                        }),
                        "mt-6 rounded-full",
                        plan.comingSoon && "pointer-events-none opacity-60",
                      )}
                    >
                      {plan.comingSoon ? tc("comingSoon") : t("pricing.cta")}
                    </Link>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Global + final CTA */}
          <section className="border-t border-border/60 bg-muted/20">
            <div className="container grid gap-6 py-14 md:grid-cols-2 md:py-16">
              <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Globe className="size-5" />
                </div>
                <h3 className="font-display text-xl font-bold">{t("globalLanguages.title")}</h3>
                <p className="mt-2 text-muted-foreground">{t("globalLanguages.description")}</p>
              </div>
              <div className="rounded-3xl border border-border/60 bg-card p-6 md:p-8">
                <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <h3 className="font-display text-xl font-bold">{t("security.title")}</h3>
                <p className="mt-2 text-muted-foreground">{t("security.description")}</p>
              </div>
            </div>
          </section>

          <section className="container py-20 text-center md:py-28">
            <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
              {t("finalCta.title")}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-muted-foreground">{t("finalCta.subtitle")}</p>
            <Link
              href="/sign-up"
              className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 rounded-full px-8")}
            >
              {t("finalCta.cta")}
              <ArrowRight className="size-4" />
            </Link>
          </section>
        </main>

        <MarketingFooter />
      </div>
    </MarketingProviders>
  );
}
