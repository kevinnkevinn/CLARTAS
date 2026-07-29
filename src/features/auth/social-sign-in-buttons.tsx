"use client";

import { useState, useTransition, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AlertCircle, Loader2 } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { createClient } from "@/lib/supabase/client";
import { signInWithOAuthProvider, isAppleSignInAvailable } from "@/lib/mobile/native-auth";
import { Button } from "@/components/ui/button";

type OAuthProvider = "google" | "apple" | "facebook";
type ProviderButton = {
  provider: OAuthProvider;
  label: string;
  icon: ReactNode;
};

function GoogleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="currentColor"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="currentColor"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="currentColor"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="currentColor"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M13.5 9H16V6h-2.5C10.7 6 9 7.7 9 10.6V13H7v3h2v5h3v-5h2.5l.5-3H12v-2.4c0-.7.3-1.1 1.5-1.1Z" />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg className="size-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </svg>
  );
}

export function SocialSignInButtons() {
  const t = useTranslations("auth");
  const locale = useLocale() as Locale;
  const [error, setError] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<OAuthProvider | null>(null);
  const [pending, startTransition] = useTransition();
  const showApple = isAppleSignInAvailable();

  function handleProvider(provider: OAuthProvider) {
    setError(null);
    setActiveProvider(provider);
    startTransition(async () => {
      const supabase = createClient();
      if (!supabase) {
        setError(t("notConfigured") || "Authentication is not configured");
        setActiveProvider(null);
        return;
      }

      try {
        const result = await signInWithOAuthProvider(supabase, provider, locale);
        if (result.error) {
          setError(result.error);
          setActiveProvider(null);
        }
        // On success, the user is redirected automatically
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : t("authError") || "An error occurred. Please try again."
        );
        setActiveProvider(null);
      }
    });
  }

  const providers: ProviderButton[] = [
    { provider: "google", label: t("signInWithGoogle"), icon: <GoogleIcon /> },
    { provider: "facebook", label: t("signInWithFacebook"), icon: <FacebookIcon /> },
    ...(showApple
      ? [{ provider: "apple" as OAuthProvider, label: t("signInWithApple"), icon: <AppleIcon /> }]
      : []),
  ];

  const isLoading = pending && activeProvider !== null;

  return (
    <div className="space-y-3">
      {providers.map(({ provider, label, icon }) => (
        <Button
          key={provider}
          type="button"
          variant="outline"
          className="w-full gap-2"
          disabled={pending}
          onClick={() => handleProvider(provider)}
        >
          {activeProvider === provider && isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            icon
          )}
          {activeProvider === provider && isLoading ? (
            <span>{t("loading") || "Loading..."}</span>
          ) : (
            label
          )}
        </Button>
      ))}
      {error ? (
        <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
          <AlertCircle className="mt-0.5 size-3 shrink-0 flex-none" />
          <span>{error}</span>
        </div>
      ) : null}
    </div>
  );
}
