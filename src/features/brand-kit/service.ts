import { createClient } from "@/lib/supabase/server";
import type { BrandKit } from "@/lib/supabase/types";

export async function getBrandKits(workspaceId: string): Promise<BrandKit[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("brand_kits")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });
  return (data as BrandKit[]) ?? [];
}
