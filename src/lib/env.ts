/**
 * Centralized, typed access to environment variables with safe fallbacks.
 * Server-only secrets are never imported into client components.
 */

export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  paddleClientToken: process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "",
  paddleEnv: process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox",
};

/** True when Supabase public config is present. Used to enable real auth/data. */
export const isSupabaseConfigured = Boolean(env.supabaseUrl && env.supabaseAnonKey);

// --- Server-only helpers (do not call from client components) ---------------

export function getServiceRoleKey(): string {
  return process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
}

export function getFalKey(): string {
  return process.env.FAL_KEY ?? "";
}

export function getReplicateToken(): string {
  return process.env.REPLICATE_API_TOKEN ?? "";
}

/** AI runs in mock mode when no provider keys are configured. */
export function isAiMockMode(): boolean {
  return !getFalKey() && !getReplicateToken();
}

export function getResendKey(): string {
  return process.env.RESEND_API_KEY ?? "";
}

export function getResendFrom(): string {
  return process.env.RESEND_FROM_EMAIL ?? "CLARTAS <onboarding@resend.dev>";
}

export function getMakeWebhookUrl(): string {
  return process.env.MAKE_WEBHOOK_URL ?? "";
}

export function getPaddleApiKey(): string {
  return process.env.PADDLE_API_KEY ?? "";
}

export function getPaddleWebhookSecret(): string {
  return process.env.PADDLE_WEBHOOK_SECRET ?? "";
}

export function getAdminEmails(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}
