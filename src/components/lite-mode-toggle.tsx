"use client";

import { useTranslations } from "next-intl";
import { Zap, ZapOff } from "lucide-react";
import { useLiteMode } from "@/lib/lite-mode/context";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export function LiteModeToggle() {
  const t = useTranslations("settings");
  const { lite, setLite } = useLiteMode();

  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
      <div className="space-y-1">
        <Label className="text-base">{t("liteMode")}</Label>
        <p className="text-sm text-muted-foreground">{t("liteModeHint")}</p>
      </div>
      <Button
        type="button"
        variant={lite ? "default" : "outline"}
        size="sm"
        onClick={() => setLite(!lite)}
        aria-pressed={lite}
      >
        {lite ? <ZapOff className="size-4" /> : <Zap className="size-4" />}
        {lite ? t("liteModeOn") : t("liteModeOff")}
      </Button>
    </div>
  );
}
