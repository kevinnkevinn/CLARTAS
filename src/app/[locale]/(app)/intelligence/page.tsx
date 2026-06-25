import { setRequestLocale, getTranslations } from "next-intl/server";
import { Search, MessageCircle, Radio, ArrowRight } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default async function IntelligencePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("intelligence");
  await requireUser(safeLocale);

  const modules = [
    { key: "marketResearch", icon: Search, href: "/intelligence/research" },
    { key: "customerService", icon: MessageCircle, href: "/intelligence/assistant" },
    { key: "liveSelling", icon: Radio, href: "/intelligence/live-selling" },
  ] as const;

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("subtitle")} />

      <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
        {t("comingSoonNote")}
      </p>

      <div className="grid gap-4 md:grid-cols-3">
        {modules.map(({ key, icon: Icon, href }) => (
          <Card key={key} className="flex flex-col">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </div>
              <CardTitle className="text-lg">{t(`${key}.title`)}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col">
              <p className="text-sm text-muted-foreground">{t(`${key}.description`)}</p>
              <Link href={href} className={cn(buttonVariants({ variant: "outline" }), "mt-4")}>
                {t(`${key}.cta`)}
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
