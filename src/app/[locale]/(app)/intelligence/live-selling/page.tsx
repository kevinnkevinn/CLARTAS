import { setRequestLocale, getTranslations } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default async function LiveSellingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);
  const t = await getTranslations("intelligence.liveSelling");
  const tc = await getTranslations("common");
  await requireUser(safeLocale);

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Card>
        <CardContent className="space-y-4 p-6">
          <p className="text-sm text-muted-foreground">
            Generate live stream scripts for TikTok, Shopee Live, and Instagram. Virtual presenter
            and TTS integration hooks into the Editor Studio voiceover tool.
          </p>
          <Link href="/editor?tool=voiceover" className={buttonVariants()}>
            {t("cta")}
          </Link>
          <Link href="/intelligence" className={buttonVariants({ variant: "outline" })}>
            {tc("back")}
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
