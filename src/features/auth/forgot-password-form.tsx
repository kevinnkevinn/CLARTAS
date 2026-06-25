"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { forgotPasswordAction, type AuthResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [state, formAction, pending] = useActionState<AuthResult, FormData>(
    forgotPasswordAction,
    {},
  );

  if (state.success) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <span>{t("resetEmailSent")}</span>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="locale" value={locale} />
      {state.error ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="mt-0.5 size-4 shrink-0" />
          <span>{state.error}</span>
        </div>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input id="email" name="email" type="email" required placeholder={t("emailPlaceholder")} />
      </div>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? t("sendingReset") : t("sendResetLink")}
      </Button>
    </form>
  );
}
