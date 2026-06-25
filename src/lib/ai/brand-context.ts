import { createClient } from "@/lib/supabase/server";
import { getActiveWorkspace } from "@/features/workspace/service";

export interface BrandContext {
  voice: string | null;
  colors: string[];
  fonts: string[];
  name: string | null;
}

/** Load brand kit for the user's active workspace to enrich AI copy/studio prompts. */
export async function getBrandContext(userId: string): Promise<BrandContext | null> {
  const supabase = await createClient();
  if (!supabase) return null;

  const workspace = await getActiveWorkspace(userId);
  if (!workspace) return null;

  const { data } = await supabase
    .from("brand_kits")
    .select("name, brand_voice, brand_colors, brand_fonts")
    .eq("workspace_id", workspace.id)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (!data) return null;

  return {
    voice: data.brand_voice,
    colors: data.brand_colors ?? [],
    fonts: data.brand_fonts ?? [],
    name: data.name,
  };
}
