import type { CapacitorConfig } from "@capacitor/cli";

/**
 * CLARTAS Capacitor configuration.
 *
 * CLARTAS is a full-stack Next.js app with secure server route handlers
 * (AI proxy, uploads, Paddle webhooks). A pure static export cannot run that
 * server-side logic, so the recommended mobile setup is a thin native shell
 * whose WebView loads the DEPLOYED web app.
 *
 * Set CAP_SERVER_URL (e.g. https://app.clartas.com) before `npx cap sync`.
 * When it is omitted, the app falls back to the bundled offline shell in
 * `mobile-shell/`. See README → "Mobile build guide".
 */
const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.clartas.app",
  appName: "CLARTAS",
  webDir: "mobile-shell",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false,
        },
      }
    : {}),
  ios: {
    contentInset: "always",
  },
  android: {
    allowMixedContent: false,
  },
};

export default config;
