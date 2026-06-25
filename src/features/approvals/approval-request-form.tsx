"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { requestApprovalAction, type ApprovalActionResult } from "./actions";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

interface ApprovalRequestFormProps {
  assets: Array<{ id: string; name: string }>;
}

export function ApprovalRequestForm({ assets }: ApprovalRequestFormProps) {
  const t = useTranslations("approvals");
  const [state, action, pending] = useActionState<ApprovalActionResult, FormData>(
    requestApprovalAction,
    {},
  );

  if (assets.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("noAssets")}</p>;
  }

  return (
    <form action={action} className="space-y-3">
      {state.success ? (
        <div className="flex items-center gap-2 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
          <CheckCircle2 className="size-4" /> {t("requestSent")}
        </div>
      ) : null}
      {state.error ? (
        <div className="flex items-center gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
          <AlertCircle className="size-4" /> {state.error}
        </div>
      ) : null}

      <div className="space-y-1.5">
        <Label htmlFor="assetId">{t("selectAsset")}</Label>
        <Select id="assetId" name="assetId" required defaultValue="">
          <option value="" disabled>
            {t("selectAsset")}
          </option>
          {assets.map((a) => (
            <option key={a.id} value={a.id}>
              {a.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="comment">{t("comment")}</Label>
        <Textarea id="comment" name="comment" rows={2} placeholder={t("commentPlaceholder")} />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {t("submitRequest")}
      </Button>
    </form>
  );
}
