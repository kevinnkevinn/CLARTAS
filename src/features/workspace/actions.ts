"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { getSessionUser } from "@/features/auth/session";
import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace, getUserWorkspaces } from "@/features/workspace/service";
import { ACTIVE_WORKSPACE_COOKIE } from "@/lib/workspace-cookie";
import type { MemberRole } from "@/lib/supabase/types";

export interface WorkspaceActionResult {
  error?: string;
  success?: boolean;
}

function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "workspace"
  );
}

export async function createWorkspaceAction(
  _prev: WorkspaceActionResult,
  formData: FormData,
): Promise<WorkspaceActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required" };

  const slug = `${slugify(name)}-${Date.now().toString(36)}`;
  const { data: ws, error } = await supabase
    .from("workspaces")
    .insert({ owner_id: user.id, name, slug })
    .select("id")
    .single();

  if (error || !ws) return { error: error?.message ?? "Failed" };

  await supabase.from("workspace_members").insert({
    workspace_id: ws.id,
    user_id: user.id,
    role: "owner",
  });

  revalidatePath("/settings");
  return { success: true };
}

export async function renameWorkspaceAction(
  workspaceId: string,
  name: string,
): Promise<WorkspaceActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const { error } = await supabase
    .from("workspaces")
    .update({ name: name.trim() })
    .eq("id", workspaceId)
    .eq("owner_id", user.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}

export async function inviteMemberAction(
  _prev: WorkspaceActionResult,
  formData: FormData,
): Promise<WorkspaceActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const workspace = await getActiveWorkspace(user.id);
  if (!workspace || workspace.owner_id !== user.id) {
    return { error: "Only workspace owners can invite members" };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "viewer") as MemberRole;

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .maybeSingle();

  if (!profile) {
    return { error: "User not found. They must sign up first." };
  }

  const { error } = await supabase.from("workspace_members").upsert(
    { workspace_id: workspace.id, user_id: profile.id, role },
    { onConflict: "workspace_id,user_id" },
  );

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}

export async function updateMemberRoleAction(
  memberId: string,
  role: MemberRole,
): Promise<WorkspaceActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const workspace = await getActiveWorkspace(user.id);
  if (!workspace || workspace.owner_id !== user.id) {
    return { error: "Only owners can change roles" };
  }

  const { error } = await supabase
    .from("workspace_members")
    .update({ role })
    .eq("id", memberId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  return { success: true };
}

export async function removeMemberAction(memberId: string): Promise<WorkspaceActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();
  if (!supabase) return { error: "Not configured" };

  const workspace = await getActiveWorkspace(user.id);
  if (!workspace || workspace.owner_id !== user.id) {
    return { error: "Only owners can remove members" };
  }

  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("id", memberId)
    .eq("workspace_id", workspace.id);

  if (error) return { error: error.message };
  revalidatePath("/settings");
  revalidatePath("/workspace");
  return { success: true };
}

export async function switchWorkspaceAction(workspaceId: string): Promise<WorkspaceActionResult> {
  const user = await getSessionUser();
  if (!user) return { error: "Unauthorized" };

  const workspaces = await getUserWorkspaces(user.id);
  if (!workspaces.some((w) => w.id === workspaceId)) {
    return { error: "Workspace not found" };
  }

  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_WORKSPACE_COOKIE, workspaceId, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  revalidatePath("/", "layout");
  return { success: true };
}
