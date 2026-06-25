import type { ReactNode } from "react";
import "./globals.css";

/**
 * Root layout is intentionally minimal. The real <html>/<body> shell lives in
 * `app/[locale]/layout.tsx` so next-intl can set the correct lang attribute.
 */
export default function RootLayout({ children }: { children: ReactNode }) {
  return children;
}
