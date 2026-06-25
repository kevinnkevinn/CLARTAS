"use client";

import { useTranslations } from "next-intl";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ManageBillingButton({ portalUrl }: { portalUrl?: string }) {
  const t = useTranslations("billing");

  if (!portalUrl) {
    return (
      <Button variant="outline" disabled className="w-full sm:w-auto">
        {t("manageBilling")}
      </Button>
    );
  }

  return (
    <a
      href={portalUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-auto")}
    >
      {t("manageBilling")}
    </a>
  );
}

export function ContactSalesButton() {
  const t = useTranslations("billing");
  return (
    <a
      href="mailto:sales@clartas.com?subject=CLARTAS%20Enterprise"
      className={cn(buttonVariants({ variant: "outline" }), "w-full")}
    >
      {t("contactSales")}
    </a>
  );
}
