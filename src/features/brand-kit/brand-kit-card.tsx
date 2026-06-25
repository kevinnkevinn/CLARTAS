"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteBrandKitAction } from "@/features/brand-kit/actions";
import type { BrandKit } from "@/lib/supabase/types";

export function BrandKitCard({ kit }: { kit: BrandKit }) {
  const t = useTranslations("brandKit");
  const tc = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(tc("delete") + "?")) return;
    startTransition(async () => {
      await deleteBrandKitAction(kit.id);
      router.refresh();
    });
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between space-y-0">
        <CardTitle className="text-base">{kit.name}</CardTitle>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 text-destructive"
          disabled={pending}
          onClick={handleDelete}
          aria-label={tc("delete")}
        >
          <Trash2 className="size-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="flex flex-wrap gap-2">
          {kit.brand_colors.map((c) => (
            <span
              key={c}
              className="flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs"
            >
              <span className="size-3 rounded-full border" style={{ backgroundColor: c }} />
              {c}
            </span>
          ))}
        </div>
        {kit.brand_fonts.length ? (
          <p className="text-muted-foreground">{kit.brand_fonts.join(", ")}</p>
        ) : null}
        {kit.brand_voice ? (
          <p className="italic text-muted-foreground">&ldquo;{kit.brand_voice}&rdquo;</p>
        ) : null}
        {kit.logo_url ? (
          <p className="text-xs text-muted-foreground">{t("logoUploaded")}</p>
        ) : null}
      </CardContent>
    </Card>
  );
}
