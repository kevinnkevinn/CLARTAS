"use client";

import { useTransition } from "react";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { switchWorkspaceAction } from "@/features/workspace/actions";
import { Select } from "@/components/ui/select";
import type { Workspace } from "@/lib/supabase/types";

interface WorkspaceSwitcherProps {
  workspaces: Workspace[];
  activeId: string;
}

export function WorkspaceSwitcher({ workspaces, activeId }: WorkspaceSwitcherProps) {
  const t = useTranslations("workspace");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  if (workspaces.length <= 1) {
    return (
      <span className="text-sm font-medium">{workspaces[0]?.name ?? t("defaultName")}</span>
    );
  }

  return (
    <Select
      value={activeId}
      disabled={pending}
      onChange={(e) => {
        const id = e.target.value;
        startTransition(async () => {
          await switchWorkspaceAction(id);
          router.refresh();
        });
      }}
      className="max-w-[200px]"
      aria-label={t("switchWorkspace")}
    >
      {workspaces.map((w) => (
        <option key={w.id} value={w.id}>
          {w.name}
        </option>
      ))}
    </Select>
  );
}
