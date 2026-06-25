/** Simple inline-styled HTML email templates. Keep them framework-agnostic. */

function shell(title: string, body: string): string {
  return `<!doctype html><html><body style="font-family:ui-sans-serif,system-ui,sans-serif;background:#f8fafc;padding:24px;color:#0f172a">
    <div style="max-width:520px;margin:0 auto;background:#fff;border-radius:12px;padding:32px;border:1px solid #e2e8f0">
      <h1 style="margin:0 0 8px;font-size:20px">${title}</h1>
      ${body}
      <p style="margin-top:24px;font-size:12px;color:#94a3b8">CLARTAS — AI E-Commerce Content Factory</p>
    </div></body></html>`;
}

export function onboardingEmail(name?: string): { subject: string; html: string } {
  return {
    subject: "Welcome to CLARTAS",
    html: shell(
      `Welcome${name ? `, ${name}` : ""}!`,
      `<p style="color:#475569">Your AI content factory is ready. Upload your first product photo and try background removal or studio generation.</p>`,
    ),
  };
}

export function paymentConfirmationEmail(plan: string, amount: string): {
  subject: string;
  html: string;
} {
  return {
    subject: "Your CLARTAS payment is confirmed",
    html: shell(
      "Payment confirmed",
      `<p style="color:#475569">Thanks for subscribing to the <strong>${plan}</strong> plan. Amount: <strong>${amount}</strong>. Your invoice is available in your billing dashboard.</p>`,
    ),
  };
}

export function operationalEmail(subject: string, message: string): {
  subject: string;
  html: string;
} {
  return { subject, html: shell(subject, `<p style="color:#475569">${message}</p>`) };
}

export function aiJobCompletedEmail(action: string): { subject: string; html: string } {
  return {
    subject: "Your CLARTAS AI job is ready",
    html: shell(
      "AI job completed",
      `<p style="color:#475569">Your <strong>${action}</strong> job finished successfully. Open your asset library to view and download the result.</p>`,
    ),
  };
}

export function aiJobFailedEmail(action: string, reason?: string): { subject: string; html: string } {
  return {
    subject: "Your CLARTAS AI job failed",
    html: shell(
      "AI job failed",
      `<p style="color:#475569">Your <strong>${action}</strong> job could not be completed.${reason ? ` Reason: ${reason}` : ""} Credits were refunded if deducted.</p>`,
    ),
  };
}

export function invoiceEmail(amount: string, invoiceId: string): { subject: string; html: string } {
  return {
    subject: "Your CLARTAS invoice",
    html: shell(
      "Invoice available",
      `<p style="color:#475569">Invoice <strong>#${invoiceId}</strong> for <strong>${amount}</strong> is ready. View it in your billing dashboard.</p>`,
    ),
  };
}
