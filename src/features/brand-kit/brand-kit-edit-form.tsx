"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Pencil, Upload } from "lucide-react";
import { updateBrandKitAction, uploadBrandLogoAction } from "@/features/brand-kit/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { BrandKit } from "@/lib/supabase/types";

export function BrandKitEditForm({ kit }: { kit: BrandKit }) {
  const t = useTranslations("brandKit");
  const tc = useTranslations("common");
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <Button type="button" size="sm" variant="outline" onClick={() => setEditing(true)}>
        <Pencil className="size-3.5" /> {tc("edit")}
      </Button>
    );
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setError(null);
    startTransition(async () => {
      const res = await updateBrandKitAction(kit.id, {}, fd);
      if (res.error) setError(res.error);
      else {
        setEditing(false);
        router.refresh();
      }
    });
  }

  function handleLogo(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("logo", file);
    startTransition(async () => {
      const res = await uploadBrandLogoAction(kit.id, fd);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-3 border-t pt-3">
      <form onSubmit={handleSubmit} className="space-y-2">
        <div className="space-y-1">
          <Label htmlFor={`name-${kit.id}`}>{t("name")}</Label>
          <Input id={`name-${kit.id}`} name="name" defaultValue={kit.name} required />
        </div>
        <Input
          name="colors"
          defaultValue={kit.brand_colors.join(", ")}
          placeholder={t("colors")}
        />
        <Input name="fonts" defaultValue={kit.brand_fonts.join(", ")} placeholder={t("fonts")} />
        <Textarea name="voice" rows={2} defaultValue={kit.brand_voice ?? ""} />
        {error ? <p className="text-xs text-destructive">{error}</p> : null}
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={pending}>
            {tc("save")}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => setEditing(false)}>
            {tc("cancel")}
          </Button>
        </div>
      </form>
      <div>
        <Label className="flex items-center gap-1 text-xs">
          <Upload className="size-3.5" /> {t("logo")}
        </Label>
        <Input type="file" accept="image/*" className="mt-1" onChange={handleLogo} disabled={pending} />
      </div>
    </div>
  );
}
