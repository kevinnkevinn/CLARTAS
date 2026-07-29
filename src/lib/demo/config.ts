import type { Profile } from "@/lib/supabase/types";
import type { SessionUser } from "@/features/auth/session";

export const DEMO_USER_ID = "00000000-0000-4000-8000-000000000001";

const DEMO_PROFILE: Profile = {
  id: DEMO_USER_ID,
  email: "demo@clartas.local",
  full_name: "Demo User",
  avatar_url: null,
  plan_status: "free",
  preferred_locale: "id",
  ai_credits: 999_999,
  is_admin: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const DEMO_USER: SessionUser = {
  id: DEMO_USER_ID,
  email: "demo@clartas.local",
  profile: DEMO_PROFILE,
};

/** Server-side demo mode — no login required, unlimited credits, local processing. */
export function isDemoMode(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE === "true";
}

/** Temporary full-credits mode while keeping real auth/app flows enabled. */
export function isFullCreditsMode(): boolean {
  return process.env.NEXT_PUBLIC_FULL_CREDITS_MODE === "true";
}

export const DEMO_CREDITS = 999_999;
