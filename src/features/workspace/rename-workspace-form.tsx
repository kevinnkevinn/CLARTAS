"use client";

import { useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { renameWorkspaceAction } from "@/features/workspace/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RenameWorkspaceForm({
  workspaceId,
  currentName,
}: {
  workspaceId: string;
  currentName: string;
}) {
  const t = useTranslations("workspace");
  const tc = useTranslations("common");
  const router = useRouter();
  const [name, setName] = useState(currentName);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await renameWorkspaceAction(workspaceId, name);
      if (res.error) setError(res.error);
      else router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <div className="flex-1 space-y-1.5">
        <Label htmlFor="wsRename" className="sr-only">
          {t("workspaceName")}
        </Label>
        <Input
          id="wsRename"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>
      <Button type="submit" size="sm" disabled={pending}>
        {tc("save")}
      </Button>
      {error ? <p className="w-full text-xs text-destructive">{error}</p> : null}
    </form>
  );
}
