"use client";

import { useEffect } from "react";

export function HydrationDebug() {
  useEffect(() => {
    const attrs = Object.fromEntries(
      [...document.body.attributes].map((a) => [a.name, a.value])
    );
    // #region agent log
    fetch("http://127.0.0.1:7648/ingest/a78c0f23-148c-4dde-a418-d2a68e7a7f29", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "2ea47a",
      },
      body: JSON.stringify({
        sessionId: "2ea47a",
        location: "hydration-debug.tsx:mount",
        message: "Client body attributes after hydration",
        data: {
          bodyAttributes: attrs,
          hasCzShortcut: "cz-shortcut-listen" in attrs,
          className: document.body.className,
        },
        timestamp: Date.now(),
        hypothesisId: "A",
        runId: "pre-fix",
      }),
    }).catch(() => {});
    // #endregion
    // #region agent log
    fetch("http://127.0.0.1:7648/ingest/a78c0f23-148c-4dde-a418-d2a68e7a7f29", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Debug-Session-Id": "2ea47a",
      },
      body: JSON.stringify({
        sessionId: "2ea47a",
        location: "hydration-debug.tsx:verify",
        message: "Post-fix hydration check",
        data: {
          hasCzShortcut: "cz-shortcut-listen" in attrs,
          suppressHydrationWarningExpected: true,
        },
        timestamp: Date.now(),
        hypothesisId: "A",
        runId: "post-fix",
      }),
    }).catch(() => {});
    // #endregion
  }, []);

  return null;
}
