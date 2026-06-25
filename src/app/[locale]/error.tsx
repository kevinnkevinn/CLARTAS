"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { ErrorState } from "@/components/states/error-state";

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("states");
  const tc = useTranslations("common");

  useEffect(() => {
    // Client-side surface only; details are logged server-side without secrets.
    console.error(error);
  }, [error]);

  return (
    <div className="container py-20">
      <ErrorState
        title={t("errorTitle")}
        message={t("errorMessage")}
        retryLabel={tc("tryAgain")}
        onRetry={reset}
      />
    </div>
  );
}
