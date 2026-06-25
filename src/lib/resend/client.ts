import { getResendKey, getResendFrom } from "@/lib/env";

/**
 * Minimal Resend client via REST (no extra dependency). When RESEND_API_KEY is
 * absent, emails are skipped and logged so local dev never fails.
 */
export interface SendEmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailParams): Promise<boolean> {
  const apiKey = getResendKey();
  if (!apiKey) {
    console.info(`[CLARTAS:resend] (mock) would send "${subject}" to ${to}`);
    return false;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: getResendFrom(), to, subject, html }),
    });
    return res.ok;
  } catch (error) {
    console.error("[CLARTAS:resend] send failed", error);
    return false;
  }
}
