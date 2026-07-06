"use client";

import { useState } from "react";
import { Download, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FileDropzone } from "@/components/file-dropzone";
import { useLiteMode } from "@/lib/lite-mode/context";
import { runClientAI } from "@/features/lab/client-ai";
import { addDemoAssetFromUrl } from "@/features/demo/local-assets";

const BATCH_OPTIONS = [
  { count: 12, label: "100+ variasi (demo: 12)" },
  { count: 24, label: "1.000+ variasi (demo: 24)" },
  { count: 48, label: "10.000+ variasi (demo: 48)" },
];

export function BatchPhotographyStudio() {
  const { lite, limits } = useLiteMode();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [batchSize, setBatchSize] = useState("12");
  const [results, setResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function generate() {
    if (!imageUrl) return;
    const count = Number(batchSize);
    setLoading(true);
    setProgress(0);
    setResults([]);
    try {
      const r = await runClientAI("batch-variations", { imageUrl, count });
      const urls = (r.output.imageUrls as string[]) ?? [];
      setResults(urls);
      urls.forEach((url, i) => addDemoAssetFromUrl(url, `variation-${i}.png`));
    } finally {
      setLoading(false);
      setProgress(100);
    }
  }

  return (
    <div className="space-y-6">
      <FileDropzone
        label="Upload 1 foto produk"
        onUpload={(url) => {
          setImageUrl(url);
          setResults([]);
        }}
      />
      <div className="flex flex-wrap items-end gap-4">
        <div>
          <Label>Skala produksi</Label>
          <Select value={batchSize} onChange={(e) => setBatchSize(e.target.value)}>
            {BATCH_OPTIONS.filter((o) => !lite || o.count <= limits.pageSize / 2).map((o) => (
              <option key={o.count} value={String(o.count)}>
                {o.label}
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={generate} disabled={!imageUrl || loading || (lite && !limits.batchVariationsEnabled)}>
          {loading ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" /> {progress}%
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" /> Generate variasi profesional
            </>
          )}
        </Button>
      </div>
      {results.length > 0 ? (
        <div>
          <p className="mb-3 text-sm font-medium">{results.length} foto dihasilkan</p>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {results.map((url, i) => (
              <div key={i} className="group relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="rounded border" />
                <a
                  href={url}
                  download={`product-${i}.png`}
                  className="absolute inset-0 flex items-center justify-center rounded bg-black/50 opacity-0 transition group-hover:opacity-100"
                >
                  <Download className="size-5 text-white" />
                </a>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
