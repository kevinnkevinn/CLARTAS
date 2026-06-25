import { getMakeWebhookUrl } from "@/lib/env";

/**
 * Fire a Make.com automation webhook. Per the blueprint, we only ever send
 * lightweight JSON (ids, statuses, signed URLs) — never large binary files.
 * No-ops safely when MAKE_WEBHOOK_URL is not configured.
 */
export async function triggerMakeWebhook(
  event: string,
  payload: Record<string, unknown>,
): Promise<boolean> {
  const url = getMakeWebhookUrl();
  if (!url) {
    console.info(`[CLARTAS:make] (mock) event "${event}"`);
    return false;
  }
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ event, payload, sentAt: new Date().toISOString() }),
    });
    return res.ok;
  } catch (error) {
    console.error("[CLARTAS:make] webhook failed", error);
    return false;
  }
}
