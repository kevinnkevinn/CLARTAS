"use client";

import { ToastProvider } from "@/components/ui/toast";
import { ThemeProvider } from "@/components/theme-provider";
import { LiteModeProvider } from "@/lib/lite-mode/context";
import { PersonaProvider } from "@/features/persona/persona-context";
import { CapacitorBootstrap } from "@/components/mobile/capacitor-bootstrap";
import { PwaRegistrar } from "@/components/mobile/pwa-registrar";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <LiteModeProvider>
        <PersonaProvider>
          <CapacitorBootstrap />
          <PwaRegistrar />
          <ToastProvider>{children}</ToastProvider>
        </PersonaProvider>
      </LiteModeProvider>
    </ThemeProvider>
  );
}
