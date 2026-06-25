"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { updateProfileAction, type SettingsResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { localeLabels, locales } from "@/i18n/routing";

interface SettingsFormProps {
  email: string;
  fullName: string;
  preferredLocale: string;
}

export function SettingsForm({ email, fullName, preferredLocale }: SettingsFormProps) {
  const t = useTranslations("settings");
  const ta = useTranslations("auth");
  const [state, action, pending] = useActionState<SettingsResult, FormData>(
    updateProfileAction,
    {},
  );

  return (
    <form action={action} className="max-w-lg space-y-4">
      {state.success ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" /> {t("saved")}
        </div>
      ) : null}
      {state.error ? (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4" /> {state.error}
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="email">{ta("email")}</Label>
        <Input id="email" value={email} disabled />
      </div>
      <div className="space-y-2">
        <Label htmlFor="fullName">{ta("fullName")}</Label>
        <Input id="fullName" name="fullName" defaultValue={fullName} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="preferredLocale">{t("preferredLanguage")}</Label>
        <Select id="preferredLocale" name="preferredLocale" defaultValue={preferredLocale}>
          {locales.map((l) => (
            <option key={l} value={l}>
              {localeLabels[l]}
            </option>
          ))}
        </Select>
      </div>

      <Button type="submit" disabled={pending}>
        {t("saveChanges")}
      </Button>
    </form>
  );
}
