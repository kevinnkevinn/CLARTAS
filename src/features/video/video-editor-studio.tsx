"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Coins,
  Download,
  Film,
  FolderSearch,
  Loader2,
  Pause,
  Play,
  Plus,
  Search,
  Sparkles,
  SplitSquareVertical,
  Tags,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FileDropzone } from "@/components/file-dropzone";
import { runClientAI } from "@/features/lab/client-ai";
import { clearPendingMedia, loadPendingMedia } from "@/lib/pending-media";
import { cn } from "@/lib/utils";
import {
  VIDEO_FEATURE_CATEGORIES,
  VIDEO_FEATURE_COUNT,
  VIDEO_FEATURES,
  VIDEO_IMPORT_PROFILES,
  VIDEO_STARTER_FEATURE_COUNT,
  type VideoFeatureCategoryId,
  type VideoFeatureDefinition,
} from "./video-feature-catalog";

type WorkspaceMode = "beginner" | "studio";
type ClipKind = "video" | "image" | "audio" | "gif";

interface Clip {
  id: string;
  url: string;
  name: string;
  kind: ClipKind;
  track: number;
  start: number;
  end: number;
  speed: number;
}

interface ImportedAsset {
  id: string;
  name: string;
  type: string;
  size: number;
  kind: string;
  source: "dropzone" | "library";
  importedAt: number;
  tags: string[];
  timelineReady: boolean;
}

interface CreditEvent {
  id: string;
  featureId: string;
  featureName: string;
  credits: number;
  at: number;
}

const DEFAULT_IMAGE_DURATION = 3;
const DEFAULT_SIM_CREDITS = 999_999;
const DEFAULT_CATEGORY: VideoFeatureCategoryId = "timeline-editing";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const safe = Math.floor(seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const exponent = Math.min(Math.floor(Math.log(size) / Math.log(1024)), units.length - 1);
  const value = size / 1024 ** exponent;
  return `${value.toFixed(value >= 10 || exponent === 0 ? 0 : 1)} ${units[exponent]}`;
}

function inferClipKind(file: File): ClipKind | null {
  if (file.type.startsWith("video/")) return "video";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type === "image/gif") return "gif";
  if (file.type.startsWith("image/")) return "image";
  return null;
}

function clipTrackForKind(kind: ClipKind) {
  return kind === "audio" ? 2 : 1;
}

function clipDurationForKind(kind: ClipKind) {
  return kind === "image" || kind === "gif" ? DEFAULT_IMAGE_DURATION : 10;
}

function buildAssetTags(file: File, kind: string) {
  const tags = [kind];
  if (file.type.includes("subtitle") || /\.(srt|vtt|ass|ssa|sub)$/i.test(file.name)) tags.push("caption");
  if (/\.(cube|3dl|lut)$/i.test(file.name)) tags.push("color");
  if (/\.(psd|ai)$/i.test(file.name)) tags.push("design");
  if (/\.(cr2|cr3|nef|arw|dng|raw|orf|rw2|hdr|exr|pfm)$/i.test(file.name)) tags.push("camera-original");
  return tags;
}

function isVideoClip(clip: Clip | undefined) {
  return clip?.kind === "video";
}

function isAudioClip(clip: Clip | undefined) {
  return clip?.kind === "audio";
}

export function VideoEditorStudio() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [workspaceMode, setWorkspaceMode] = useState<WorkspaceMode>("beginner");
  const [selectedCategory, setSelectedCategory] = useState<VideoFeatureCategoryId>(DEFAULT_CATEGORY);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [assetQuery, setAssetQuery] = useState("");
  const [simulatedCredits, setSimulatedCredits] = useState(DEFAULT_SIM_CREDITS);
  const [creditEvents, setCreditEvents] = useState<CreditEvent[]>([]);
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const [featureMessage, setFeatureMessage] = useState(
    "Mode Beginner aktif. Fitur dasar diprioritaskan, semua fitur tetap tersedia lewat Studio mode.",
  );
  const [assets, setAssets] = useState<ImportedAsset[]>([]);
  const [pendingImportProfileId, setPendingImportProfileId] = useState<(typeof VIDEO_IMPORT_PROFILES)[number]["id"]>("video");
  const importInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);

  const active = clips.find((clip) => clip.id === selected);
  const activeIsVideo = isVideoClip(active);
  const activeIsAudio = isAudioClip(active);

  const timelineDuration = useMemo(
    () => clips.reduce((acc, clip) => acc + Math.max(clip.end - clip.start, 0), 0),
    [clips],
  );

  const tracks = useMemo(() => {
    const uniqueTracks = Array.from(new Set(clips.map((clip) => clip.track))).sort((a, b) => a - b);
    return uniqueTracks.map((track) => ({
      track,
      label: track === 1 ? "Track 1 • Visual" : track === 2 ? "Track 2 • Audio" : `Track ${track}`,
      clips: clips.filter((clip) => clip.track === track),
    }));
  }, [clips]);

  const filteredAssets = useMemo(() => {
    const query = assetQuery.trim().toLowerCase();
    if (!query) return assets;
    return assets.filter((asset) => {
      const haystack = [asset.name, asset.kind, ...asset.tags].join(" ").toLowerCase();
      return haystack.includes(query);
    });
  }, [assetQuery, assets]);

  const filteredFeatures = useMemo(() => {
    const query = catalogQuery.trim().toLowerCase();
    return VIDEO_FEATURES.filter((feature) => {
      if (workspaceMode === "beginner" && feature.level !== "starter") return false;
      if (feature.categoryId !== selectedCategory) return false;
      if (!query) return true;
      return `${feature.name} ${feature.categoryTitle} ${feature.summary}`.toLowerCase().includes(query);
    });
  }, [catalogQuery, selectedCategory, workspaceMode]);

  const groupedFeatures = useMemo(
    () =>
      VIDEO_FEATURE_CATEGORIES.map((category) => ({
        category,
        features: filteredFeatures.filter((feature) => feature.categoryId === category.id),
      })).filter((group) => group.features.length > 0),
    [filteredFeatures],
  );

  const starterGroups = useMemo(
    () =>
      VIDEO_FEATURE_CATEGORIES.map((category) => ({
        category,
        features: VIDEO_FEATURES.filter(
          (feature) => feature.categoryId === category.id && feature.level === "starter",
        ).slice(0, 4),
      })).filter((group) => group.features.length > 0),
    [],
  );

  const activeFeature = useMemo(
    () => VIDEO_FEATURES.find((feature) => feature.id === activeFeatureId) ?? null,
    [activeFeatureId],
  );

  useEffect(() => {
    if (clips.length > 0) return;

    let isMounted = true;

    void loadPendingMedia("video").then((pending) => {
      if (!isMounted || !pending) return;

      const clip: Clip = {
        id: crypto.randomUUID(),
        url: pending,
        name: "Uploaded media",
        kind: "video",
        track: 1,
        start: 0,
        end: 10,
        speed: 1,
      };

      setClips([clip]);
      setSelected(clip.id);
      setAssets([
        {
          id: crypto.randomUUID(),
          name: clip.name,
          type: "video/*",
          size: 0,
          kind: "video",
          source: "dropzone",
          importedAt: Date.now(),
          tags: ["video", "redirect"],
          timelineReady: true,
        },
      ]);
    });

    return () => {
      isMounted = false;
    };
  }, [clips.length]);

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
    if (!active || !activeIsAudio || !audioRef.current) return;
    const audio = audioRef.current;
    audio.playbackRate = active.speed;
    if (Math.abs(audio.currentTime - playhead) > 0.2) {
      audio.currentTime = playhead;
    }
  }, [active, activeIsAudio, playhead]);

  useEffect(() => {
    const media = activeIsVideo ? videoRef.current : activeIsAudio ? audioRef.current : null;
    if (!media) return;
    if (isPlaying) {
      void media.play().catch(() => {
        setIsPlaying(false);
      });
      return;
    }
    media.pause();
  }, [isPlaying, activeIsAudio, activeIsVideo]);

  function appendClip(url: string, name: string, kind: ClipKind) {
    const clip: Clip = {
      id: crypto.randomUUID(),
      url,
      name,
      kind,
      track: clipTrackForKind(kind),
      start: 0,
      end: clipDurationForKind(kind),
      speed: 1,
    };
    setClips((prev) => [...prev, clip]);
    setSelected(clip.id);
    setOutputUrl(null);
  }

  function registerAsset(file: File, source: ImportedAsset["source"]) {
    const inferredKind = inferClipKind(file) ?? pendingImportProfileId;
    const asset: ImportedAsset = {
      id: crypto.randomUUID(),
      name: file.name,
      type: file.type || "application/octet-stream",
      size: file.size,
      kind: inferredKind,
      source,
      importedAt: Date.now(),
      tags: buildAssetTags(file, inferredKind),
      timelineReady: inferClipKind(file) !== null,
    };
    setAssets((prev) => [asset, ...prev].slice(0, 60));
  }

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
      prev.flatMap((clip) =>
        clip.id === active.id ? [{ ...clip, end: splitPoint, name: `${clip.name} (part 1)` }, second] : [clip],
      ),
    );
    setPlayhead(splitPoint);
  }

  function togglePreview() {
    if (!active || (!activeIsVideo && !activeIsAudio)) return;
    if (!isPlaying) {
      setPlayhead((current) => Math.min(Math.max(current, active.start), active.end));
    }
    setIsPlaying((previous) => !previous);
  }

  async function removeSelectedClip() {
    if (!selected) return;

    setClips((prev) => {
      const nextClips = prev.filter((clip) => clip.id !== selected);
      setSelected(nextClips[0]?.id ?? null);
      return nextClips;
    });
    setOutputUrl(null);
    setFeatureMessage("Media pada timeline dihapus dari sesi aktif.");
    await clearPendingMedia("video");
  }

  async function exportVideo() {
    if (!clips.length) return;
    setProcessing(true);
    try {
      const imageUrls = clips
        .filter((clip) => clip.kind === "image" || clip.kind === "gif")
        .map((clip) => clip.url)
        .filter((url) => url.startsWith("data:image") || url.startsWith("blob:"));
      if (imageUrls.length) {
        const result = await runClientAI("video-slideshow", { imageUrls, aspectRatio });
        setOutputUrl(result.output.videoUrl as string);
        return;
      }
      setOutputUrl(clips.find((clip) => clip.kind === "video")?.url ?? clips[0]?.url ?? null);
    } finally {
      setProcessing(false);
    }
  }

  function triggerImport(profileId: (typeof VIDEO_IMPORT_PROFILES)[number]["id"]) {
    setPendingImportProfileId(profileId);
    importInputRef.current?.click();
  }

  function handleImportedFiles(files: FileList | null) {
    if (!files?.length) return;

    for (const file of Array.from(files)) {
      registerAsset(file, "library");
      const clipKind = inferClipKind(file);
      if (clipKind) {
        appendClip(URL.createObjectURL(file), file.name, clipKind);
      }
    }

    const importFeatureName = VIDEO_IMPORT_PROFILES.find((profile) => profile.id === pendingImportProfileId)?.featureName;
    const importFeature = VIDEO_FEATURES.find((feature) => feature.name === importFeatureName);
    if (importFeature) {
      simulateFeature(importFeature, `Import ${files.length} file berhasil masuk ke media pool.`);
    }
  }

  function simulateFeature(feature: VideoFeatureDefinition, customMessage?: string) {
    if (simulatedCredits < feature.credits) {
      setFeatureMessage(`Kredit simulasi tidak cukup untuk ${feature.name}. Silakan isi ulang kredit simulasi.`);
      return;
    }

    setSimulatedCredits((prev) => prev - feature.credits);
    setActiveFeatureId(feature.id);
    setCreditEvents((prev) => [
      {
        id: crypto.randomUUID(),
        featureId: feature.id,
        featureName: feature.name,
        credits: feature.credits,
        at: Date.now(),
      },
      ...prev,
    ].slice(0, 18));
    setFeatureMessage(customMessage ?? `${feature.name} disimulasikan. Kredit berkurang ${feature.credits}.`);

    if (feature.name === "Split clip") {
      splitClip();
    }
    if (feature.name === "Trim clip") {
      setFeatureMessage("Trim clip aktif. Gunakan slider trim di panel preview untuk simulasi trimming.");
    }
    if (feature.name === "Timeline markers") {
      setFeatureMessage(`Marker simulasi dipasang di ${formatTime(playhead)}.`);
    }
  }

  const selectedImportProfile = VIDEO_IMPORT_PROFILES.find((profile) => profile.id === pendingImportProfileId)!;

  return (
    <div className="space-y-6">
      <input
        ref={importInputRef}
        type="file"
        multiple
        accept={selectedImportProfile.accept}
        className="hidden"
        onChange={(event) => {
          handleImportedFiles(event.target.files);
          event.target.value = "";
        }}
      />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle>Video Studio Workspace</CardTitle>
                <CardDescription>
                  Semua fitur video editor tersedia, tetapi mode pemula tetap jadi default supaya onboarding tidak berat.
                </CardDescription>
              </div>
              <div className="flex gap-2">
                <Button type="button" variant={workspaceMode === "beginner" ? "default" : "outline"} onClick={() => setWorkspaceMode("beginner")}>
                  Beginner mode
                </Button>
                <Button type="button" variant={workspaceMode === "studio" ? "default" : "outline"} onClick={() => setWorkspaceMode("studio")}>
                  Studio mode
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase text-muted-foreground">Feature coverage</p>
              <p className="mt-2 text-3xl font-semibold">{VIDEO_FEATURE_COUNT}</p>
              <p className="mt-1 text-sm text-muted-foreground">Fitur video terdaftar di workspace ini.</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase text-muted-foreground">Starter features</p>
              <p className="mt-2 text-3xl font-semibold">{VIDEO_STARTER_FEATURE_COUNT}</p>
              <p className="mt-1 text-sm text-muted-foreground">Dikurasi agar user baru tetap cepat paham.</p>
            </div>
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="text-xs uppercase text-muted-foreground">Simulation credits</p>
              <div className="mt-2 flex items-center gap-2 text-3xl font-semibold">
                <Coins className="size-7 text-amber-500" />
                {simulatedCredits.toLocaleString("id-ID")}
              </div>
              <div className="mt-2 flex gap-2">
                <Button type="button" size="sm" variant="outline" onClick={() => setSimulatedCredits(DEFAULT_SIM_CREDITS)}>
                  Isi ulang
                </Button>
                <Badge variant="secondary">Simulasi lokal</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Start Pemula</CardTitle>
            <CardDescription>
              Jalur aman: import, potong, tambahkan subtitle, beri efek, lalu export ke sosial media.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="rounded-lg border p-3">
              <p className="font-medium">1. Import media</p>
              <p className="text-muted-foreground">Video, audio, gambar, GIF, subtitle, LUT, dan aset produksi lain masuk ke media pool.</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">2. Edit timeline</p>
              <p className="text-muted-foreground">Gunakan trim, split, drag-drop, marker, dan multi-track untuk menyusun edit awal.</p>
            </div>
            <div className="rounded-lg border p-3">
              <p className="font-medium">3. Tingkatkan hasil</p>
              <p className="text-muted-foreground">Tambahkan color correction, subtitle otomatis, AI reframing, audio cleanup, dan export preset.</p>
            </div>
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-primary">{featureMessage}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.45fr)_360px]">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Import & Ingest</CardTitle>
              <CardDescription>
                Dropzone tetap cepat untuk visual media, sementara import profile menangani format studio yang lebih luas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <FileDropzone
                accept="video/*,image/*"
                multiple
                label="Upload video, foto, atau GIF untuk langsung masuk ke timeline"
                onUpload={(url, file) => {
                  const kind = inferClipKind(file);
                  registerAsset(file, "dropzone");
                  if (kind) {
                    appendClip(url, file.name, kind);
                  }
                }}
              />

              <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
                {VIDEO_IMPORT_PROFILES.map((profile) => (
                  <Button key={profile.id} type="button" variant="outline" className="h-auto justify-start py-3 text-left" onClick={() => triggerImport(profile.id)}>
                    <Plus className="mr-2 size-4" /> {profile.label}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <CardTitle>Multi-track Timeline</CardTitle>
                  <CardDescription>
                    Track visual dan audio dipisah agar pemula tetap jelas, tetapi pondasinya sudah siap untuk multi-track editing.
                  </CardDescription>
                </div>
                <Badge variant="secondary">Durasi total {formatTime(timelineDuration)}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {tracks.length ? (
                tracks.map((track) => (
                  <div key={track.track} className="rounded-xl border p-3">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="font-medium">{track.label}</p>
                      <Badge variant="outline">{track.clips.length} clip</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {track.clips.map((clip) => (
                        <button
                          key={clip.id}
                          type="button"
                          onClick={() => setSelected(clip.id)}
                          className={cn(
                            "min-w-[160px] rounded-lg border px-3 py-2 text-left text-xs transition",
                            selected === clip.id ? "border-primary bg-primary/10" : "hover:border-primary/40",
                          )}
                        >
                          <div className="truncate font-medium">{clip.name}</div>
                          <div className="mt-1 text-[11px] text-muted-foreground">
                            {clip.kind.toUpperCase()} • {formatTime(clip.start)} - {formatTime(clip.end)} • ×{clip.speed}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">Belum ada clip. Import media terlebih dulu untuk mulai menyusun timeline.</p>
              )}
            </CardContent>
          </Card>

          {active ? (
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>Preview & Clip Controls</CardTitle>
                    <CardDescription>
                      Simulasi trim, split, speed, marker, dan preview clip aktif berlangsung di sini.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{formatTime(playhead)} / {formatTime(active.end)}</Badge>
                    <Button type="button" variant="ghost" size="sm" onClick={() => void removeSelectedClip()}>
                      <Trash2 className="mr-1 size-3.5" /> Hapus media
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {activeIsVideo ? (
                  <video
                    ref={videoRef}
                    src={active.url}
                    controls
                    className="max-h-80 w-full rounded-xl bg-black"
                    onLoadedMetadata={(event) => {
                      const duration = event.currentTarget.duration;
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
                    onTimeUpdate={(event) => {
                      const current = event.currentTarget.currentTime;
                      if (!active) return;
                      if (current >= active.end) {
                        event.currentTarget.currentTime = active.start;
                        if (!isPlaying) event.currentTarget.pause();
                        setPlayhead(active.start);
                        return;
                      }
                      setPlayhead(current);
                    }}
                  />
                ) : activeIsAudio ? (
                  <div className="space-y-3 rounded-xl border bg-muted/20 p-4">
                    <audio
                      ref={audioRef}
                      src={active.url}
                      controls
                      className="w-full"
                      onTimeUpdate={(event) => {
                        const current = event.currentTarget.currentTime;
                        if (!active) return;
                        if (current >= active.end) {
                          event.currentTarget.currentTime = active.start;
                          if (!isPlaying) event.currentTarget.pause();
                          setPlayhead(active.start);
                          return;
                        }
                        setPlayhead(current);
                      }}
                    />
                    <p className="text-sm text-muted-foreground">Audio clip aktif. Track audio mendukung trimming, speed, fade, dan simulasi mixing.</p>
                  </div>
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={active.url} alt={active.name} className="max-h-80 w-full rounded-xl object-contain" />
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Trim start (s)</Label>
                    <input
                      type="range"
                      min={0}
                      max={Math.max(active.end - 0.1, 0)}
                      step={0.1}
                      value={active.start}
                      className="w-full"
                      onChange={(event) =>
                        setClips((prev) => prev.map((clip) => (clip.id === active.id ? { ...clip, start: Number(event.target.value) } : clip)))
                      }
                    />
                    <p className="text-xs text-muted-foreground">{formatTime(active.start)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Trim end (s)</Label>
                    <input
                      type="range"
                      min={Math.min(active.start + 0.1, active.end)}
                      max={Math.max(active.end, active.start + 0.1)}
                      step={0.1}
                      value={active.end}
                      className="w-full"
                      onChange={(event) => {
                        const nextEnd = Number(event.target.value);
                        setClips((prev) =>
                          prev.map((clip) =>
                            clip.id === active.id ? { ...clip, end: Math.max(nextEnd, clip.start + 0.1) } : clip,
                          ),
                        );
                      }}
                    />
                    <p className="text-xs text-muted-foreground">{formatTime(active.end)}</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Speed {active.speed}x</Label>
                    <input
                      type="range"
                      min={0.5}
                      max={2}
                      step={0.1}
                      value={active.speed}
                      className="w-full"
                      onChange={(event) =>
                        setClips((prev) => prev.map((clip) => (clip.id === active.id ? { ...clip, speed: Number(event.target.value) } : clip)))
                      }
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 self-end">
                    <Button type="button" variant="outline" size="sm" onClick={splitClip} disabled={active.end - active.start < 0.2}>
                      <SplitSquareVertical className="mr-1 size-3.5" /> Split
                    </Button>
                    <Button type="button" variant="outline" size="sm" onClick={togglePreview}>
                      {isPlaying ? <Pause className="mr-1 size-3.5" /> : <Play className="mr-1 size-3.5" />}
                      {isPlaying ? "Pause preview" : "Play preview"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setPlayhead(active.start);
                        if (videoRef.current) videoRef.current.currentTime = active.start;
                        if (audioRef.current) audioRef.current.currentTime = active.start;
                      }}
                    >
                      Kembali ke awal
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {outputUrl ? (
            <Card>
              <CardHeader>
                <CardTitle>Export Preview</CardTitle>
                <CardDescription>Hasil simulasi export dari timeline aktif.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <video src={outputUrl} controls className="w-full rounded-xl" />
                <a href={outputUrl} download="clartas-export.webm" className="inline-flex text-sm text-primary hover:underline">
                  <Download className="mr-1 inline size-4" /> Download
                </a>
              </CardContent>
            </Card>
          ) : null}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Media Pool & Asset Manager</CardTitle>
              <CardDescription>
                Menyatukan media browser, pool, tagging, metadata, dan pencarian dalam satu panel yang tetap ringan.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input value={assetQuery} onChange={(event) => setAssetQuery(event.target.value)} placeholder="Cari media, tag, subtitle, LUT, atau asset studio" className="pl-9" />
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium"><FolderSearch className="size-4 text-primary" /> Media Browser</div>
                  <p className="mt-1 text-muted-foreground">Jelajah aset lokal, cloud, smart bin, dan duplikasi.</p>
                </div>
                <div className="rounded-lg border p-3 text-sm">
                  <div className="flex items-center gap-2 font-medium"><Tags className="size-4 text-primary" /> Metadata & Tagging</div>
                  <p className="mt-1 text-muted-foreground">Tag otomatis mempermudah media search, smart bin, dan asset manager.</p>
                </div>
              </div>
              <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
                {filteredAssets.length ? (
                  filteredAssets.map((asset) => (
                    <div key={asset.id} className="rounded-lg border p-3 text-sm">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium">{asset.name}</p>
                          <p className="text-xs text-muted-foreground">{asset.kind} • {formatFileSize(asset.size)} • {asset.source === "dropzone" ? "quick upload" : "library import"}</p>
                        </div>
                        <Badge variant={asset.timelineReady ? "secondary" : "outline"}>{asset.timelineReady ? "timeline-ready" : "library-only"}</Badge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {asset.tags.map((tag) => (
                          <Badge key={tag} variant="outline">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada aset cocok dengan pencarian ini.</p>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Render & Delivery</CardTitle>
              <CardDescription>Preset export sosial media dan simulasi akselerasi hardware tersedia dari satu panel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <Label>Format export</Label>
                <Select value={aspectRatio} onChange={(event) => setAspectRatio(event.target.value)}>
                  <option value="9:16">TikTok / Reels / Shorts (9:16)</option>
                  <option value="1:1">Instagram Feed (1:1)</option>
                  <option value="16:9">YouTube (16:9)</option>
                  <option value="4:5">Marketplace (4:5)</option>
                </Select>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                <Badge variant="outline">H.264</Badge>
                <Badge variant="outline">H.265</Badge>
                <Badge variant="outline">ProRes</Badge>
                <Badge variant="outline">DNxHR</Badge>
                <Badge variant="outline">GPU rendering</Badge>
                <Badge variant="outline">Background rendering</Badge>
              </div>
              <Button className="w-full" onClick={exportVideo} disabled={!clips.length || processing}>
                {processing ? <Loader2 className="size-4 animate-spin" /> : <Film className="size-4" />}
                Export video
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Credit Simulation</CardTitle>
              <CardDescription>Kredit sangat besar, tetapi tiap fitur tetap mensimulasikan biaya pemakaian.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {activeFeature ? (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                  <p className="font-medium">Fitur aktif terakhir</p>
                  <p className="mt-1">{activeFeature.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{activeFeature.summary}</p>
                </div>
              ) : null}
              <div className="space-y-2">
                {creditEvents.length ? (
                  creditEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                      <div>
                        <p className="font-medium">{event.featureName}</p>
                        <p className="text-xs text-muted-foreground">{new Date(event.at).toLocaleTimeString("id-ID")}</p>
                      </div>
                      <span className="font-semibold text-destructive">-{event.credits}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">Belum ada pemakaian fitur yang disimulasikan.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Feature Navigator</CardTitle>
            <CardDescription>Pilih area kerja, cari fitur, lalu aktifkan simulasi penggunaan kredit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Cari fitur video, AI, audio, VFX..." className="pl-9" />
            </div>
            <div className="space-y-2">
              {VIDEO_FEATURE_CATEGORIES.map((category) => {
                const total = VIDEO_FEATURES.filter((feature) => feature.categoryId === category.id).length;
                const visible = filteredFeatures.filter((feature) => feature.categoryId === category.id).length;
                return (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={cn(
                      "w-full rounded-lg border px-3 py-2 text-left transition",
                      selectedCategory === category.id ? "border-primary bg-primary/10" : "hover:border-primary/30",
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium">{category.title}</span>
                      <Badge variant="outline">{visible}/{total}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">{category.summary}</p>
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {workspaceMode === "beginner" ? (
            <Card>
              <CardHeader>
                <CardTitle>Starter Paths</CardTitle>
                <CardDescription>Fitur dasar ditampilkan lebih dulu. Ganti ke Studio mode kapan pun untuk melihat semuanya sekaligus.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {starterGroups.map(({ category, features }) => (
                  <div key={category.id} className="rounded-xl border p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">{category.title}</p>
                        <p className="text-xs text-muted-foreground">{category.summary}</p>
                      </div>
                      <Badge variant="secondary">Starter</Badge>
                    </div>
                    <div className="space-y-2">
                      {features.map((feature) => (
                        <button
                          key={feature.id}
                          type="button"
                          className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm hover:border-primary/40"
                          onClick={() => {
                            setSelectedCategory(feature.categoryId);
                            simulateFeature(feature);
                          }}
                        >
                          <span>{feature.name}</span>
                          <Badge variant="outline">{feature.credits}</Badge>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ) : null}

          {groupedFeatures.map(({ category, features }) => (
            <Card key={category.id}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <CardTitle>{category.title}</CardTitle>
                    <CardDescription>{category.summary}</CardDescription>
                  </div>
                  <Badge variant="secondary">{features.length} fitur</Badge>
                </div>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {features.map((feature) => (
                  <div key={feature.id} className="rounded-xl border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium">{feature.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{feature.summary}</p>
                      </div>
                      <Badge variant={feature.level === "starter" ? "secondary" : "outline"}>{feature.level === "starter" ? "Pemula" : "Studio"}</Badge>
                    </div>
                    <div className="mt-3 flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{feature.categoryTitle}</span>
                      <span>{feature.credits} kredit</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button type="button" size="sm" className="flex-1" onClick={() => simulateFeature(feature)}>
                        <Sparkles className="mr-1 size-3.5" /> Gunakan simulasi
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
