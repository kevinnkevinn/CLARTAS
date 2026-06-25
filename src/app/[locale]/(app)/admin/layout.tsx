import { isValidLocale, type Locale } from "@/i18n/routing";
import { requireAdmin } from "@/features/auth/guards";

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const safeLocale: Locale = isValidLocale(locale) ? locale : "en";
  // Redirects non-admins to the dashboard.
  await requireAdmin(safeLocale);
  return <>{children}</>;
}
