"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

export function GoogleSignInButton() {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleGoogle() {
    setError(null);
    startTransition(async () => {
      const supabase = createClient();
      if (!supabase) {
        setError(t("notConfigured"));
        return;
      }
      const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
      const { data, error: err } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: `${appUrl}/${locale}/dashboard` },
      });
      if (err) {
        setError(err.message);
        return;
      }
      if (data.url) window.location.href = data.url;
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        className="w-full"
        disabled={pending}
        onClick={handleGoogle}
      >
        {t("signInWithGoogle")}
      </Button>
      {error ? <p className="text-center text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
