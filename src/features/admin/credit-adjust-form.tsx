"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { adjustCreditsAction, type AdminActionResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreditAdjustForm() {
  const t = useTranslations("admin");
  const [state, action, pending] = useActionState<AdminActionResult, FormData>(
    adjustCreditsAction,
    {},
  );

  return (
    <form action={action} className="space-y-3">
      <p className="text-xs text-muted-foreground">{t("creditAdjustHint")}</p>
      {state.success ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-2 text-xs text-emerald-800">
          <CheckCircle2 className="size-4" /> OK
        </div>
      ) : null}
      {state.error ? (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2 text-xs text-destructive">
          <AlertCircle className="size-4" /> {state.error}
        </div>
      ) : null}
      <div className="space-y-1.5">
        <Label htmlFor="userId">User ID</Label>
        <Input id="userId" name="userId" placeholder="uuid" required />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label htmlFor="amount">{t("amount")}</Label>
          <Input id="amount" name="amount" type="number" placeholder="100" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="reason">{t("reason")}</Label>
          <Input id="reason" name="reason" />
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {t("apply")}
      </Button>
    </form>
  );
}
