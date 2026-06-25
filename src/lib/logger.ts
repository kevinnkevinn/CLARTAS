import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Safe server-side logger. Records an error to the `error_logs` table when the
 * service role is available, and to the server console. NEVER logs secrets.
 */
export async function logError(
  scope: string,
  error: unknown,
  context: Record<string, unknown> = {},
  userId?: string | null,
): Promise<void> {
  const message = error instanceof Error ? error.message : String(error);
  // Console (server-side only). Stack is kept local, not persisted.
  console.error(`[CLARTAS:${scope}]`, message);

  try {
    const admin = createAdminClient();
    if (!admin) return;
    await admin.from("error_logs").insert({
      user_id: userId ?? null,
      scope,
      message: message.slice(0, 1000),
      context: sanitizeContext(context),
    });
  } catch {
    // Logging must never break the request path.
  }
}

/** Strip anything that looks like a secret before persisting context. */
function sanitizeContext(context: Record<string, unknown>): Record<string, unknown> {
  const redactKeys = /(key|token|secret|password|authorization)/i;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(context)) {
    out[k] = redactKeys.test(k) ? "[redacted]" : v;
  }
  return out;
}
