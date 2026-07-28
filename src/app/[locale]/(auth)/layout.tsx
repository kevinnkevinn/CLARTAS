import { setRequestLocale } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { redirect } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { isDemoMode } from "@/lib/demo/config";
import { LanguageSwitcher } from "@/features/localization/language-switcher";
import { AuthThemeToggle } from "@/components/auth-theme-toggle";

export default async function AuthLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  if (isDemoMode()) {
    redirect({ href: "/dashboard", locale: safeLocale });
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          CLARTAS
        </Link>
        <div className="flex items-center gap-2">
          <AuthThemeToggle />
          <LanguageSwitcher />
        </div>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
