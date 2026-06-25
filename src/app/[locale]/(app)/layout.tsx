import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { isAdminUser } from "@/features/auth/session";
import { getCreditBalance } from "@/features/credits/service";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { MockModeBanner } from "@/components/mock-mode-banner";
import { AppProviders } from "@/components/providers";
import { getActiveWorkspace } from "@/features/workspace/service";

export default async function AppLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  setRequestLocale(safeLocale);

  const user = await requireUser(safeLocale);
  const isAdmin = isAdminUser(user);
  const credits = await getCreditBalance(user.id);
  const workspace = await getActiveWorkspace(user.id);

  return (
    <AppProviders>
      <div className="flex min-h-screen">
        <Sidebar isAdmin={isAdmin} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Topbar
            email={user.email}
            fullName={user.profile?.full_name}
            credits={credits}
            isAdmin={isAdmin}
            workspaceName={workspace?.name}
          />
          <MockModeBanner />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AppProviders>
  );
}
