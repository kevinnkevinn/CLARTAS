"use client";

import { useEffect } from "react";
import { isCapacitorNative } from "@/lib/mobile/platform";

/**
 * Initializes Capacitor native plugins when running inside the mobile shell.
 */
export function CapacitorBootstrap() {
  useEffect(() => {
    if (!isCapacitorNative()) return;

    void (async () => {
      try {
        const { StatusBar, Style } = await import("@capacitor/status-bar");
        await StatusBar.setStyle({ style: Style.Dark });
        await StatusBar.setBackgroundColor({ color: "#050505" });
      } catch {
        /* plugin unavailable */
      }

      try {
        const { SplashScreen } = await import("@capacitor/splash-screen");
        await SplashScreen.hide();
      } catch {
        /* plugin unavailable */
      }

      try {
        const { App } = await import("@capacitor/app");
        App.addListener("appUrlOpen", ({ url }) => {
          if (url.includes("auth/callback")) {
            const parsed = new URL(url);
            const next = parsed.searchParams.get("next") ?? "/dashboard";
            window.location.href = next;
          }
        });
      } catch {
        /* plugin unavailable */
      }
    })();
  }, []);

  return null;
}
