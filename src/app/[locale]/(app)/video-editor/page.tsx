import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { PageHeader } from "@/components/page-header";
import { VideoEditorStudio } from "@/features/video/video-editor-studio";

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
