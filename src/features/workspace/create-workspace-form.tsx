"use client";

import { useActionState } from "react";
import { useTranslations } from "next-intl";
import { createWorkspaceAction, type WorkspaceActionResult } from "@/features/workspace/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function CreateWorkspaceForm() {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const [state, action, pending] = useActionState<WorkspaceActionResult, FormData>(
    createWorkspaceAction,
    {},
  );

  return (
    <form action={action} className="flex gap-2">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="wsName" className="sr-only">
          {t("workspaceName")}
        </Label>
        <Input id="wsName" name="name" placeholder={t("workspaceName")} required />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {tc("create")}
      </Button>
      {state.error ? <p className="text-xs text-destructive">{state.error}</p> : null}
    </form>
  );
}
