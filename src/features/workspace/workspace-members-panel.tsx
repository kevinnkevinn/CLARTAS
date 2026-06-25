"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Trash2 } from "lucide-react";
import {
  removeMemberAction,
  updateMemberRoleAction,
} from "@/features/workspace/actions";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { MemberRole } from "@/lib/supabase/types";

interface MemberRow {
  id: string;
  user_id: string;
  role: MemberRole;
  profile?: { email: string; full_name: string | null };
}

export function WorkspaceMembersPanel({
  members,
  currentUserId,
  isOwner,
}: {
  members: MemberRow[];
  currentUserId: string;
  isOwner: boolean;
}) {
  const t = useTranslations("settings");
  const tc = useTranslations("common");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const roles: MemberRole[] = ["admin", "editor", "reviewer", "viewer"];

  return (
    <ul className="space-y-2">
      {members.map((m) => (
        <li
          key={m.id}
          className="flex flex-col gap-2 rounded-lg border p-3 text-sm sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium">{m.profile?.full_name || m.profile?.email || m.user_id}</p>
            {m.profile?.email ? (
              <p className="text-xs text-muted-foreground">{m.profile.email}</p>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {isOwner && m.role !== "owner" && m.user_id !== currentUserId ? (
              <>
                <Select
                  value={m.role}
                  disabled={pending}
                  onChange={(e) => {
                    const role = e.target.value as MemberRole;
                    startTransition(async () => {
                      await updateMemberRoleAction(m.id, role);
                      router.refresh();
                    });
                  }}
                  className="h-8 text-xs"
                >
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {t(`role.${r}`)}
                    </option>
                  ))}
                </Select>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="size-8 text-destructive"
                  disabled={pending}
                  onClick={() => {
                    if (!confirm(tc("delete") + "?")) return;
                    startTransition(async () => {
                      await removeMemberAction(m.id);
                      router.refresh();
                    });
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </>
            ) : (
              <Badge variant="outline">{t(`role.${m.role}`)}</Badge>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
