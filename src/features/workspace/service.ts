import { cookies } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import type { Workspace, WorkspaceMember } from "@/lib/supabase/types";
import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/workspace-cookie";
import { cachedValue } from "@/lib/rate-limit";

const WORKSPACE_CACHE_TTL = 60;

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });
  void userId;
  return (data as Workspace[]) ?? [];
}

export async function getActiveWorkspace(userId: string): Promise<Workspace | null> {
  const cookieStore = await cookies();
  const activeId = cookieStore.get(ACTIVE_WORKSPACE_COOKIE)?.value ?? "default";

  return cachedValue(`workspace:active:${userId}:${activeId}`, WORKSPACE_CACHE_TTL, async () => {
    const workspaces = await getUserWorkspaces(userId);
    if (workspaces.length === 0) return null;

    if (activeId !== "default") {
      const match = workspaces.find((w) => w.id === activeId);
      if (match) return match;
    }
    return workspaces[0] ?? null;
  });
}

/** @deprecated Use getActiveWorkspace */
export async function getPrimaryWorkspace(userId: string): Promise<Workspace | null> {
  return getActiveWorkspace(userId);
}

export async function getWorkspaceMembers(
  workspaceId: string,
): Promise<(WorkspaceMember & { profile?: { email: string; full_name: string | null } })[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("workspace_members")
    .select("*, profile:profiles(email, full_name)")
    .eq("workspace_id", workspaceId);
  return (data as never) ?? [];
}

export async function userCanManageWorkspace(
  userId: string,
  workspaceId: string,
): Promise<boolean> {
  const supabase = await createClient();
  if (!supabase) return false;
  const { data } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId)
    .maybeSingle();
  return data?.role === "owner" || data?.role === "admin";
}
