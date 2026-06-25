import { getTranslations } from "next-intl/server";
import { Sparkles } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button";
import { LanguageSwitcher } from "@/features/localization/language-switcher";

export async function MarketingNav() {
  const t = await getTranslations("nav");
  return (
    <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
      <div className="container flex h-16 items-center justify-between">
        <Link href="/" className="flex items-center gap-2 font-bold">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="size-5" />
          </span>
          <span className="text-lg tracking-tight">CLARTAS</span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
          <Link href="/#features" className="hover:text-foreground">
            {t("features")}
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            {t("pricing")}
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <LanguageSwitcher />
          <Link href="/sign-in" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            {t("signIn")}
          </Link>
          <Link href="/sign-up" className={buttonVariants({ size: "sm" })}>
            {t("signUp")}
          </Link>
        </div>
      </div>
    </header>
  );
}
