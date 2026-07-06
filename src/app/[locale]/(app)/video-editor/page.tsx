import dynamic from "next/dynamic";
import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";

const VideoEditorStudio = dynamic(
  () => import("@/features/video/video-editor-studio").then((m) => m.VideoEditorStudio),
  { loading: () => <div className="h-64 animate-pulse rounded-xl bg-muted" /> },
);

export default async function VideoEditorPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);
  await requireUser(safeLocale);

  return (
    <div>
      <PageHeader title="Video Editor" description="Cut, split, merge, speed — export TikTok/Reels/Shorts" />
      <VideoEditorStudio />
    </div>
  );
}
