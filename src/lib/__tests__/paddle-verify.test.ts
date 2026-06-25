import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import { verifyPaddleSignature } from "@/lib/paddle/verify";

const SECRET = "whsec_test_secret";

function sign(body: string, ts: string, secret = SECRET): string {
  const h1 = crypto.createHmac("sha256", secret).update(`${ts}:${body}`).digest("hex");
  return `ts=${ts};h1=${h1}`;
}

describe("verifyPaddleSignature", () => {
  beforeEach(() => {
    process.env.PADDLE_WEBHOOK_SECRET = SECRET;
  });

  it("accepts a correctly signed payload", () => {
    const body = JSON.stringify({ event_type: "transaction.completed" });
    const ts = "1700000000";
    expect(verifyPaddleSignature(body, sign(body, ts))).toBe(true);
  });

  it("rejects a tampered body", () => {
    const ts = "1700000000";
    const header = sign("{}", ts);
    expect(verifyPaddleSignature('{"evil":true}', header)).toBe(false);
  });

  it("rejects a wrong secret", () => {
    const body = "{}";
    const ts = "1700000000";
    expect(verifyPaddleSignature(body, sign(body, ts, "wrong"))).toBe(false);
  });

  it("rejects a missing header", () => {
    expect(verifyPaddleSignature("{}", null)).toBe(false);
  });
});
