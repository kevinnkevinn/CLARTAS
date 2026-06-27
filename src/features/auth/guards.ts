import { redirect } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { DEMO_USER, isDemoMode } from "@/lib/demo/config";
import { getSessionUser, isAdminUser, type SessionUser } from "./session";

/**
 * Require an authenticated user in a Server Component.
 * Redirects to the localized sign-in page when not authenticated.
 */
export async function requireUser(locale: Locale): Promise<SessionUser> {
  if (isDemoMode()) return DEMO_USER;

  const user = await getSessionUser();
  if (!user) {
    redirect({ href: "/sign-in", locale });
  }
  // `redirect` throws, so this is unreachable when user is null.
  return user as SessionUser;
}

/** Require an admin user. Redirects non-admins to the dashboard. */
export async function requireAdmin(locale: Locale): Promise<SessionUser> {
  const user = await requireUser(locale);
  if (!isAdminUser(user)) {
    redirect({ href: "/dashboard", locale });
  }
  return user;
}
