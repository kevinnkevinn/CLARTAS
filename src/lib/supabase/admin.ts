import { createClient } from "@supabase/supabase-js";
import { env, getServiceRoleKey } from "@/lib/env";

/**
 * Privileged Supabase client using the SERVICE ROLE key.
 * SERVER ONLY. Never import this into client components.
 * Bypasses RLS — use exclusively in trusted server contexts:
 * webhooks, credit deduction, admin actions.
 */
export function createAdminClient() {
  const serviceRoleKey = getServiceRoleKey();
  if (!env.supabaseUrl || !serviceRoleKey) {
    return null;
  }
  return createClient(env.supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
