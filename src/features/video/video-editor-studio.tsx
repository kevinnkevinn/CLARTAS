"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
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

interface ToolSettingsSnapshot {
  intensity: number;
  mix: number;
  scale: number;
  rotation: number;
  blur: number;
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  volume: number;
  speed: number;
  transitionDuration: number;
  textValue: string;
  feather: number;
}

interface AppliedToolEntry {
  id: string;
  featureId: string;
  featureName: string;
  preset: ToolPreset;
  appliedAt: number;
  settings: ToolSettingsSnapshot;
}

type ToolPreset = "generic" | "speed" | "transform" | "color" | "effects" | "audio" | "text" | "transition" | "mask";

const DEFAULT_IMAGE_DURATION = 3;
const DEFAULT_SIM_CREDITS = 999_999;
const DEFAULT_CATEGORY: VideoFeatureCategoryId | "all" = "all";

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

function resolveToolPreset(feature: VideoFeatureDefinition): ToolPreset {
  const category = feature.categoryId.toLowerCase();
  const name = feature.name.toLowerCase();

  if (category.includes("speed") || name.includes("speed") || name.includes("slow") || name.includes("reverse")) {
    return "speed";
  }
  if (category.includes("transform") || name.includes("scale") || name.includes("rotation") || name.includes("crop")) {
    return "transform";
  }
  if (category.includes("color") || name.includes("lut") || name.includes("balance") || name.includes("curve")) {
    return "color";
  }
  if (category.includes("audio") || category.includes("music") || name.includes("voice") || name.includes("noise")) {
    return "audio";
  }
  if (category.includes("text") || category.includes("subtitle") || name.includes("caption") || name.includes("title")) {
    return "text";
  }
  if (category.includes("transition") || name.includes("transition") || name.includes("fade")) {
    return "transition";
  }
  if (category.includes("mask") || category.includes("tracking") || name.includes("mask") || name.includes("tracking")) {
    return "mask";
  }
  if (category.includes("effect") || category.includes("vfx") || name.includes("blur") || name.includes("glow")) {
    return "effects";
  }
  return "generic";
}

function normalizeToolName(name: string) {
  return name.trim().toLowerCase();
}

export function VideoEditorStudio() {
  const [clips, setClips] = useState<Clip[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState("9:16");
  const [outputUrl, setOutputUrl] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [playhead, setPlayhead] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<VideoFeatureCategoryId | "all">(DEFAULT_CATEGORY);
  const [catalogQuery, setCatalogQuery] = useState("");
  const [assetQuery, setAssetQuery] = useState("");
  const [simulatedCredits, setSimulatedCredits] = useState(DEFAULT_SIM_CREDITS);
  const [creditEvents, setCreditEvents] = useState<CreditEvent[]>([]);
  const [clipToolStacks, setClipToolStacks] = useState<Record<string, AppliedToolEntry[]>>({});
  const [activeFeatureId, setActiveFeatureId] = useState<string | null>(null);
  const [featureMessage, setFeatureMessage] = useState(
    "Mode editing aktif. Fokuskan alur: import, susun timeline, preview, lalu export.",
  );
  const [activeToolPreset, setActiveToolPreset] = useState<ToolPreset>("generic");
  const [toolEnabled, setToolEnabled] = useState(true);
  const [toolIntensity, setToolIntensity] = useState(55);
  const [toolMix, setToolMix] = useState(100);
  const [toolScale, setToolScale] = useState(100);
  const [toolRotation, setToolRotation] = useState(0);
  const [toolBlur, setToolBlur] = useState(0);
  const [toolBrightness, setToolBrightness] = useState(100);
  const [toolContrast, setToolContrast] = useState(100);
  const [toolSaturation, setToolSaturation] = useState(100);
  const [toolHue, setToolHue] = useState(0);
  const [toolVolume, setToolVolume] = useState(100);
  const [toolSpeed, setToolSpeed] = useState(1);
  const [toolTransitionDuration, setToolTransitionDuration] = useState(0.6);
  const [toolTextValue, setToolTextValue] = useState("Sample title");
  const [toolFeather, setToolFeather] = useState(0);
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
      if (selectedCategory !== "all" && feature.categoryId !== selectedCategory) return false;
      if (!query) return true;
      return `${feature.name} ${feature.categoryTitle} ${feature.summary}`.toLowerCase().includes(query);
    });
  }, [catalogQuery, selectedCategory]);

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

  const activeFeature = useMemo(
    () => VIDEO_FEATURES.find((feature) => feature.id === activeFeatureId) ?? null,
    [activeFeatureId],
  );
  const activeClipToolStack = useMemo(
    () => (active ? (clipToolStacks[active.id] ?? []) : []),
    [active, clipToolStacks],
  );

  const quickFeatures = useMemo(() => filteredFeatures.slice(0, 18), [filteredFeatures]);
  const showTextOverlay = toolEnabled && activeToolPreset === "text" && toolTextValue.trim().length > 0;

  const previewStyle = useMemo<CSSProperties>(() => {
    if (!toolEnabled) return {};

    const intensityBlend = toolIntensity / 100;
    const blurPx = (toolBlur * intensityBlend) / 10;
    const filter = [
      `brightness(${toolBrightness}%)`,
      `contrast(${toolContrast}%)`,
      `saturate(${toolSaturation}%)`,
      `hue-rotate(${toolHue}deg)`,
      `blur(${blurPx.toFixed(2)}px)`,
    ].join(" ");

    return {
      filter,
      transform: `scale(${(toolScale / 100).toFixed(3)}) rotate(${toolRotation}deg)`,
      opacity: Math.max(0.2, Math.min(1, toolMix / 100)),
      transition: `all ${toolTransitionDuration}s ease`,
    };
  }, [
    toolEnabled,
    toolIntensity,
    toolBlur,
    toolBrightness,
    toolContrast,
    toolSaturation,
    toolHue,
    toolScale,
    toolRotation,
    toolMix,
    toolTransitionDuration,
  ]);

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

  useEffect(() => {
    const volume = Math.max(0, Math.min(1, toolVolume / 100));
    if (videoRef.current) videoRef.current.volume = volume;
    if (audioRef.current) audioRef.current.volume = volume;
  }, [toolVolume]);

  useEffect(() => {
    if (activeToolPreset !== "speed" || !active) return;
    setClips((prev) => prev.map((clip) => (clip.id === active.id ? { ...clip, speed: toolSpeed } : clip)));
  }, [activeToolPreset, active?.id, toolSpeed]);

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
      activateTool(importFeature, `Import ${files.length} file berhasil masuk ke media pool.`);
    }
  }

  function simulateFeature(feature: VideoFeatureDefinition, customMessage?: string) {
    if (simulatedCredits < feature.credits) {
      setFeatureMessage(`Kredit tool tidak cukup untuk ${feature.name}. Silakan isi ulang kredit.`);
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
    setFeatureMessage(customMessage ?? `${feature.name} dijalankan. Kredit berkurang ${feature.credits}.`);

    if (feature.name === "Split clip") {
      splitClip();
    }
    if (feature.name === "Trim clip") {
      setFeatureMessage("Trim clip aktif. Gunakan slider trim di panel preview.");
    }
    if (feature.name === "Timeline markers") {
      setFeatureMessage(`Marker dipasang di ${formatTime(playhead)}.`);
    }
  }

  function activateTool(feature: VideoFeatureDefinition, customMessage?: string) {
    setActiveToolPreset(resolveToolPreset(feature));
    setToolEnabled(true);
    simulateFeature(feature, customMessage);
  }

  function runTool(feature: VideoFeatureDefinition) {
    const name = normalizeToolName(feature.name);
    activateTool(feature);

    if (name.includes("import video")) {
      triggerImport("video");
      setFeatureMessage("Tool Import video dibuka. Pilih file video untuk dimasukkan.");
      return;
    }
    if (name.includes("import audio")) {
      triggerImport("audio");
      setFeatureMessage("Tool Import audio dibuka. Pilih file audio untuk dimasukkan.");
      return;
    }
    if (name.includes("import gambar") || name.includes("import image") || name.includes("import gif")) {
      triggerImport("image");
      setFeatureMessage("Tool Import gambar dibuka. Pilih gambar/GIF untuk dimasukkan.");
      return;
    }
    if (name.includes("split clip")) {
      splitClip();
      setFeatureMessage("Split clip dijalankan pada posisi playhead saat ini.");
      return;
    }
    if (name.includes("trim clip")) {
      setFocusedStep("polish");
      setFeatureMessage("Trim clip aktif. Atur Trim start dan Trim end di panel Inspector.");
      return;
    }
    if (name.includes("speed up")) {
      setToolSpeed(1.5);
      if (active) setClips((prev) => prev.map((clip) => (clip.id === active.id ? { ...clip, speed: 1.5 } : clip)));
      setFeatureMessage("Speed up diterapkan ke clip aktif.");
      return;
    }
    if (name.includes("slow motion")) {
      setToolSpeed(0.6);
      if (active) setClips((prev) => prev.map((clip) => (clip.id === active.id ? { ...clip, speed: 0.6 } : clip)));
      setFeatureMessage("Slow motion diterapkan ke clip aktif.");
      return;
    }
    if (name.includes("reverse")) {
      setToolRotation((prev) => (prev === 0 ? 180 : 0));
      setFeatureMessage("Reverse visual dipakai sebagai preview (rotasi 180deg). ");
      return;
    }
    if (name.includes("fade") || name.includes("dissolve") || name.includes("transition")) {
      setToolMix(70);
      setToolTransitionDuration(1);
      setFeatureMessage("Transition dijalankan. Atur mix dan durasi untuk menyesuaikan hasil.");
      return;
    }
    if (name.includes("brightness")) {
      setToolBrightness(125);
      setFeatureMessage("Brightness dinaikkan ke 125%.");
      return;
    }
    if (name.includes("contrast")) {
      setToolContrast(130);
      setFeatureMessage("Contrast dinaikkan ke 130%.");
      return;
    }
    if (name.includes("saturation")) {
      setToolSaturation(140);
      setFeatureMessage("Saturation dinaikkan ke 140%.");
      return;
    }
    if (name.includes("blur")) {
      setToolBlur(14);
      setFeatureMessage("Blur diterapkan pada preview. Atur nilai blur untuk intensitas berbeda.");
      return;
    }
    if (name.includes("scale") || name.includes("zoom")) {
      setToolScale(112);
      setFeatureMessage("Scale/zoom diterapkan ke preview clip aktif.");
      return;
    }
    if (name.includes("rotation")) {
      setToolRotation(18);
      setFeatureMessage("Rotation diterapkan ke preview clip aktif.");
      return;
    }
    if (name.includes("subtitle") || name.includes("caption") || name.includes("text") || name.includes("title")) {
      setToolTextValue("Judul baru");
      setFeatureMessage("Tool text aktif. Edit isi teks pada Tool Editor untuk melihat overlay di preview.");
      return;
    }
    if (name.includes("voice") || name.includes("audio") || name.includes("noise")) {
      setToolVolume(85);
      setFeatureMessage("Tool audio aktif. Atur volume/speed audio pada Tool Editor.");
      return;
    }
    if (name.includes("mask") || name.includes("tracking")) {
      setToolFeather(35);
      setFeatureMessage("Tool mask/tracking aktif. Feather mask bisa diatur dari Tool Editor.");
      return;
    }
    if (name.includes("export")) {
      continueToExport();
      setFeatureMessage("Tool export dijalankan. Pilih format dan lanjut render.");
    }
  }

  function snapshotToolSettings(): ToolSettingsSnapshot {
    return {
      intensity: toolIntensity,
      mix: toolMix,
      scale: toolScale,
      rotation: toolRotation,
      blur: toolBlur,
      brightness: toolBrightness,
      contrast: toolContrast,
      saturation: toolSaturation,
      hue: toolHue,
      volume: toolVolume,
      speed: toolSpeed,
      transitionDuration: toolTransitionDuration,
      textValue: toolTextValue,
      feather: toolFeather,
    };
  }

  function applyToolSettings(snapshot: ToolSettingsSnapshot) {
    setToolIntensity(snapshot.intensity);
    setToolMix(snapshot.mix);
    setToolScale(snapshot.scale);
    setToolRotation(snapshot.rotation);
    setToolBlur(snapshot.blur);
    setToolBrightness(snapshot.brightness);
    setToolContrast(snapshot.contrast);
    setToolSaturation(snapshot.saturation);
    setToolHue(snapshot.hue);
    setToolVolume(snapshot.volume);
    setToolSpeed(snapshot.speed);
    setToolTransitionDuration(snapshot.transitionDuration);
    setToolTextValue(snapshot.textValue);
    setToolFeather(snapshot.feather);
  }

  function appendToolToActiveClipStack(feature: VideoFeatureDefinition) {
    if (!active) return;
    const entry: AppliedToolEntry = {
      id: crypto.randomUUID(),
      featureId: feature.id,
      featureName: feature.name,
      preset: activeToolPreset,
      appliedAt: Date.now(),
      settings: snapshotToolSettings(),
    };
    setClipToolStacks((prev) => {
      const current = prev[active.id] ?? [];
      return {
        ...prev,
        [active.id]: [entry, ...current].slice(0, 24),
      };
    });
  }

  function removeToolFromActiveClipStack(entryId: string) {
    if (!active) return;
    setClipToolStacks((prev) => {
      const current = prev[active.id] ?? [];
      return {
        ...prev,
        [active.id]: current.filter((entry) => entry.id !== entryId),
      };
    });
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
    selectedCategory === "all"
      ? null
      : (VIDEO_FEATURE_CATEGORIES.find((category) => category.id === selectedCategory) ?? VIDEO_FEATURE_CATEGORIES[0]);
  const selectedCategoryLabel = selectedCategoryMeta?.title ?? "Semua kategori";

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
                    Mulai dari import, susun clip, poles hasil, lalu export. Semua tools tersedia tanpa mode tambahan.
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
                    <Badge variant="outline">{selectedCategoryLabel}</Badge>
                  </div>
                  <div className="relative mb-3">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                    <Input value={catalogQuery} onChange={(event) => setCatalogQuery(event.target.value)} placeholder="Cari tool..." className="pl-9" />
                  </div>
                  <div className="space-y-2">
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className={cn(
                        "w-full rounded-lg border px-3 py-2 text-left text-sm transition",
                        selectedCategory === "all" ? "border-primary bg-primary/10" : "hover:border-primary/30",
                      )}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>Semua kategori</span>
                        <Badge variant="outline">{VIDEO_FEATURE_COUNT}</Badge>
                      </div>
                    </button>
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

                    <div className="relative overflow-hidden rounded-xl border bg-black/95">
                      {active ? (
                        activeIsVideo ? (
                          <video
                            ref={videoRef}
                            src={active.url}
                            controls
                            className="aspect-video w-full bg-black object-contain"
                            style={previewStyle}
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
                          <img src={active.url} alt={active.name} className="aspect-video w-full object-contain" style={previewStyle} />
                        )
                      ) : (
                        <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/70">
                          Pilih clip dari timeline atau media pool untuk memulai preview.
                        </div>
                      )}
                      {showTextOverlay ? (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                          <p className="w-fit rounded-lg bg-black/65 px-3 py-1.5 text-sm font-medium text-white shadow-lg">{toolTextValue}</p>
                        </div>
                      ) : null}
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

                    <div className="relative overflow-hidden rounded-xl border bg-black/95">
                      {outputUrl ? (
                        <video src={outputUrl} controls className="aspect-video w-full bg-black object-contain" style={previewStyle} />
                      ) : active ? (
                        activeIsAudio ? (
                          <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/70">
                            Preview sequence audio aktif. Lanjutkan ke export untuk melihat hasil akhir.
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={active.url} alt={`${active.name} preview`} className="aspect-video w-full object-contain" style={previewStyle} />
                        )
                      ) : (
                        <div className="flex aspect-video items-center justify-center p-6 text-center text-sm text-white/70">
                          Hasil sequence akan muncul di sini setelah Anda memilih clip atau melakukan export.
                        </div>
                      )}
                      {showTextOverlay ? (
                        <div className="pointer-events-none absolute inset-x-0 bottom-0 p-4">
                          <p className="w-fit rounded-lg bg-black/65 px-3 py-1.5 text-sm font-medium text-white shadow-lg">{toolTextValue}</p>
                        </div>
                      ) : null}
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
                    <p className="text-sm font-medium">Quick Tools</p>
                    <Badge variant="secondary">{selectedCategoryLabel}</Badge>
                  </div>

                  {activeFeature ? (
                    <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
                      <p className="font-medium">Fitur aktif terakhir</p>
                      <p className="mt-1">{activeFeature.name}</p>
                      <p className="mt-1 text-xs text-muted-foreground">{activeFeature.summary}</p>
                    </div>
                  ) : null}

                  <div className="mt-3 grid gap-2">
                    {quickFeatures.map((feature) => (
                      <button
                        key={feature.id}
                        type="button"
                        className="flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-xs hover:border-primary/40"
                        onClick={() => runTool(feature)}
                      >
                        <span className="truncate pr-2">{feature.name}</span>
                        <Badge variant="outline">{feature.credits}</Badge>
                      </button>
                    ))}
                    {!quickFeatures.length ? (
                      <p className="rounded-lg border border-dashed p-3 text-xs text-muted-foreground">
                        Tidak ada tool yang cocok dengan pencarian saat ini.
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-border/70 bg-background/95 shadow-[0_24px_60px_-40px_rgba(0,0,0,0.18)]">
        <CardHeader className="border-b bg-gradient-to-br from-muted/30 via-background to-muted/10">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <CardTitle className="text-xl">Tools Hub</CardTitle>
              <CardDescription>
                Layout tools gaya CapCut: pilih kategori cepat, cari tool, lalu klik untuk menjalankan tool.
              </CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">{filteredFeatures.length} ditampilkan</Badge>
              <Badge variant="outline">{VIDEO_FEATURE_COUNT} total</Badge>
              <Button type="button" size="sm" variant="outline" onClick={() => setCatalogQuery("")}>Reset pencarian</Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4 p-4 md:p-5">
          <div className="rounded-2xl border bg-gradient-to-br from-background via-background to-muted/25 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">Tool Editor (Nyata)</p>
                <p className="text-xs text-muted-foreground">
                  Klik tool mana pun untuk menjalankan aksi dan membuka kontrol langsung.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{activeFeature?.name ?? "Belum pilih tool"}</Badge>
                <label className="inline-flex items-center gap-2 rounded-full border px-2 py-1 text-xs">
                  <input type="checkbox" checked={toolEnabled} onChange={(event) => setToolEnabled(event.target.checked)} />
                  Tool aktif
                </label>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <div className="space-y-2">
                <Label>Intensity {toolIntensity}%</Label>
                <input type="range" min={0} max={100} step={1} value={toolIntensity} className="w-full" onChange={(event) => setToolIntensity(Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Mix {toolMix}%</Label>
                <input type="range" min={10} max={100} step={1} value={toolMix} className="w-full" onChange={(event) => setToolMix(Number(event.target.value))} />
              </div>
              <div className="space-y-2">
                <Label>Durasi efek {toolTransitionDuration.toFixed(1)}s</Label>
                <input type="range" min={0.1} max={2} step={0.1} value={toolTransitionDuration} className="w-full" onChange={(event) => setToolTransitionDuration(Number(event.target.value))} />
              </div>

              {(activeToolPreset === "transform" || activeToolPreset === "effects" || activeToolPreset === "generic") ? (
                <>
                  <div className="space-y-2">
                    <Label>Scale {toolScale}%</Label>
                    <input type="range" min={50} max={150} step={1} value={toolScale} className="w-full" onChange={(event) => setToolScale(Number(event.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Rotation {toolRotation}deg</Label>
                    <input type="range" min={-180} max={180} step={1} value={toolRotation} className="w-full" onChange={(event) => setToolRotation(Number(event.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Blur {toolBlur}</Label>
                    <input type="range" min={0} max={30} step={1} value={toolBlur} className="w-full" onChange={(event) => setToolBlur(Number(event.target.value))} />
                  </div>
                </>
              ) : null}

              {(activeToolPreset === "color" || activeToolPreset === "effects" || activeToolPreset === "generic") ? (
                <>
                  <div className="space-y-2">
                    <Label>Brightness {toolBrightness}%</Label>
                    <input type="range" min={50} max={160} step={1} value={toolBrightness} className="w-full" onChange={(event) => setToolBrightness(Number(event.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Contrast {toolContrast}%</Label>
                    <input type="range" min={50} max={170} step={1} value={toolContrast} className="w-full" onChange={(event) => setToolContrast(Number(event.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Saturation {toolSaturation}%</Label>
                    <input type="range" min={0} max={200} step={1} value={toolSaturation} className="w-full" onChange={(event) => setToolSaturation(Number(event.target.value))} />
                  </div>
                  <div className="space-y-2 md:col-span-2 xl:col-span-1">
                    <Label>Hue {toolHue}deg</Label>
                    <input type="range" min={-180} max={180} step={1} value={toolHue} className="w-full" onChange={(event) => setToolHue(Number(event.target.value))} />
                  </div>
                </>
              ) : null}

              {activeToolPreset === "audio" ? (
                <>
                  <div className="space-y-2">
                    <Label>Volume {toolVolume}%</Label>
                    <input type="range" min={0} max={100} step={1} value={toolVolume} className="w-full" onChange={(event) => setToolVolume(Number(event.target.value))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Audio speed {toolSpeed.toFixed(2)}x</Label>
                    <input type="range" min={0.5} max={2} step={0.05} value={toolSpeed} className="w-full" onChange={(event) => setToolSpeed(Number(event.target.value))} />
                  </div>
                </>
              ) : null}

              {activeToolPreset === "speed" ? (
                <div className="space-y-2">
                  <Label>Playback speed {toolSpeed.toFixed(2)}x</Label>
                  <input type="range" min={0.25} max={3} step={0.05} value={toolSpeed} className="w-full" onChange={(event) => setToolSpeed(Number(event.target.value))} />
                </div>
              ) : null}

              {(activeToolPreset === "mask" || activeToolPreset === "transition") ? (
                <div className="space-y-2">
                  <Label>Feather {toolFeather}%</Label>
                  <input type="range" min={0} max={100} step={1} value={toolFeather} className="w-full" onChange={(event) => setToolFeather(Number(event.target.value))} />
                </div>
              ) : null}

              {activeToolPreset === "text" ? (
                <div className="space-y-2 md:col-span-2 xl:col-span-3">
                  <Label>Isi teks judul/caption</Label>
                  <Input value={toolTextValue} onChange={(event) => setToolTextValue(event.target.value)} placeholder="Ketik teks overlay..." />
                </div>
              ) : null}
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (!activeFeature) {
                    setFeatureMessage("Pilih satu tool dulu untuk diterapkan.");
                    return;
                  }
                  if (!active) {
                    setFeatureMessage(`Tool ${activeFeature.name} siap. Pilih clip aktif agar perubahan ditempelkan ke timeline.`);
                    return;
                  }
                  if (activeToolPreset === "speed" || activeToolPreset === "audio") {
                    setClips((prev) => prev.map((clip) => (clip.id === active.id ? { ...clip, speed: toolSpeed } : clip)));
                  }
                  appendToolToActiveClipStack(activeFeature);
                  setFeatureMessage(`${activeFeature.name} diterapkan ke ${active.name} dengan intensity ${toolIntensity}% dan mix ${toolMix}%.`);
                }}
              >
                Terapkan ke clip aktif
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  setToolIntensity(55);
                  setToolMix(100);
                  setToolScale(100);
                  setToolRotation(0);
                  setToolBlur(0);
                  setToolBrightness(100);
                  setToolContrast(100);
                  setToolSaturation(100);
                  setToolHue(0);
                  setToolVolume(100);
                  setToolSpeed(1);
                  setToolTransitionDuration(0.6);
                  setToolFeather(0);
                  setFeatureMessage("Parameter tool direset ke default.");
                }}
              >
                Reset parameter
              </Button>
              <Badge variant="secondary">Preset: {activeToolPreset}</Badge>
            </div>

            {active ? (
              <div className="mt-4 rounded-xl border bg-background/70 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">Effect Stack • {active.name}</p>
                  <Badge variant="outline">{activeClipToolStack.length}</Badge>
                </div>

                {activeClipToolStack.length ? (
                  <div className="max-h-44 space-y-2 overflow-auto pr-1">
                    {activeClipToolStack.map((entry) => (
                      <div key={entry.id} className="rounded-lg border p-2">
                        <div className="flex items-center justify-between gap-2">
                          <div>
                            <p className="text-xs font-medium">{entry.featureName}</p>
                            <p className="text-[11px] text-muted-foreground">{entry.preset} • {new Date(entry.appliedAt).toLocaleTimeString("id-ID")}</p>
                          </div>
                          <div className="flex items-center gap-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => {
                                setActiveToolPreset(entry.preset);
                                applyToolSettings(entry.settings);
                                setFeatureMessage(`${entry.featureName} dimuat ulang dari effect stack.`);
                              }}
                            >
                              Pakai
                            </Button>
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-[11px]"
                              onClick={() => removeToolFromActiveClipStack(entry.id)}
                            >
                              Hapus
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Belum ada tool yang diterapkan ke clip ini.</p>
                )}
              </div>
            ) : null}
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={catalogQuery}
                onChange={(event) => setCatalogQuery(event.target.value)}
                placeholder="Cari semua tools video..."
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline">Klik tool untuk jalankan</Badge>
            </div>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedCategory("all")}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm transition",
                selectedCategory === "all" ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/40",
              )}
            >
              Semua ({VIDEO_FEATURE_COUNT})
            </button>
            {VIDEO_FEATURE_CATEGORIES.map((category) => {
              const count = VIDEO_FEATURES.filter((feature) => feature.categoryId === category.id).length;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "shrink-0 rounded-full border px-3 py-1.5 text-sm transition",
                    selectedCategory === category.id ? "border-primary bg-primary/10 text-primary" : "hover:border-primary/40",
                  )}
                >
                  {category.title} ({count})
                </button>
              );
            })}
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {groupedFeatures.map(({ category, features }) => (
              <section
                key={category.id}
                className="rounded-2xl border bg-gradient-to-b from-background to-muted/20 p-4 shadow-[0_10px_28px_-24px_rgba(0,0,0,0.45)]"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold tracking-tight">{category.title}</p>
                    <p className="text-xs text-muted-foreground">{category.summary}</p>
                  </div>
                  <Badge variant="secondary">{features.length}</Badge>
                </div>

                <div className="flex flex-wrap gap-2">
                  {features.map((feature) => (
                    <button
                      key={feature.id}
                      type="button"
                      onClick={() => runTool(feature)}
                      className="inline-flex items-center gap-2 rounded-full border bg-background px-3 py-1.5 text-xs transition hover:border-primary/50 hover:bg-primary/5"
                    >
                      <span>{feature.name}</span>
                      <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px]">{feature.credits}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}

            {!groupedFeatures.length ? (
              <div className="col-span-full rounded-2xl border border-dashed p-8 text-center text-sm text-muted-foreground">
                Tidak ada tools yang cocok. Ubah kata kunci pencarian atau pilih kategori lain.
              </div>
            ) : null}
          </div>

          <div className="rounded-xl border bg-muted/20 p-3 text-xs text-muted-foreground">
            Tips: klik nama tool untuk menjalankan aksi nyata. Tool Editor di atas menampilkan parameter yang bisa Anda ubah live.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
