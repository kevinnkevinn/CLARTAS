"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronRight,
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
  type VideoFeatureCategoryId,
  type VideoFeatureDefinition,
} from "./video-feature-catalog";

type ClipKind = "video" | "image" | "audio" | "gif";
type FlowStep = "import" | "timeline" | "polish" | "export";

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
  const [selectedCategory, setSelectedCategory] = useState<VideoFeatureCategoryId>(DEFAULT_CATEGORY);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [assetQuery, setAssetQuery] = useState("");
  const [simulatedCredits, setSimulatedCredits] = useState(DEFAULT_SIM_CREDITS);
  const [creditEvents, setCreditEvents] = useState<CreditEvent[]>([]);
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const [featureMessage, setFeatureMessage] = useState(
    "Mode editing aktif. Fokuskan alur: import, susun timeline, preview, lalu export.",
  );
  const [focusedStep, setFocusedStep] = useState<FlowStep>("import");
  const [timelineReviewed, setTimelineReviewed] = useState(false);
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
      if (feature.categoryId !== selectedCategory) return false;
      if (!query) return true;
      return `${feature.name} ${feature.categoryTitle} ${feature.summary}`.toLowerCase().includes(query);
    });
  }, [catalogQuery, selectedCategory]);

  const categoryCoverage = useMemo(
    () =>
      VIDEO_FEATURE_CATEGORIES.map((category) => {
        const all = VIDEO_FEATURES.filter((feature) => feature.categoryId === category.id);
        const starter = all.filter((feature) => feature.level === "starter").length;
        return {
          id: category.id,
          title: category.title,
          total: all.length,
          starter,
          advanced: all.length - starter,
        };
      }),
    [],
  );

  const totalCreditsSpent = useMemo(
    () => creditEvents.reduce((acc, event) => acc + event.credits, 0),
    [creditEvents],
  );

  const workflowStep = useMemo(() => {
    if (outputUrl) return 4;
    if (timelineReviewed && active) return 3;
    if (clips.length > 0) return 2;
    if (assets.length > 0) return 1;
    return 0;
  }, [active, assets.length, clips.length, outputUrl, timelineReviewed]);

  const recommendedStep = useMemo<FlowStep>(() => {
    if (!clips.length) return "import";
    if (!timelineReviewed) return "timeline";
    if (!active) return "timeline";
    if (!outputUrl) return "polish";
    return "export";
  }, [active, clips.length, outputUrl, timelineReviewed]);

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
    setTimelineReviewed(false);
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
    setTimelineReviewed(false);
    setOutputUrl(null);
    setFeatureMessage("Media pada timeline dihapus dari sesi aktif.");
    await clearPendingMedia("video");
  }

  async function exportVideo() {
    if (!clips.length) return;
    setTimelineReviewed(true);
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

  function simulateFeatureBatch(features: VideoFeatureDefinition[], label: string) {
    if (!features.length) {
      setFeatureMessage("Tidak ada fitur yang cocok untuk disimulasikan pada filter saat ini.");
      return;
    }

    const totalDebit = features.reduce((acc, feature) => acc + feature.credits, 0);
    if (simulatedCredits < totalDebit) {
      setFeatureMessage(
        `Kredit simulasi tidak cukup untuk batch ${label}. Butuh ${totalDebit} kredit.`,
      );
      return;
    }

    const now = Date.now();
    const events: CreditEvent[] = features
      .slice()
      .reverse()
      .map((feature, index) => ({
        id: crypto.randomUUID(),
        featureId: feature.id,
        featureName: feature.name,
        credits: feature.credits,
        at: now - index,
      }));

    setSimulatedCredits((prev) => prev - totalDebit);
    setCreditEvents((prev) => [...events, ...prev].slice(0, 40));
    setActiveFeatureId(features[features.length - 1]?.id ?? null);
    setFeatureMessage(`${label} disimulasikan (${features.length} fitur). Kredit berkurang ${totalDebit}.`);
  }

  const selectedImportProfile = VIDEO_IMPORT_PROFILES.find((profile) => profile.id === pendingImportProfileId)!;

  const isBeginner = true;

  const showImportPanel = !isBeginner || focusedStep === "import";
  const showTimelinePanel = !isBeginner || focusedStep === "timeline";
  const showPolishPanel = !isBeginner || focusedStep === "polish";
  const showExportPanel = !isBeginner || focusedStep === "export";

  useEffect(() => {
    setFocusedStep(recommendedStep);
  }, [recommendedStep]);

  function continueToTimeline() {
    setFocusedStep("timeline");
    setFeatureMessage("Media sudah masuk. Tinjau urutan clip di timeline sebelum lanjut ke preview.");
  }

  function continueToPolish() {
    if (!selected) {
      setFeatureMessage("Pilih satu clip di timeline terlebih dulu sebelum lanjut ke preview.");
      return;
    }

    setTimelineReviewed(true);
    setFocusedStep("polish");
    setFeatureMessage("Masuk ke tahap preview. Sekarang Anda bisa trim, split, dan atur speed clip aktif.");
  }

  function continueToExport() {
    setFocusedStep("export");
    setFeatureMessage("Masuk ke tahap export. Pilih format lalu render hasil video.");
  }

  const workflowSteps = [
    {
      id: "step-import",
      title: "Import",
      subtitle: "Masukkan media",
    },
    {
      id: "step-timeline",
      title: "Timeline",
      subtitle: "Susun klip",
    },
    {
      id: "step-polish",
      title: "Polish",
      subtitle: "Preview & perapihan",
    },
    {
      id: "step-export",
      title: "Export",
      subtitle: "Render hasil",
    },
  ] as const;

  const selectedCategoryMeta =
    VIDEO_FEATURE_CATEGORIES.find((category) => category.id === selectedCategory) ?? VIDEO_FEATURE_CATEGORIES[0];

  const focusedStepMeta = workflowSteps.find((step) => {
    if (focusedStep === "import") return step.id === "step-import";
    if (focusedStep === "timeline") return step.id === "step-timeline";
    if (focusedStep === "polish") return step.id === "step-polish";
    return step.id === "step-export";
  });

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

      <Card className="overflow-hidden border-border/70 bg-background/95 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.18)]">
        <CardContent className="p-0">
          <div className="border-b bg-gradient-to-br from-muted/30 via-background to-muted/10 px-4 py-4 md:px-6 md:py-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-2xl space-y-3">
                <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-[0.24em] text-muted-foreground">
                  <span>Editing Workspace</span>
                  <span className="rounded-full border bg-background px-2 py-0.5 tracking-[0.18em]">Guided</span>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold tracking-tight md:text-3xl">Video Studio Workspace</h2>
                  <p className="mt-1 text-sm text-muted-foreground md:text-base">
                    Mulai dari import, susun clip, poles hasil, lalu export. Fitur tetap lengkap, tapi urutannya dibuat lebih jelas.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="rounded-full px-3 py-1 text-xs">
                    Tahap aktif: {focusedStepMeta?.title ?? "Import"}
                  </Badge>
                  <Button type="button" size="sm" variant="outline" onClick={() => setFocusedStep("import")}>Import</Button>
                  <Button type="button" size="sm" variant="outline" onClick={continueToTimeline}>Timeline</Button>
                  <Button type="button" size="sm" variant="outline" onClick={continueToPolish} disabled={!selected}>Preview</Button>
                  <Button type="button" size="sm" onClick={continueToExport} disabled={!clips.length}>Export</Button>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <Badge variant="outline">{VIDEO_FEATURE_COUNT} fitur</Badge>
                <Badge variant="secondary" className="gap-1">
                  <Coins className="size-3.5 text-amber-500" />
                  {simulatedCredits.toLocaleString("id-ID")}
                </Badge>
              </div>
            </div>
          </div>

              <div className={cn("grid gap-0", isBeginner ? "grid-cols-1" : "xl:grid-cols-[280px_minmax(0,1fr)_340px]")}>
                <aside className={cn("border-b bg-muted/10 xl:border-b-0 xl:border-r", isBeginner && "hidden")}>
                  <div className="space-y-4 p-4">
                    <div className="rounded-2xl border bg-background p-3 shadow-[0_12px_24px_-22px_rgba(0,0,0,0.22)]">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">Project Bin</p>
                          <p className="text-xs text-muted-foreground">Semua media dan langkah kerja terkumpul di satu panel.</p>
                        </div>
                        <Badge variant="outline">{assets.length} aset</Badge>
                      </div>
                      <div className="mt-3 grid gap-2">
                        <Button type="button" size="sm" className="justify-start" onClick={() => triggerImport("video")}>
                          <Plus className="mr-2 size-4" /> Import video
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="justify-start" onClick={() => triggerImport("audio")}>
                          <Plus className="mr-2 size-4" /> Import audio
                        </Button>
                        <Button type="button" size="sm" variant="outline" className="justify-start" onClick={() => triggerImport("image")}>
                          <Plus className="mr-2 size-4" /> Import gambar
                        </Button>
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-background p-3 shadow-[0_12px_24px_-22px_rgba(0,0,0,0.22)]">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">Langkah Editing</p>
                        <Badge variant="secondary">{focusedStepMeta?.title ?? "Flow"}</Badge>
                      </div>
                      <div className="space-y-2">
                        {workflowSteps.map((step, index) => {
                          const status = workflowStep > index ? "done" : workflowStep === index ? "active" : "idle";
                          const flowStepId =
                            step.id === "step-import"
                              ? "import"
                              : step.id === "step-timeline"
                                ? "timeline"
                                : step.id === "step-polish"
                                  ? "polish"
                                  : "export";
                          return (
                            <button
                              key={step.id}
                              type="button"
                              onClick={() => setFocusedStep(flowStepId)}
                              className={cn(
                                "flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition",
                                status === "active" && "border-primary bg-primary/10",
                                status === "done" && "border-emerald-500/40 bg-emerald-500/10",
                                isBeginner && focusedStep === flowStepId && "ring-1 ring-primary/50",
                              )}
                            >
                              <div>
                                <p className="text-sm font-medium">{index + 1}. {step.title}</p>
                                <p className="text-xs text-muted-foreground">{step.subtitle}</p>
                              </div>
                              <ChevronRight className="size-4 text-muted-foreground" />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    <div className="rounded-2xl border bg-background p-3 shadow-[0_12px_24px_-22px_rgba(0,0,0,0.22)]">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <p className="text-sm font-medium">Tool Shelf</p>
                        <Badge variant="outline">{selectedCategoryMeta.title}</Badge>
                      </div>
                      <div className="relative mb-3">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Cari tool..." className="pl-9" />
                      </div>
                      <div className="space-y-2">
                        {VIDEO_FEATURE_CATEGORIES.map((category) => (
                          <button
                            key={category.id}
                            type="button"
                            onClick={() => setSelectedCategory(category.id)}
                            className={cn(
                              "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                              selectedCategory === category.id ? "border-primary bg-primary/10" : "hover:border-primary/30",
                            )}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span>{category.title}</span>
                              <Badge variant="outline">{VIDEO_FEATURES.filter((feature) => feature.categoryId === category.id).length}</Badge>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </aside>

                <section className={cn("min-w-0", !isBeginner && "border-b xl:border-b-0 xl:border-r")}>
                  <div className="grid gap-0 xl:grid-rows-[auto_1fr]">
                    <div
                      className={cn(
                        "grid gap-0 border-b md:grid-cols-2",
                        isBeginner && focusedStep !== "polish" && focusedStep !== "export" && "hidden",
                      )}
                    >
                      <div className="border-b bg-background p-4 md:border-b-0 md:border-r">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">Source Monitor</p>
                            <p className="text-xs text-muted-foreground">Clip yang sedang dipilih untuk ditinjau.</p>
                          </div>
                          <Badge variant="outline">{active ? active.kind.toUpperCase() : "EMPTY"}</Badge>
                        </div>

                        <div className="overflow-hidden rounded-xl border bg-black/95">
                          {active ? (
                            activeIsVideo ? (
                              <video
                                ref={videoRef}
                                src={active.url}
                                controls
                                className="aspect-video w-full bg-black object-contain"
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
                              <div className="flex aspect-video items-center justify-center p-6">
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
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={active.url} alt={active.name} className="aspect-video w-full object-contain" />
                            )
                          ) : (
                            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/70">
                              Pilih clip dari timeline atau media pool untuk memulai preview.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="bg-background p-4">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-medium">Program Monitor</p>
                            <p className="text-xs text-muted-foreground">Preview hasil sequence atau hasil export.</p>
                          </div>
                          <Badge variant="secondary">{outputUrl ? "READY" : "TIMELINE"}</Badge>
                        </div>

                        <div className="overflow-hidden rounded-xl border bg-black/95">
                          {outputUrl ? (
                            <video src={outputUrl} controls className="aspect-video w-full bg-black object-contain" />
                          ) : active ? (
                            activeIsAudio ? (
                              <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/70">
                                Preview sequence audio aktif. Lanjutkan ke export untuk melihat hasil akhir.
                              </div>
                            ) : (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={active.url} alt={`${active.name} preview`} className="aspect-video w-full object-contain" />
                            )
                          ) : (
                            <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/70">
                              Hasil sequence akan muncul di sini setelah Anda memilih clip atau melakukan export.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className={cn(
                        "bg-muted/10 p-4",
                        isBeginner && (focusedStep === "polish" || focusedStep === "export") && "hidden",
                      )}
                    >
                      {isBeginner ? (
                        <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
                          <p className="text-sm font-medium">Alur pemula aktif</p>
                          <p className="text-xs text-muted-foreground">
                            Selesaikan tahap ini dulu, lalu lanjut ke tombol tahap berikutnya di atas.
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <Button type="button" size="sm" onClick={() => triggerImport("video")}>
                              <Plus className="mr-1 size-3.5" /> Import video
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => triggerImport("audio")}>
                              <Plus className="mr-1 size-3.5" /> Import audio
                            </Button>
                            <Button type="button" size="sm" variant="outline" onClick={() => triggerImport("image")}>
                              <Plus className="mr-1 size-3.5" /> Import gambar
                            </Button>
                          </div>
                        </div>
                      ) : null}

                      <div className="rounded-2xl border bg-background shadow-[0_12px_24px_-22px_rgba(0,0,0,0.18)]">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3">
                          <div>
                            <p className="text-sm font-medium">Timeline</p>
                            <p className="text-xs text-muted-foreground">Area utama untuk menyusun klip sebelum dipoles dan diexport.</p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline">Durasi {formatTime(timelineDuration)}</Badge>
                            <Badge variant="outline">{tracks.length || 0} track</Badge>
                          </div>
                        </div>

                        <div className="space-y-3 p-4">
                          {showImportPanel ? (
                            <div className="rounded-xl border border-dashed bg-background p-4">
                              <p className="mb-3 text-sm font-medium">Import cepat ke project bin</p>
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
                                  continueToTimeline();
                                }}
                              />
                            </div>
                          ) : null}

                          {clips.length ? (
                            <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                              <div>
                                <p className="text-sm font-medium text-primary">Review urutan clip dulu</p>
                                <p className="text-xs text-muted-foreground">Setelah urutan benar dan clip dipilih, lanjutkan ke preview.</p>
                              </div>
                              <Button type="button" onClick={continueToPolish} disabled={!selected}>
                                Lanjut ke preview
                              </Button>
                            </div>
                          ) : null}

                          {tracks.length ? (
                            tracks.map((track) => (
                              <div key={track.track} className="rounded-xl border bg-background p-3">
                                <div className="mb-3 flex items-center justify-between gap-2">
                                  <p className="text-sm font-medium">{track.label}</p>
                                  <Badge variant="outline">{track.clips.length} clip</Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {track.clips.map((clip) => (
                                    <button
                                      key={clip.id}
                                      type="button"
                                      onClick={() => {
                                        setSelected(clip.id);
                                        setFeatureMessage("Clip dipilih. Jika urutan sudah benar, lanjutkan ke tahap preview.");
                                      }}
                                      className={cn(
                                        "min-w-[180px] rounded-lg border px-3 py-2 text-left text-xs transition",
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
                            <div className="rounded-xl border bg-background p-8 text-center text-sm text-muted-foreground">
                              Belum ada clip. Mulai dari import media di kiri atau gunakan dropzone di atas timeline.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                <aside
                  className={cn(
                    "bg-muted/10",
                    isBeginner && focusedStep !== "polish" && focusedStep !== "export" && "hidden",
                  )}
                >
                  <div className="space-y-4 p-4">
                    <div className="rounded-2xl border bg-background p-3 shadow-[0_12px_24px_-22px_rgba(0,0,0,0.22)]">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <p className="text-sm font-medium">Inspector</p>
                          <p className="text-xs text-muted-foreground">Kontrol konteks untuk clip atau tahap export.</p>
                        </div>
                        <Badge variant="outline">{focusedStepMeta?.title ?? "Inspector"}</Badge>
                      </div>

                      {showPolishPanel && active ? (
                        <div className="mt-4 space-y-4">
                          <div className="rounded-lg border bg-muted/20 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <p className="text-sm font-medium">Clip aktif</p>
                                <p className="text-xs text-muted-foreground">{active.name}</p>
                              </div>
                              <Button type="button" variant="ghost" size="sm" onClick={() => void removeSelectedClip()}>
                                <Trash2 className="mr-1 size-3.5" /> Hapus
                              </Button>
                            </div>
                            <p className="mt-2 text-xs text-muted-foreground">{formatTime(playhead)} / {formatTime(active.end)}</p>
                          </div>

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

                          <div className="grid gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={splitClip} disabled={active.end - active.start < 0.2}>
                              <SplitSquareVertical className="mr-1 size-3.5" /> Split clip
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
                            <Button type="button" size="sm" onClick={continueToExport}>
                              Lanjut ke export
                            </Button>
                          </div>
                        </div>
                      ) : showExportPanel ? (
                        <div className="mt-4 space-y-4">
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

                          {outputUrl ? (
                            <a href={outputUrl} download="clartas-export.webm" className="inline-flex text-sm text-primary hover:underline">
                              <Download className="mr-1 inline size-4" /> Download hasil export
                            </a>
                          ) : (
                            <p className="text-xs text-muted-foreground">Setelah export selesai, hasil akan tampil di Program Monitor.</p>
                          )}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-lg border bg-muted/20 p-4 text-sm text-muted-foreground">
                          Pilih clip di timeline untuk membuka kontrol edit, atau pindah ke tahap export untuk menyiapkan hasil akhir.
                        </div>
                      )}
                    </div>

                    <div className="rounded-2xl border bg-background p-3 shadow-[0_12px_24px_-22px_rgba(0,0,0,0.22)]">
                      <div className="mb-3 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 font-medium"><FolderSearch className="size-4 text-primary" /> Media Browser</div>
                        <Badge variant="outline">{filteredAssets.length}</Badge>
                      </div>
                      <div className="relative mb-3">
                        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                        <Input value={assetQuery} onChange={(event) => setAssetQuery(event.target.value)} placeholder="Cari media atau tag" className="pl-9" />
                      </div>
                      <div className="max-h-[280px] space-y-2 overflow-auto pr-1">
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
                    </div>

                    <div className="rounded-xl border bg-background p-3">
                        <div className="mb-3 flex items-center justify-between gap-2">
                          <p className="text-sm font-medium">Simulasi & Fitur</p>
                          <Badge variant="secondary">{selectedCategoryMeta.title}</Badge>
                        </div>

                        {activeFeature ? (
                          <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                            <p className="font-medium">Fitur aktif terakhir</p>
                            <p className="mt-1">{activeFeature.name}</p>
                            <p className="mt-1 text-xs text-muted-foreground">{activeFeature.summary}</p>
                          </div>
                        ) : null}

                        <div className="mt-3 grid gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              simulateFeatureBatch(
                                VIDEO_FEATURES.filter((feature) => feature.categoryId === selectedCategory),
                                `Semua fitur ${selectedCategoryMeta.title}`,
                              )
                            }
                          >
                            Simulasi kategori aktif
                          </Button>
                          <Button type="button" size="sm" variant="outline" onClick={() => simulateFeatureBatch(VIDEO_FEATURES, "Seluruh katalog fitur video")}>
                            Simulasi seluruh fitur
                          </Button>
                        </div>

                        <div className="mt-3 space-y-2">
                          {groupedFeatures.map(({ category, features }) => (
                            <div key={category.id} className="rounded-lg border p-3">
                              <div className="mb-2 flex items-center justify-between gap-2">
                                <p className="text-sm font-medium">{category.title}</p>
                                <Badge variant="outline">{features.length}</Badge>
                              </div>
                              <div className="space-y-2">
                                {features.map((feature) => (
                                  <button
                                    key={feature.id}
                                    type="button"
                                    className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs hover:border-primary/40"
                                    onClick={() => simulateFeature(feature)}
                                  >
                                    <span>{feature.name}</span>
                                    <Badge variant="outline">{feature.credits}</Badge>
                                  </button>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                  </div>
                </aside>
              </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
          <Card className="h-fit">
                <CardHeader>
                  <CardTitle>Feature Navigator</CardTitle>
                  <CardDescription>Pilih area kerja, cari fitur, lalu aktifkan simulasi penggunaan kredit.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-lg border p-3 text-xs text-muted-foreground">
                    <p className="font-medium text-foreground">Ringkasan Cakupan Fitur</p>
                    <div className="mt-2 space-y-1">
                      {categoryCoverage.map((item) => (
                        <p key={item.id}>
                          {item.title}: {item.total} fitur ({item.starter} starter, {item.advanced} advanced)
                        </p>
                      ))}
                    </div>
                  </div>
                </CardContent>
          </Card>

          <div className="space-y-4">
            <Card>
                  <CardHeader>
                    <CardTitle>Starter Paths</CardTitle>
                    <CardDescription>Shortcut tools untuk pemula yang ingin akses cepat ke tool dasar.</CardDescription>
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

          </div>
        </div>
    </div>
  );
}
