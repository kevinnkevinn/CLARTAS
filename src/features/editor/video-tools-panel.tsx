"use client";

import { useTranslations } from "next-intl";
import { Film, Scissors, Merge, Gauge, Subtitles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

/** Placeholder panel for advanced video editing tools (cut, split, merge, etc.). */
export function VideoToolsPanel() {
  const t = useTranslations("editor.videoTools");
  const tc = useTranslations("common");

  const tools = [
    { icon: Scissors, key: "cut" },
    { icon: Merge, key: "merge" },
    { icon: Gauge, key: "speed" },
    { icon: Subtitles, key: "subtitles" },
    { icon: Film, key: "motion" },
  ] as const;

  return (
    <div className="space-y-3 rounded-lg border border-dashed bg-muted/20 p-4">
      <p className="text-sm font-semibold">{t("title")}</p>
      <p className="text-xs text-muted-foreground">{t("subtitle")}</p>
      <div className="grid gap-2 sm:grid-cols-2">
        {tools.map(({ icon: Icon, key }) => (
          <div
            key={key}
            className="flex items-center justify-between rounded-md border bg-card px-3 py-2 text-sm"
          >
            <span className="flex items-center gap-2">
              <Icon className="size-4 text-muted-foreground" />
              {t(key)}
            </span>
            <Badge variant="secondary" className="text-[10px]">
              {tc("comingSoon")}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
