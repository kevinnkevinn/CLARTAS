import { Info } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { isAiMockMode } from "@/lib/env";

/** Renders a subtle banner when AI provider keys are not configured. */
export async function MockModeBanner() {
  if (!isAiMockMode()) return null;
  const t = await getTranslations("mock");
  return (
    <div className="flex items-start gap-2 border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-xs text-amber-200">
      <Info className="mt-0.5 size-3.5 shrink-0 text-amber-400" />
      <span>{t("banner")}</span>
    </div>
  );
}
