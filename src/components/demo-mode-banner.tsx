"use client";

import { useTranslations } from "next-intl";
import { Sparkles } from "lucide-react";
import { env } from "@/lib/env";

export function DemoModeBanner() {
  const t = useTranslations("demo");

  if (!env.demoMode) return null;

  return (
    <div className="border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-center text-sm text-emerald-300">
      <span className="inline-flex items-center gap-2">
        <Sparkles className="size-3.5" />
        {t("banner")}
      </span>
    </div>
  );
}
