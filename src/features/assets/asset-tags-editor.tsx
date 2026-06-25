"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { updateAssetTagsAction } from "@/features/assets/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AssetTagsEditor({
  assetId,
  initialTags,
}: {
  assetId: string;
  initialTags: string[];
}) {
  const t = useTranslations("assets");
  const tc = useTranslations("common");
  const router = useRouter();
  const [tagsText, setTagsText] = useState(initialTags.join(", "));
  const [pending, startTransition] = useTransition();

  function save() {
    const tags = tagsText
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    startTransition(async () => {
      await updateAssetTagsAction(assetId, tags);
      router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="tags">{t("tags")}</Label>
      <Input
        id="tags"
        value={tagsText}
        onChange={(e) => setTagsText(e.target.value)}
        placeholder={t("tagsPlaceholder")}
      />
      <Button type="button" size="sm" onClick={save} disabled={pending}>
        {tc("save")}
      </Button>
    </div>
  );
}
