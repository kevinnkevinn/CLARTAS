"use client";

import { useRef, useState } from "react";
import { Play, Scissors, Merge, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FileDropzone } from "@/components/file-dropzone";
import { runClientAI } from "@/features/lab/client-ai";

interface Clip {
  id: string;
  url: string;
  name: string;
  start: number;
  end: number;
  speed: number;
}

export function VideoEditorStudio() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const active = clips.find((c) => c.id === selected);

  function splitClip() {
    if (!active) return;
    const mid = (active.start + active.end) / 2;
    const second: Clip = {
      ...active,
      id: crypto.randomUUID(),
      start: mid,
      name: `${active.name} (part 2)`,
    };
    setClips((prev) =>
      prev.flatMap((c) =>
        c.id === active.id
          ? [{ ...c, end: mid, name: `${c.name} (part 1)` }, second]
          : [c],
      ),
    );
  }

  async function exportVideo() {
    if (!clips.length) return;
    setProcessing(true);
    try {
      const imageUrls = clips.filter((c) => c.url.startsWith("data:image")).map((c) => c.url);
      if (imageUrls.length) {
        const result = await runClientAI("video-slideshow", { imageUrls, aspectRatio });
        setOutputUrl(result.output.videoUrl as string);
        return;
      }
      setOutputUrl(clips[0]?.url ?? null);
    } finally {
      setProcessing(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <div className="space-y-4">
        <FileDropzone
          accept="video/*,image/*"
          multiple
          label="Upload video atau foto produk"
          onUpload={(url, file) => {
            const clip: Clip = {
              id: crypto.randomUUID(),
              url,
              name: file.name,
              start: 0,
              end: 10,
              speed: 1,
            };
            setClips((p) => [...p, clip]);
            setSelected(clip.id);
          }}
        />

        <div className="rounded-xl border bg-card p-4">
          <h3 className="mb-3 font-semibold">Timeline</h3>
          <div className="flex min-h-[80px] flex-wrap gap-2">
            {clips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={`rounded-lg border px-3 py-2 text-xs ${selected === c.id ? "border-primary bg-primary/10" : ""}`}
              >
                {c.name}
                <span className="ml-1 text-muted-foreground">×{c.speed}</span>
              </button>
            ))}
          </div>
        </div>

        {active?.url.startsWith("data:video") || active?.url.includes("blob:") ? (
          <video ref={videoRef} src={active.url} controls className="max-h-80 w-full rounded-xl" />
        ) : active ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={active.url} alt="" className="max-h-80 rounded-xl object-contain" />
        ) : null}

        {outputUrl ? (
          <div className="space-y-2">
            <video src={outputUrl} controls className="w-full rounded-xl" />
            <a href={outputUrl} download="clartas-export.webm" className="text-sm text-primary">
              <Download className="inline size-4" /> Download
            </a>
          </div>
        ) : null}
      </div>

      <div className="space-y-4 rounded-xl border bg-card p-4">
        <h3 className="font-semibold">Tools (CapCut+)</h3>
        <div className="grid grid-cols-2 gap-2">
          <Button type="button" variant="outline" size="sm" onClick={splitClip} disabled={!active}>
            <Scissors className="mr-1 size-3" /> Split
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (clips.length < 2) return;
              setClips((p) => [{ ...p[0]!, name: "Merged", id: crypto.randomUUID() }]);
            }}
            disabled={clips.length < 2}
          >
            <Merge className="mr-1 size-3" /> Merge
          </Button>
        </div>

        {active ? (
          <>
            <div className="space-y-1">
              <Label>Trim start (s)</Label>
              <input
                type="range"
                min={0}
                max={active.end}
                value={active.start}
                className="w-full"
                onChange={(e) =>
                  setClips((p) =>
                    p.map((c) =>
                      c.id === active.id ? { ...c, start: Number(e.target.value) } : c,
                    ),
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Speed {active.speed}x</Label>
              <input
                type="range"
                min={0.5}
                max={2}
                step={0.1}
                value={active.speed}
                className="w-full"
                onChange={(e) =>
                  setClips((p) =>
                    p.map((c) =>
                      c.id === active.id ? { ...c, speed: Number(e.target.value) } : c,
                    ),
                  )
                }
              />
            </div>
          </>
        ) : null}

        <div className="space-y-1">
          <Label>Format export</Label>
          <Select value={aspectRatio} onChange={(e) => setAspectRatio(e.target.value)}>
            <option value="9:16">TikTok / Reels / Shorts (9:16)</option>
            <option value="1:1">Instagram Feed (1:1)</option>
            <option value="16:9">YouTube (16:9)</option>
            <option value="4:5">Marketplace (4:5)</option>
          </Select>
        </div>

        <p className="text-xs text-muted-foreground">
          Motion tracking, auto subtitles, AI dubbing, lip sync, dan avatar — diproses via AI
          pipeline (demo: slideshow + voiceover di Editor Studio).
        </p>

        <Button className="w-full" onClick={exportVideo} disabled={!clips.length || processing}>
          {processing ? <Loader2 className="size-4 animate-spin" /> : <Play className="size-4" />}
          Export video
        </Button>
      </div>
    </div>
  );
}
