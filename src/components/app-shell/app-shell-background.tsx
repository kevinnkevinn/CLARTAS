"use client";

import { useLiteMode } from "@/lib/lite-mode/context";

/** Decorative backgrounds — skipped in lite mode to save GPU/compositing cost. */
export function AppShellBackground() {
  const { limits } = useLiteMode();
  if (!limits.decorativeBackgrounds) return null;

  return (
    <>
      <div className="pointer-events-none fixed inset-0 mesh-bg" />
      <div className="pointer-events-none fixed inset-0 grid-bg opacity-[0.15]" />
    </>
  );
}
