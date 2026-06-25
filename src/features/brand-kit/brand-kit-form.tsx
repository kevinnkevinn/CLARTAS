"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, Plus } from "lucide-react";
import { createBrandKitAction, type BrandKitResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BrandKitForm() {
  const t = useTranslations("brandKit");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<BrandKitResult, FormData>(
    createBrandKitAction,
    {},
  );

  return (
    <form action={action} className="space-y-3">
      {state.error ? (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4" /> {state.error}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="name">{t("name")}</Label>
        <Input id="name" name="name" required />
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="colors">{t("colors")}</Label>
          <Input id="colors" name="colors" placeholder="#4f46e5, #f43f5e" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="fonts">{t("fonts")}</Label>
          <Input id="fonts" name="fonts" placeholder="Inter, Poppins" />
        </div>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="voice">{t("voice")}</Label>
        <Textarea id="voice" name="voice" rows={2} placeholder={t("voicePlaceholder")} />
      </div>
      <Button type="submit" disabled={pending}>
        <Plus className="size-4" /> {tc("create")}
      </Button>
    </form>
  );
}
