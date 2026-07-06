"use client";

import { useEffect } from "react";
import { isCapacitorNative } from "@/lib/mobile/platform";

/**
 * Registers the service worker for Chrome / PWA install (not used in native shell).
 */
export function PwaRegistrar() {
  useEffect(() => {
    if (isCapacitorNative()) return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker.register("/sw.js", { scope: "/" }).catch(() => {
      /* registration optional in dev */
    });
  }, []);

  return null;
}
