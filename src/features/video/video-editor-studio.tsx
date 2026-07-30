"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Pause, Scissors, Merge, Download, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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

const DEFAULT_IMAGE_DURATION = 3;

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const safe = Math.floor(seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function isVideoClip(url: string) {
  return url.startsWith("data:video") || url.includes("blob:") || /\.(mp4|webm|mov|m4v)$/i.test(url);
}

export function VideoEditorStudio() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const active = clips.find((c) => c.id === selected);
  const activeIsVideo = active ? isVideoClip(active.url) : false;

  const timelineDuration = useMemo(() => {
    return clips.reduce((acc, clip) => acc + Math.max(clip.end - clip.start, 0), 0);
  }, [clips]);

  useEffect(() => {
    if (!active) {
      setPlayhead(0);
      setIsPlaying(false);
      return;
    }
    setPlayhead(active.start);
    setIsPlaying(false);
  }, [active?.id, active?.start]);

  useEffect(() => {
    if (!active || !activeIsVideo || !videoRef.current) return;
    const video = videoRef.current;
    video.playbackRate = active.speed;
    if (Math.abs(video.currentTime - playhead) > 0.2) {
      video.currentTime = playhead;
    }
  }, [active, activeIsVideo, playhead]);

  useEffect(() => {
    if (!activeIsVideo || !videoRef.current) return;
    const video = videoRef.current;
    if (isPlaying) {
      void video.play().catch(() => {
        setIsPlaying(false);
      });
      return;
    }
    video.pause();
  }, [isPlaying, activeIsVideo]);

  function splitClip() {
    if (!active) return;
    const splitPoint = Math.min(Math.max(playhead, active.start + 0.1), active.end - 0.1);
    if (splitPoint <= active.start || splitPoint >= active.end) return;

    const second: Clip = {
      ...active,
      id: crypto.randomUUID(),
      start: splitPoint,
      name: `${active.name} (part 2)`,
    };

    setClips((prev) =>
      prev.flatMap((c) =>
        c.id === active.id
          ? [{ ...c, end: splitPoint, name: `${c.name} (part 1)` }, second]
          : [c],
      ),
    );
    setPlayhead(splitPoint);
  }

  function togglePreview() {
    if (!active || !activeIsVideo) return;
    if (!isPlaying) {
      setPlayhead((current) => Math.min(Math.max(current, active.start), active.end));
    }
    setIsPlaying((p) => !p);
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
            const defaultDuration = file.type.startsWith("image/") ? DEFAULT_IMAGE_DURATION : 10;
            const clip: Clip = {
              id: crypto.randomUUID(),
              url,
              name: file.name,
              start: 0,
              end: defaultDuration,
              speed: 1,
            };
            setClips((p) => [...p, clip]);
            setSelected(clip.id);
            setOutputUrl(null);
          }}
        />

        <div className="rounded-xl border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold">Timeline</h3>
            <Badge variant="secondary">Durasi total {formatTime(timelineDuration)}</Badge>
          </div>
          <div className="flex min-h-[80px] flex-wrap gap-2">
            {clips.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelected(c.id)}
                className={`rounded-lg border px-3 py-2 text-left text-xs transition ${selected === c.id ? "border-primary bg-primary/10" : "hover:border-primary/50"}`}
              >
                <div className="max-w-[220px] truncate font-medium">{c.name}</div>
                <div className="mt-1 text-[11px] text-muted-foreground">
                  {formatTime(c.start)} - {formatTime(c.end)} • ×{c.speed}
                </div>
              </button>
            ))}
            {!clips.length ? (
              <p className="self-center text-sm text-muted-foreground">
                Upload media dulu untuk mulai edit dan preview.
              </p>
            ) : null}
          </div>
        </div>

        {active ? (
          <div className="space-y-3 rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Preview</h3>
              <div className="text-xs text-muted-foreground">
                {formatTime(playhead)} / {formatTime(active.end)}
              </div>
            </div>
            {activeIsVideo ? (
              <video
                ref={videoRef}
                src={active.url}
                controls
                className="max-h-80 w-full rounded-xl bg-black"
                onLoadedMetadata={(e) => {
                  const duration = e.currentTarget.duration;
                  if (!Number.isFinite(duration) || duration <= 0) return;
                  setClips((prev) =>
                    prev.map((clip) => {
                      if (clip.id !== active.id) return clip;
                      const safeStart = Math.min(clip.start, Math.max(duration - 0.1, 0));
                      const nextEnd = clip.end > 0 ? Math.min(clip.end, duration) : duration;
                      return { ...clip, start: safeStart, end: Math.max(nextEnd, safeStart + 0.1) };
                    }),
                  );
                }}
                onTimeUpdate={(e) => {
                  const current = e.currentTarget.currentTime;
                  if (!active) return;
                  if (current >= active.end) {
                    e.currentTarget.currentTime = active.start;
                    if (!isPlaying) {
                      e.currentTarget.pause();
                    }
                    setPlayhead(active.start);
                    return;
                  }
                  setPlayhead(current);
                }}
              />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={active.url} alt="" className="max-h-80 w-full rounded-xl object-contain" />
            )}
            {activeIsVideo ? (
              <div className="space-y-2">
                <Label>Playhead</Label>
                <input
                  type="range"
                  min={active.start}
                  max={active.end}
                  step={0.05}
                  value={Math.min(Math.max(playhead, active.start), active.end)}
                  className="w-full"
                  onChange={(e) => {
                    const next = Number(e.target.value);
                    setPlayhead(next);
                    if (videoRef.current) {
                      videoRef.current.currentTime = next;
                    }
                  }}
                />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" size="sm" onClick={togglePreview}>
                    {isPlaying ? <Pause className="mr-1 size-3" /> : <Play className="mr-1 size-3" />}
                    {isPlaying ? "Pause preview" : "Play preview"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPlayhead(active.start);
                      if (videoRef.current) {
                        videoRef.current.currentTime = active.start;
                      }
                    }}
                  >
                    Kembali ke awal trim
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Preview gambar ditampilkan sebagai frame statis. Durasi frame tetap bisa diatur di panel tools.
              </p>
            )}
          </div>
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
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={splitClip}
            disabled={!active || active.end - active.start < 0.2}
          >
            <Scissors className="mr-1 size-3" /> Split
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              if (clips.length < 2) return;
              setClips((p) => {
                const merged = p.reduce(
                  (acc, clip) => ({
                    ...acc,
                    end: acc.end + Math.max(clip.end - clip.start, 0),
                  }),
                  {
                    ...p[0]!,
                    id: crypto.randomUUID(),
                    name: "Merged",
                    start: 0,
                    end: 0,
                  },
                );
                return [merged];
              });
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
                max={Math.max(active.end - 0.1, 0)}
                step={0.1}
                value={active.start}
                className="w-full"
                onChange={(e) =>
                  setClips((p) =>
                    p.map((c) =>
                      c.id === active.id
                        ? {
                            ...c,
                            start: Number(e.target.value),
                          }
                        : c,
                    ),
                  )
                }
              />
              <p className="text-xs text-muted-foreground">{formatTime(active.start)}</p>
            </div>
            <div className="space-y-1">
              <Label>Trim end (s)</Label>
              <input
                type="range"
                min={Math.min(active.start + 0.1, active.end)}
                max={Math.max(active.end, active.start + 0.1)}
                step={0.1}
                value={active.end}
                className="w-full"
                onChange={(e) => {
                  const nextEnd = Number(e.target.value);
                  setClips((p) =>
                    p.map((c) =>
                      c.id === active.id
                        ? {
                            ...c,
                            end: Math.max(nextEnd, c.start + 0.1),
                          }
                        : c,
                    ),
                  );
                }}
              />
              <p className="text-xs text-muted-foreground">{formatTime(active.end)}</p>
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
            <p className="text-xs text-muted-foreground">
              Tip: atur trim, lalu gunakan Play preview untuk cek hasil sebelum export.
            </p>
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
