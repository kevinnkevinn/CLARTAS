"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { inviteMemberAction, type WorkspaceActionResult } from "@/features/workspace/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

export function InviteMemberForm() {
  const t = useTranslations("settings");
  const [state, action, pending] = useActionState<WorkspaceActionResult, FormData>(
    inviteMemberAction,
    {},
  );

  return (
    <form action={action} className="space-y-3 rounded-lg border p-4">
      <h4 className="text-sm font-semibold">{t("inviteMember")}</h4>
      {state.success ? (
        <p className="flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="size-3.5" /> {t("inviteSent")}
        </p>
      ) : null}
      {state.error ? (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3.5" /> {state.error}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="email">{t("memberEmail")}</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="role">{t("memberRole")}</Label>
          <Select id="role" name="role" defaultValue="viewer">
            <option value="admin">{t("role.admin")}</option>
            <option value="editor">{t("role.editor")}</option>
            <option value="reviewer">{t("role.reviewer")}</option>
            <option value="viewer">{t("role.viewer")}</option>
          </Select>
        </div>
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {t("sendInvite")}
      </Button>
    </form>
  );
}
