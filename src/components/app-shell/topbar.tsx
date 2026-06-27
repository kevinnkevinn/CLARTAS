import { Coins } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/features/localization/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

interface TopbarProps {
  email: string;
  fullName?: string | null;
  credits: number;
  isAdmin: boolean;
  workspaceName?: string | null;
}

export async function Topbar({
  email,
  fullName,
  credits,
  isAdmin,
  workspaceName,
}: TopbarProps) {
  const t = await getTranslations("credits");

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-3 border-b border-border/50 bg-background/70 px-4 backdrop-blur-xl md:px-6">
      <div className="flex items-center gap-3">
        <MobileNav isAdmin={isAdmin} />
        {workspaceName ? (
          <span className="hidden rounded-full border border-border/60 bg-card/50 px-3 py-1 text-xs font-medium text-muted-foreground md:inline">
            {workspaceName}
          </span>
        ) : null}
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/billing"
          className="flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-sm font-medium text-amber-700 transition-colors hover:bg-amber-500/20 dark:text-amber-200"
          title={t("balance")}
        >
          <Coins className="size-4 text-amber-400" />
          <span>{credits.toLocaleString()}</span>
        </Link>
        <ThemeToggle />
        <LanguageSwitcher />
        <UserMenu email={email} fullName={fullName} />
      </div>
    </header>
  );
}
