"use client";

import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";
import { CapacitorBootstrap } from "@/components/mobile/capacitor-bootstrap";
import { PwaRegistrar } from "@/components/mobile/pwa-registrar";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <CapacitorBootstrap />
      <PwaRegistrar />
      <ToastProvider>{children}</ToastProvider>
    </ThemeProvider>
  );
}
