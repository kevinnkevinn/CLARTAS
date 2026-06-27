"use client";

const STORAGE_KEY = "clartas-demo-assets";

export interface DemoAsset {
  id: string;
  name: string;
  type: string;
  url: string;
  kind: "image" | "video" | "audio" | "other";
  tags: string[];
  createdAt: string;
  size: number;
}

function load(): DemoAsset[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DemoAsset[]) : [];
  } catch {
    return [];
  }
}

function save(assets: DemoAsset[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(assets));
}

export function getDemoAssets(): DemoAsset[] {
  return load().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function addDemoAsset(file: File): Promise<DemoAsset> {
  const url = URL.createObjectURL(file);
  const kind = file.type.startsWith("image/")
    ? "image"
    : file.type.startsWith("video/")
      ? "video"
      : file.type.startsWith("audio/")
        ? "audio"
        : "other";

  const asset: DemoAsset = {
    id: crypto.randomUUID(),
    name: file.name,
    type: file.type,
    url,
    kind,
    tags: [],
    createdAt: new Date().toISOString(),
    size: file.size,
  };

  const assets = load();
  assets.unshift(asset);
  save(assets);
  return asset;
}

export function addDemoAssetFromUrl(
  url: string,
  name: string,
  kind: DemoAsset["kind"] = "image",
): DemoAsset {
  const asset: DemoAsset = {
    id: crypto.randomUUID(),
    name,
    type: kind === "image" ? "image/png" : kind === "video" ? "video/webm" : "application/octet-stream",
    url,
    kind,
    tags: ["generated"],
    createdAt: new Date().toISOString(),
    size: 0,
  };
  const assets = load();
  assets.unshift(asset);
  save(assets);
  return asset;
}

export function updateDemoAssetTags(id: string, tags: string[]) {
  const assets = load();
  const idx = assets.findIndex((a) => a.id === id);
  if (idx >= 0) {
    assets[idx]!.tags = tags;
    save(assets);
  }
}

export function deleteDemoAsset(id: string) {
  save(load().filter((a) => a.id !== id));
}

export function searchDemoAssets(query: string, kind?: string): DemoAsset[] {
  const q = query.toLowerCase();
  return getDemoAssets().filter((a) => {
    if (kind && kind !== "all" && a.kind !== kind) return false;
    return (
      a.name.toLowerCase().includes(q) ||
      a.tags.some((t) => t.toLowerCase().includes(q))
    );
  });
}

export function autoTagAsset(name: string): string[] {
  const tags: string[] = [];
  const lower = name.toLowerCase();
  if (lower.includes("product") || lower.includes("produk")) tags.push("product");
  if (lower.includes("banner")) tags.push("banner");
  if (lower.includes("video")) tags.push("video");
  if (lower.includes("logo")) tags.push("brand");
  if (lower.includes("mock")) tags.push("mock");
  if (!tags.length) tags.push("untagged");
  return tags;
}
