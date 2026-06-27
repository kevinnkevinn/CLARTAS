"use client";

import { useState, useTransition } from "react";
import { LogOut, User as UserIcon, Settings } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/i18n/routing";
import { Link } from "@/i18n/navigation";
import { signOutAction } from "@/features/auth/actions";
import { env } from "@/lib/env";

export function UserMenu({ email, fullName }: { email: string; fullName?: string | null }) {
  const t = useTranslations("nav");
  const locale = useLocale() as Locale;
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initials = (fullName || email || "U").slice(0, 1).toUpperCase();

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground"
        aria-label="Account menu"
      >
        {initials}
      </button>

      {open ? (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-lg border bg-card p-1 shadow-lg">
            <div className="flex items-center gap-2 px-3 py-2 text-sm">
              <UserIcon className="size-4 text-muted-foreground" />
              <div className="min-w-0">
                {fullName ? <p className="truncate font-medium">{fullName}</p> : null}
                <p className="truncate text-xs text-muted-foreground">{email}</p>
              </div>
            </div>
            <div className="my-1 h-px bg-border" />
            {env.demoMode ? (
              <Link
                href="/settings"
                onClick={() => setOpen(false)}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
              >
                <Settings className="size-4" />
                {t("settings")}
              </Link>
            ) : (
              <button
                disabled={isPending}
                onClick={() => startTransition(() => signOutAction(locale))}
                className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm text-destructive hover:bg-destructive/10"
              >
                <LogOut className="size-4" />
                {t("signOut")}
              </button>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
