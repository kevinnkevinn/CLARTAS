import { Coins } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/features/localization/language-switcher";
import { UserMenu } from "./user-menu";
import { MobileNav } from "./mobile-nav";

interface TopbarProps {
  email: string;
  fullName?: string | null;
  credits: number;
  isAdmin: boolean;
}

export async function Topbar({ email, fullName, credits, isAdmin }: TopbarProps) {
  const t = await getTranslations("credits");

  return (
    <header className="flex h-16 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <div className="flex items-center gap-3">
        <MobileNav isAdmin={isAdmin} />
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <Link
          href="/billing"
          className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm font-medium hover:bg-accent"
          title={t("balance")}
        >
          <Coins className="size-4 text-amber-500" />
          <span>{credits}</span>
        </Link>
        <LanguageSwitcher />
        <UserMenu email={email} fullName={fullName} />
      </div>
    </header>
  );
}
