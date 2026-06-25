"use client";

import { useActionState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { signUpAction, type AuthResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function SignUpForm() {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [state, formAction, isPending] = useActionState<AuthResult, FormData>(
    signUpAction,
    {},
  );

  if (state.success) {
    return (
      <div className="flex items-start gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        <CheckCircle2 className="mt-0.5 size-4 shrink-0" />
        <span>{t("checkEmail")}</span>
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
        <Label htmlFor="fullName">{t("fullName")}</Label>
        <Input id="fullName" name="fullName" type="text" autoComplete="name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder={t("emailPlaceholder")}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          minLength={6}
          autoComplete="new-password"
          placeholder={t("passwordPlaceholder")}
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? t("signingUp") : t("signUpButton")}
      </Button>
    </form>
  );
}
