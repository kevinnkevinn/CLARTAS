import { setRequestLocale, getTranslations } from "next-intl/server";
import { Coins } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EDITOR_TOOLS } from "@/features/editor/tools";

export default async function AiToolsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("aiTools");
  const tt = await getTranslations("editor.tool");
  const tc = await getTranslations("common");

  return (
    <div>
      <PageHeader title={t("title")} description={t("subtitle")} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EDITOR_TOOLS.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link key={tool.id} href={`/editor?tool=${tool.id}`}>
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader>
                  <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <CardTitle className="text-base">{tt(`${tool.i18nKey}.name`)}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {tt(`${tool.i18nKey}.description`)}
                  </p>
                  <Badge variant="secondary" className="gap-1">
                    <Coins className="size-3 text-amber-500" />
                    {tool.cost} {tc("credits")}
                  </Badge>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
