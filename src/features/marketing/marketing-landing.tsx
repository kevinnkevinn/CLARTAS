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
      <div className="flex min-h-screen flex-col bg-background text-foreground dark:bg-[#060b17] dark:text-white">
        <MarketingNav variant="hero" />

        <main className="flex-1">
          <div className="container pb-6 pt-24 md:pb-8 md:pt-28">
            <div className="overflow-hidden rounded-[3rem] bg-card text-foreground shadow-[0_44px_90px_-48px_rgba(0,0,0,0.18)] dark:bg-[#060b17] dark:text-white dark:shadow-[0_44px_90px_-48px_rgba(0,0,0,0.95)]">
              <div className="relative isolate">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_65%_90%,rgba(255,143,54,0.12),transparent_45%),radial-gradient(ellipse_at_75%_0%,rgba(56,189,248,0.08),transparent_40%)] dark:bg-[radial-gradient(ellipse_at_65%_90%,rgba(255,143,54,0.22),transparent_45%),radial-gradient(ellipse_at_75%_0%,rgba(56,189,248,0.18),transparent_40%)]" />

                <section className="relative px-5 py-8 md:px-8 md:py-10 lg:px-12 lg:py-12">
                  <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-10">
                    <div className="marketing-fade-up">
                      <p className="inline-flex rounded-full border border-border/70 bg-background/70 px-3 py-1 text-xs font-semibold tracking-[0.14em] text-foreground/80 dark:border-white/20 dark:bg-white/10 dark:text-white/85">
                        CLARTAS CONTROL LAYER
                      </p>
                      <h1 className="mt-5 max-w-2xl font-display text-4xl font-bold leading-[1.03] tracking-tight text-foreground xs:text-5xl md:text-6xl lg:text-[3.9rem] dark:text-white">
                        {t("hero.title")}
                      </h1>
                      <p className="mt-5 max-w-xl text-sm leading-relaxed text-muted-foreground md:text-base dark:text-slate-300">
                        {t("hero.subtitle")}
                      </p>

                      <div className="mt-7 flex flex-wrap items-center gap-3">
                        <Link
                          href="/sign-up"
                          className={cn(
                            buttonVariants({ size: "lg" }),
                            "h-12 rounded-full bg-foreground px-7 text-sm font-semibold text-background shadow-none hover:bg-foreground/90 dark:bg-white dark:text-[#060b17] dark:hover:bg-[#f0f5ff]",
                          )}
                        >
                          {t("hero.ctaPrimary")}
                        </Link>
                        <Link
                          href="/pricing"
                          className="inline-flex h-12 items-center gap-2 rounded-full border border-border/70 bg-background/70 px-5 text-sm font-medium text-foreground transition hover:border-primary/40 hover:bg-muted dark:border-white/20 dark:bg-white/10 dark:text-white dark:hover:border-white/40 dark:hover:bg-white/15"
                        >
                          {t("hero.ctaSecondary")}
                          <ArrowUpRight className="size-4" />
                        </Link>
                      </div>
                    </div>

                    <div className="marketing-fade-up-delay">
                      <HeroVisual
                        spendLabel={t("heroVisual.spendLabel")}
                        spendStatus={t("heroVisual.spendStatus")}
                        protectionTitle={t("heroVisual.protectionTitle")}
                        protectionStatus={t("heroVisual.protectionStatus")}
                        activateLabel={t("heroVisual.activate")}
                        learnMoreLabel={tc("learnMore")}
                      />
                    </div>
                  </div>

                  <div className="relative mt-7 grid gap-3 sm:grid-cols-3">
                    <div className="rounded-2xl border border-border/70 bg-muted/40 p-4 backdrop-blur-sm dark:border-white/15 dark:bg-white/[0.06]">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground dark:text-slate-300">Quarter Output</p>
                      <p className="mt-2 font-display text-3xl font-bold text-foreground dark:text-white">4.1M+</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/40 p-4 backdrop-blur-sm dark:border-white/15 dark:bg-white/[0.06]">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground dark:text-slate-300">Human Approval</p>
                      <p className="mt-2 font-display text-3xl font-bold text-foreground dark:text-white">98.2%</p>
                    </div>
                    <div className="rounded-2xl border border-border/70 bg-muted/40 p-4 backdrop-blur-sm dark:border-white/15 dark:bg-white/[0.06]">
                      <p className="text-[11px] uppercase tracking-[0.12em] text-muted-foreground dark:text-slate-300">Cycle Time</p>
                      <p className="mt-2 font-display text-3xl font-bold text-foreground dark:text-white">3 Days</p>
                    </div>
                  </div>
                </section>

                <div className="relative h-px bg-gradient-to-r from-transparent via-border/70 to-transparent dark:via-white/12" />

                <section id="why" className="relative px-5 py-8 md:px-8 md:py-10 lg:px-12">
                  <div className="mb-5 flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-2xl bg-white/10 text-white">
                      <Box className="size-6" strokeWidth={1.6} />
                    </div>
                    <span className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-foreground/75 dark:border-white/15 dark:text-white/75">
                      {t("stack.title")}
                    </span>
                    <span className="text-xs uppercase tracking-[0.18em] text-muted-foreground dark:text-slate-400">{t("security.title")}</span>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-5">
                      <h2 className="max-w-xl font-display text-3xl font-bold tracking-tight md:text-4xl">
                        {t("value.title")}
                      </h2>
                      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base dark:text-slate-300">
                        {t("stack.description")}
                      </p>

                      <div className="grid gap-3 sm:grid-cols-3">
                        {values.map(({ key, icon: Icon }) => (
                          <div key={key} className="rounded-2xl bg-muted/35 p-4 transition hover:bg-muted/55 dark:bg-white/[0.03] dark:hover:bg-white/[0.05]">
                            <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                              <Icon className="size-4" />
                            </div>
                            <p className="text-sm font-semibold text-foreground dark:text-white">{t(`value.items.${key}.title`)}</p>
                            <p className="mt-1 text-xs leading-relaxed text-muted-foreground dark:text-slate-300">
                              {t(`value.items.${key}.description`)}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <p className="text-sm leading-relaxed text-muted-foreground dark:text-slate-300">{t("security.description")}</p>

                      <div className="space-y-3">
                        {features.slice(0, 4).map(({ key, icon: Icon }) => (
                          <Link
                            key={key}
                            href={FEATURE_LINKS[key] ?? "/editor"}
                            className="group flex items-center justify-between rounded-2xl bg-muted/35 p-4 transition hover:bg-muted/55 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]"
                          >
                            <span className="inline-flex items-center gap-3 text-sm text-foreground/90 dark:text-white/90">
                              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                                <Icon className="size-4" />
                              </span>
                              {t(`${key}.title`)}
                            </span>
                            <ArrowUpRight className="size-4 text-foreground/65 transition group-hover:text-foreground dark:text-white/65 dark:group-hover:text-white" />
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="relative h-px bg-gradient-to-r from-transparent via-border/70 to-transparent dark:via-white/12" />

                <section id="preview" className="relative px-5 py-8 md:px-8 md:py-10 lg:px-12">
                  <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
                    <div className="p-0 sm:p-0">
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

                    <div className="space-y-4">
                      <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl dark:text-white">{t("preview.title")}</h2>
                      <p className="text-sm leading-relaxed text-muted-foreground md:text-base dark:text-slate-300">
                        {t("preview.subtitle")}
                      </p>

                      <div className="mt-6 space-y-3">
                        {settingsItems.map((item, idx) => (
                          <div
                            key={item.title}
                            className={cn(
                              "rounded-2xl p-4 transition",
                              idx === 0 ? "bg-primary/10 dark:bg-white/[0.08]" : "bg-muted/35 dark:bg-white/[0.03]",
                            )}
                          >
                            <p className="text-sm font-semibold text-foreground dark:text-white">{item.title}</p>
                            <p className="mt-1 text-xs text-muted-foreground dark:text-slate-300">{item.subtitle}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="relative h-px bg-gradient-to-r from-transparent via-border/70 to-transparent dark:via-white/12" />

                <section id="features" className="relative px-5 py-8 md:px-8 md:py-10 lg:px-12">
                  <div className="mx-auto max-w-2xl text-center">
                    <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl dark:text-white">
                      {t("featuresTitle")}
                    </h2>
                    <p className="mt-3 text-muted-foreground dark:text-slate-300">{t("featuresSubtitle")}</p>
                  </div>

                  <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ key, icon: Icon }) => (
                      <Link
                        key={key}
                        href={FEATURE_LINKS[key] ?? "/editor"}
                        className="group relative overflow-hidden rounded-3xl bg-muted/35 p-6 transition hover:-translate-y-1 hover:bg-muted/55 dark:bg-white/[0.04] dark:hover:bg-white/[0.06]"
                      >
                        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-primary/10 to-transparent opacity-0 transition group-hover:opacity-100 dark:from-white/10" />
                        <div className="relative mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary transition group-hover:bg-foreground group-hover:text-background dark:bg-white/10 dark:text-white dark:group-hover:bg-white dark:group-hover:text-[#060b17]">
                          <Icon className="size-6" />
                        </div>
                        <h3 className="relative font-display text-xl font-bold text-foreground dark:text-white">{t(`${key}.title`)}</h3>
                        <p className="relative mt-2 text-sm leading-relaxed text-muted-foreground dark:text-slate-300">
                          {t(`${key}.description`)}
                        </p>
                      </Link>
                    ))}
                  </div>
                </section>

                <div className="relative h-px bg-gradient-to-r from-transparent via-white/12 to-transparent" />

                <section id="pricing" className="relative px-5 py-8 md:px-8 md:py-10 lg:px-12">
                  <div className="mx-auto max-w-2xl text-center">
                    <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl dark:text-white">
                      {t("pricing.title")}
                    </h2>
                    <p className="mt-3 text-muted-foreground dark:text-slate-300">{t("pricing.subtitle")}</p>
                  </div>
                  <div className="mx-auto mt-10 grid max-w-6xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {(Object.keys(PLANS) as Array<keyof typeof PLANS>).map((id) => {
                      const plan = PLANS[id];
                      return (
                        <div
                          key={id}
                          className={cn(
                            "relative flex h-full flex-col rounded-3xl bg-card p-6 text-foreground",
                            plan.popular && "bg-muted/40 shadow-[0_24px_44px_-30px_rgba(0,0,0,0.12)] dark:bg-white/[0.08] dark:shadow-[0_24px_44px_-30px_rgba(255,255,255,0.18)]",
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
                          <h3 className="font-display text-lg font-bold text-foreground dark:text-white">{tb(`${id}.name`)}</h3>
                          <p className="mt-1 text-sm text-muted-foreground dark:text-slate-300">{tb(`${id}.description`)}</p>
                          <div className="mt-4 flex items-baseline gap-1">
                            <span className="font-display text-4xl font-bold text-foreground dark:text-white">${plan.price}</span>
                            <span className="text-sm text-muted-foreground dark:text-slate-300">{t("pricing.perMonth")}</span>
                          </div>
                          <ul className="mt-5 flex-1 space-y-2 text-sm text-foreground/80 dark:text-slate-200">
                            {plan.featureKeys.map((f) => (
                              <li key={f} className="flex items-start gap-2">
                                <Check className="mt-0.5 size-4 shrink-0 text-primary dark:text-white" />
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

                <div className="relative h-px bg-gradient-to-r from-transparent via-border/70 to-transparent dark:via-white/12" />

                <section className="relative px-5 py-8 md:px-8 md:py-10 lg:px-12">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="rounded-3xl bg-muted/35 p-6 md:p-8 dark:bg-white/[0.03]">
                      <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                        <Globe className="size-5" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground dark:text-white">{t("globalLanguages.title")}</h3>
                      <p className="mt-2 text-sm text-muted-foreground dark:text-slate-300">{t("globalLanguages.description")}</p>
                    </div>
                    <div className="rounded-3xl bg-muted/35 p-6 md:p-8 dark:bg-white/[0.03]">
                      <div className="mb-4 flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary dark:bg-white/10 dark:text-white">
                        <Workflow className="size-5" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground dark:text-white">{t("security.title")}</h3>
                      <p className="mt-2 text-sm text-muted-foreground dark:text-slate-300">{t("security.description")}</p>
                    </div>
                  </div>
                </section>

                <div className="relative h-px bg-gradient-to-r from-transparent via-border/70 to-transparent dark:via-white/12" />

                <section className="relative px-5 py-10 text-center md:px-8 md:py-14 lg:px-12 lg:py-16">
                  <h2 className="mx-auto max-w-2xl font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl dark:text-white">
                    {t("finalCta.title")}
                  </h2>
                  <p className="mx-auto mt-4 max-w-xl text-muted-foreground dark:text-slate-300">{t("finalCta.subtitle")}</p>
                  <Link
                    href="/sign-up"
                    className={cn(buttonVariants({ size: "lg" }), "mt-8 h-12 rounded-full px-8")}
                  >
                    {t("finalCta.cta")}
                    <ArrowRight className="size-4" />
                  </Link>
                </section>
              </div>
            </div>
          </div>
        </main>

        <MarketingFooter />
      </div>
    </MarketingProviders>
  );
}
