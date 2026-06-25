import { createClient } from "@/lib/supabase/server";
import { STORAGE_BUCKETS } from "@/lib/constants";
import type { Asset } from "@/lib/supabase/types";

export async function getAssets(userId: string, limit = 50): Promise<Asset[]> {
  const supabase = await createClient();
  if (!supabase) return [];
  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Asset[]) ?? [];
}

export async function getRecentAssets(userId: string, limit = 6): Promise<Asset[]> {
  return getAssets(userId, limit);
}

export async function getAssetById(userId: string, id: string): Promise<Asset | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase
    .from("assets")
    .select("*")
    .eq("user_id", userId)
    .eq("id", id)
    .maybeSingle();
  return (data as Asset) ?? null;
}

export interface AssetWithUrl extends Asset {
  signedUrl: string | null;
}

/** Resolve storage bucket from asset path/metadata. */
function assetBucket(asset: Asset): keyof typeof STORAGE_BUCKETS {
  const meta = asset.metadata as { source?: string };
  if (meta?.source === "ai" || asset.file_path.includes("/processed/")) {
    return "processed";
  }
  return "raw";
}

/** Attach short-lived signed preview URLs to a list of assets. */
export async function withSignedUrls(assets: Asset[]): Promise<AssetWithUrl[]> {
  const supabase = await createClient();
  if (!supabase || assets.length === 0) {
    return assets.map((a) => ({ ...a, signedUrl: null }));
  }

  const results: AssetWithUrl[] = [];
  for (const asset of assets) {
    const bucket = STORAGE_BUCKETS[assetBucket(asset)];
    const { data } = await supabase.storage
      .from(bucket)
      .createSignedUrl(asset.file_path, 3600);
    results.push({ ...asset, signedUrl: data?.signedUrl ?? null });
  }
  return results;
}

/**
 * Create a short-lived signed URL for secure, temporary access to a stored file.
 * Used for previews and for passing to AI providers (never the raw service key).
 */
export async function getSignedUrl(
  bucket: keyof typeof STORAGE_BUCKETS,
  path: string,
  expiresInSeconds = 3600,
): Promise<string | null> {
  const supabase = await createClient();
  if (!supabase) return null;
  const { data } = await supabase.storage
    .from(STORAGE_BUCKETS[bucket])
    .createSignedUrl(path, expiresInSeconds);
  return data?.signedUrl ?? null;
}
