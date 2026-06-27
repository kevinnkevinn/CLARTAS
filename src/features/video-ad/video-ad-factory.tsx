"use client";

import { useState } from "react";
import { Clapperboard, Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FileDropzone } from "@/components/file-dropzone";
import { runClientAI, playTextToSpeech } from "@/features/lab/client-ai";

const FORMATS = [
  { id: "9:16", label: "TikTok" },
  { id: "9:16", label: "Instagram Reels" },
  { id: "16:9", label: "YouTube" },
  { id: "1:1", label: "Facebook" },
  { id: "4:5", label: "Shopee" },
  { id: "1:1", label: "Tokopedia" },
];

export function VideoAdFactory() {
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [format, setFormat] = useState(0);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  async function createAd() {
    if (!imageUrl) return;
    setLoading(true);
    try {
      const fmt = FORMATS[format]!;
      const copy = await runClientAI("generate-copy", {
        productName: name || "Produk",
        type: "script",
        marketplace: fmt.label.toLowerCase(),
      });
      setScript(copy.output.text as string);
      const video = await runClientAI("video-slideshow", {
        imageUrls: [imageUrl],
        aspectRatio: fmt.id,
      });
      setVideoUrl(video.output.videoUrl as string);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <div>
          <Label>Nama produk</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <FileDropzone label="Foto produk" onUpload={setImageUrl} />
        <div>
          <Label>Format iklan</Label>
          <Select value={String(format)} onChange={(e) => setFormat(Number(e.target.value))}>
            {FORMATS.map((f, i) => (
              <option key={i} value={i}>
                {f.label} ({f.id})
              </option>
            ))}
          </Select>
        </div>
        <Button onClick={createAd} disabled={!imageUrl || loading} className="w-full">
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Clapperboard className="mr-2 size-4" />}
          Buat video iklan siap jual
        </Button>
      </div>
      <div className="space-y-4">
        {videoUrl ? (
          <video src={videoUrl} controls className="w-full rounded-xl" />
        ) : (
          <div className="flex h-48 items-center justify-center rounded-xl border border-dashed text-muted-foreground">
            Preview video iklan
          </div>
        )}
        {script ? (
          <div className="rounded-xl border p-4">
            <div className="mb-2 flex justify-between">
              <span className="font-medium">Script iklan</span>
              <Button size="sm" variant="outline" onClick={() => playTextToSpeech(script)}>
                <Play className="mr-1 size-3" /> Voice
              </Button>
            </div>
            <pre className="whitespace-pre-wrap text-sm">{script}</pre>
          </div>
        ) : null}
      </div>
    </div>
  );
}
