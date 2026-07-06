import dynamic from "next/dynamic";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { getCreditBalance } from "@/features/credits/service";
import { PageHeader } from "@/components/page-header";

const EditorStudio = dynamic(
  () => import("@/features/editor/editor-studio").then((m) => m.EditorStudio),
  { loading: () => <div className="h-96 animate-pulse rounded-xl bg-muted" /> },
);

export default async function EditorPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tool?: string }>;
}) {
  const { locale } = await params;
  const { tool } = await searchParams;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const t = await getTranslations("editor");
  const user = await requireUser(safeLocale);
  const credits = await getCreditBalance(user.id);

  return (
    <div>
      <PageHeader title={t("title")} />
      <EditorStudio initialTool={tool} credits={credits} />
    </div>
  );
}
