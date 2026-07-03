import type { CapacitorConfig } from "@capacitor/cli";

/**
 * CLARTAS mobile shell (Android + iOS).
 *
 * The WebView loads the deployed CLARTAS web app so UI/UX stay identical to the
 * website. Set CAP_SERVER_URL before sync (e.g. https://app.clartas.com).
 */
const serverUrl = process.env.CAP_SERVER_URL;

const config: CapacitorConfig = {
  appId: "com.clartas.app",
  appName: "CLARTAS",
  webDir: "www",
  ...(serverUrl
    ? {
        server: {
          url: serverUrl,
          cleartext: false,
          androidScheme: "https",
        },
      }
    : {}),
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#050505",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "DARK",
      backgroundColor: "#050505",
    },
    GoogleAuth: {
      scopes: ["profile", "email"],
      serverClientId: process.env.GOOGLE_WEB_CLIENT_ID ?? "",
      forceCodeForRefreshToken: false,
    },
  },
  ios: {
    contentInset: "always",
    scheme: "CLARTAS",
    preferredContentMode: "mobile",
  },
  android: {
    allowMixedContent: false,
    captureInput: true,
    webContentsDebuggingEnabled: false,
  },
};

export default config;
