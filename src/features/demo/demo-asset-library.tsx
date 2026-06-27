"use client";

import { useEffect, useState } from "react";
import { Grid, List, Search, Tag, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileDropzone } from "@/components/file-dropzone";
import {
  getDemoAssets,
  searchDemoAssets,
  updateDemoAssetTags,
  deleteDemoAsset,
  autoTagAsset,
  type DemoAsset,
} from "@/features/demo/local-assets";

export function DemoAssetLibrary() {
  const [assets, setAssets] = useState<DemoAsset[]>([]);
  const [query, setQuery] = useState("");
  const [kind, setKind] = useState("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setAssets(searchDemoAssets(query, kind === "all" ? undefined : kind));
  }, [query, kind]);

  function onUpload(_url: string, file: File) {
    const tags = autoTagAsset(file.name);
    const list = getDemoAssets();
    const latest = list[0];
    if (latest) updateDemoAssetTags(latest.id, tags);
    setAssets(searchDemoAssets(query, kind === "all" ? undefined : kind));
  }

  return (
    <div className="space-y-4">
      <FileDropzone multiple label="Upload foto, video, template" onUpload={onUpload} />
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-8"
            placeholder="Smart search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select
          className="rounded-md border px-3 py-2 text-sm"
          value={kind}
          onChange={(e) => setKind(e.target.value)}
        >
          <option value="all">Semua</option>
          <option value="image">Foto</option>
          <option value="video">Video</option>
        </select>
        <Button variant="outline" size="sm" onClick={() => setView(view === "grid" ? "list" : "grid")}>
          {view === "grid" ? <List className="size-4" /> : <Grid className="size-4" />}
        </Button>
      </div>

      {assets.length === 0 ? (
        <p className="text-center text-muted-foreground">Belum ada aset. Upload file untuk mulai.</p>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {assets.map((a) => (
            <AssetCard key={a.id} asset={a} onDelete={() => setAssets(searchDemoAssets(query, kind === "all" ? undefined : kind))} />
          ))}
        </div>
      ) : (
        <ul className="space-y-2">
          {assets.map((a) => (
            <li key={a.id} className="flex items-center gap-3 rounded-lg border p-2">
              {a.kind === "video" ? (
                <video src={a.url} className="size-12 rounded object-cover" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={a.url} alt="" className="size-12 rounded object-cover" />
              )}
              <div className="flex-1">
                <p className="text-sm font-medium">{a.name}</p>
                <p className="flex gap-1 text-xs text-muted-foreground">
                  {a.tags.map((t) => (
                    <span key={t} className="flex items-center gap-0.5">
                      <Tag className="size-3" />
                      {t}
                    </span>
                  ))}
                </p>
              </div>
              <Button size="sm" variant="ghost" onClick={() => { deleteDemoAsset(a.id); setAssets(searchDemoAssets(query, kind === "all" ? undefined : kind)); }}>
                <Trash2 className="size-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function AssetCard({ asset, onDelete }: { asset: DemoAsset; onDelete: () => void }) {
  return (
    <div className="group relative overflow-hidden rounded-lg border">
      {asset.kind === "video" ? (
        <video src={asset.url} className="aspect-square w-full object-cover" />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={asset.url} alt="" className="aspect-square w-full object-cover" />
      )}
      <div className="p-2">
        <p className="truncate text-xs font-medium">{asset.name}</p>
        <p className="text-[10px] text-muted-foreground">{asset.tags.join(", ")}</p>
      </div>
      <button
        type="button"
        className="absolute right-1 top-1 rounded bg-black/50 p-1 opacity-0 transition group-hover:opacity-100"
        onClick={() => { deleteDemoAsset(asset.id); onDelete(); }}
      >
        <Trash2 className="size-3 text-white" />
      </button>
    </div>
  );
}
