import { setRequestLocale } from "next-intl/server";
import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireUser } from "@/features/auth/guards";
import { isAdminUser } from "@/features/auth/session";
import { getCreditBalance } from "@/features/credits/service";
import { AppShellBackground } from "@/components/app-shell/app-shell-background";
import { Sidebar } from "@/components/app-shell/sidebar";
import { Topbar } from "@/components/app-shell/topbar";
import { MockModeBanner } from "@/components/mock-mode-banner";
import { DemoModeBanner } from "@/components/demo-mode-banner";
import { AppProviders } from "@/components/providers";
import { getActiveWorkspace } from "@/features/workspace/service";
import { isDemoMode } from "@/lib/demo/config";

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
  const workspace = isDemoMode() ? null : await getActiveWorkspace(user.id);
  const workspaceName = isDemoMode() ? "Demo Workspace" : workspace?.name;

  return (
    <AppProviders>
      <div className="relative flex min-h-screen">
        <AppShellBackground />
        <Sidebar isAdmin={isAdmin} />
        <div className="relative z-10 flex min-w-0 flex-1 flex-col">
          <Topbar
            email={user.email}
            fullName={user.profile?.full_name}
            credits={credits}
            isAdmin={isAdmin}
            workspaceName={workspaceName}
          />
          <DemoModeBanner />
          <MockModeBanner />
          <main className="flex-1 p-4 md:p-8">{children}</main>
        </div>
      </div>
    </AppProviders>
  );
}
