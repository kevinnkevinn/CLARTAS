import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/supabase/types";
import { getAdminEmails } from "@/lib/env";

export interface SessionUser {
  id: string;
  email: string;
  profile: Profile | null;
}

/**
 * Returns the currently authenticated user + profile, or null.
 * Never throws — safe to call from any Server Component.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle();

  return {
    id: user.id,
    email: user.email ?? "",
    profile: (profile as Profile) ?? null,
  };
}

/** True if the user is an admin (DB flag or ADMIN_EMAILS allowlist). */
export function isAdminUser(user: SessionUser | null): boolean {
  if (!user) return false;
  if (user.profile?.is_admin) return true;
  return getAdminEmails().includes(user.email.toLowerCase());
}
