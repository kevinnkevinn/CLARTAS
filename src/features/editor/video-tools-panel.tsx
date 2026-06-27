"use client";

import { useTranslations } from "next-intl";
import { Film, Scissors, Merge, Gauge, Subtitles } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

/** Video tools — opens Video Editor with the selected tool focused. */
export function VideoToolsPanel() {
  const t = useTranslations("editor.videoTools");
  const router = useRouter();

  const tools = [
    { icon: Scissors, key: "cut", hash: "cut" },
    { icon: Merge, key: "merge", hash: "merge" },
    { icon: Gauge, key: "speed", hash: "speed" },
    { icon: Subtitles, key: "subtitles", hash: "subtitles" },
    { icon: Film, key: "motion", hash: "motion" },
  ] as const;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/20 p-4">
      <p className="text-sm font-semibold">{t("title")}</p>
      <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {tools.map(({ icon: Icon, key, hash }) => (
          <Button
            key={key}
            type="button"
            variant="outline"
            className="h-auto justify-start gap-2 py-2"
            onClick={() => router.push(`/video-editor#${hash}`)}
          >
            <Icon className="size-4 text-primary" />
            {t(key)}
          </Button>
        ))}
      </div>
      <Button type="button" className="w-full" onClick={() => router.push("/video-editor")}>
        Buka Video Editor lengkap
      </Button>
    </div>
  );
}
