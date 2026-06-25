import { createClient } from "@/lib/supabase/server";
import type { Workspace, WorkspaceMember } from "@/lib/supabase/types";

export async function getUserWorkspaces(userId: string): Promise<Workspace[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("workspaces")
    .select("*")
    .order("created_at", { ascending: true });
  // RLS already restricts to workspaces the user can see.
  void userId;
  return (data as Workspace[]) ?? [];
}

export async function getPrimaryWorkspace(userId: string): Promise<Workspace | null> {
  const workspaces = await getUserWorkspaces(userId);
  return workspaces[0] ?? null;
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
