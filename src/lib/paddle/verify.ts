import crypto from "crypto";
import { getPaddleWebhookSecret } from "@/lib/env";

/**
 * Verify a Paddle Billing webhook signature.
 * Header format: `ts=<unix>;h1=<hmac-sha256>` where the HMAC is computed over
 * `${ts}:${rawBody}` using the webhook secret. Constant-time compared.
 */
export function verifyPaddleSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = getPaddleWebhookSecret();
  if (!secret || !signatureHeader) return false;

  const parts = Object.fromEntries(
    signatureHeader.split(";").map((kv) => {
      const [k, v] = kv.split("=");
      return [k?.trim(), v?.trim()];
    }),
  ) as { ts?: string; h1?: string };

  if (!parts.ts || !parts.h1) return false;

  const signedPayload = `${parts.ts}:${rawBody}`;
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex");

  try {
    const a = Buffer.from(expected, "hex");
    const b = Buffer.from(parts.h1, "hex");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
