"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Upload,
  Play,
  Loader2,
  Download,
  History as HistoryIcon,
  ImageOff,
  AlertCircle,
  Coins,
} from "lucide-react";
import { EDITOR_TOOLS, getToolById, TOOL_CATEGORIES, type EditorTool } from "./tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { env } from "@/lib/env";
import { pollAIJob } from "@/lib/ai/poll-job";
import { useLiteMode } from "@/lib/lite-mode/context";
import { LITE_EDITOR_TOOL_IDS } from "@/lib/lite-mode/config";
import { uploadMediaFile } from "@/lib/upload-client";
import { runClientAI, playTextToSpeech, type ClientAIAction } from "@/features/lab/client-ai";
import { addDemoAssetFromUrl } from "@/features/demo/local-assets";
import { ImageAdjustments } from "./image-adjustments";
import { ObjectCleanupBrush } from "./object-cleanup-brush";
import { VideoToolsPanel } from "./video-tools-panel";

interface HistoryEntry {
  tool: string;
  at: number;
  output: Record<string, unknown>;
  mock: boolean;
}

interface EditorStudioProps {
  initialTool?: string;
  credits: number;
}

export function EditorStudio({ initialTool, credits }: EditorStudioProps) {
  const t = useTranslations("editor");
  const tt = useTranslations("editor.tool");
  const tf = useTranslations("editor.fields");
  const tCredits = useTranslations("credits");
  const { lite } = useLiteMode();

  const [tool, setTool] = useState<EditorTool>(getToolById(initialTool));
  const [uploading, setUploading] = useState(false);
  const [running, setRunning] = useState(false);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [inputKind, setInputKind] = useState<"image" | "video" | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<HistoryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [maskUrl, setMaskUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<string>("basic");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const pending = sessionStorage.getItem("clartas-pending-image");
    if (pending && !inputUrl) {
      setInputUrl(pending);
      setInputKind("image");
    }
  }, [inputUrl]);

  const filteredTools = useMemo(() => {
    const inCategory = EDITOR_TOOLS.filter((toolItem) => toolItem.category === category);
    if (!lite) return inCategory;
    return inCategory.filter((toolItem) => LITE_EDITOR_TOOL_IDS.has(toolItem.id));
  }, [category, lite]);

  const displayUrl = previewUrl ?? inputUrl;
  const onAdjustPreview = useCallback((url: string) => setPreviewUrl(url), []);

  const needsImage = tool.inputType === "image" || tool.inputType === "images";
  const setField = (k: string, v: string) => setFields((p) => ({ ...p, [k]: v }));

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const result = await uploadMediaFile(file);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setInputUrl(result.data.signedUrl);
      setInputKind(result.data.kind);
      setAssetId(result.data.assetId ?? null);
      setPreviewUrl(null);
    } catch {
      setError("upload_failed");
    } finally {
      setUploading(false);
    }
  }

  function handleFileDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void handleUpload(file);
  }

  function buildPayload(): Record<string, unknown> {
    switch (tool.action) {
      case "generate-copy":
        return {
          productName: fields.productName || (fields.text ?? "").slice(0, 200) || "Product",
          details: fields.text ?? "",
          keywords: fields.keywords || undefined,
          marketplace: fields.marketplace || undefined,
          tone: fields.tone || undefined,
          language: fields.language || "en",
          type: (fields.copyType as string) || "description",
        };
      case "object-cleanup":
        return {
          imageUrl: inputUrl ?? undefined,
          assetId: assetId ?? undefined,
          maskUrl: maskUrl ?? undefined,
          prompt: fields.prompt || undefined,
        };
      case "text-to-speech":
        return { text: fields.text ?? "", voice: fields.voice || "default" };
      case "video-slideshow":
        return {
          imageUrls: inputUrl ? [inputUrl] : [],
          aspectRatio: (fields.aspectRatio as string) || "9:16",
        };
      default: {
        let scene = fields.scene || undefined;
        if (tool.id === "lifestyle-scene") scene = "lifestyle";
        if (tool.id === "outdoor-scene") scene = "outdoor";
        return {
          imageUrl: inputUrl ?? undefined,
          assetId: assetId ?? undefined,
          prompt: fields.prompt || scene || undefined,
          scene,
          scale: Number(fields.scale) || 2,
          count: Number(fields.count) || 12,
          type: (fields.copyType as string) || "description",
          productName: fields.productName,
          keywords: fields.keywords,
          marketplace: fields.marketplace,
          tone: fields.tone,
          language: fields.language,
          text: fields.text,
          voice: fields.voice,
        };
      }
    }
  }

  async function handleRun() {
    if (!tool.action) {
      setOutput({
        tool: tool.id,
        at: Date.now(),
        output: { imageUrl: displayUrl },
        mock: false,
      });
      return;
    }
    setError(null);
    setRunning(true);
    try {
      const payload = buildPayload();

      if (env.demoMode || tool.clientOnly) {
        const result = await runClientAI(tool.action as ClientAIAction, payload);
        const entry: HistoryEntry = {
          tool: tool.id,
          at: Date.now(),
          output: result.output,
          mock: false,
        };
        setOutput(entry);
        setHistory((h) => [entry, ...h].slice(0, 10));
        const img =
          typeof result.output.imageUrl === "string" ? result.output.imageUrl : null;
        if (img) addDemoAssetFromUrl(img, `${tool.id}-${Date.now()}.png`);
        if (typeof result.output.videoUrl === "string") {
          addDemoAssetFromUrl(result.output.videoUrl as string, `video-${Date.now()}.webm`, "video");
        }
        return;
      }

      const res = await fetch(`/api/ai/${tool.action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      let data = await res.json();
      if (res.status === 202 && data.pollUrl) {
        const polled = await pollAIJob(data.pollUrl as string);
        data = { ...data, output: polled.output, mock: polled.mock };
      }
      if (res.status === 402) {
        setError(
          tCredits("insufficientMessage", {
            required: data.required,
            available: data.available,
          }),
        );
        return;
      }
      if (!res.ok && res.status !== 202) {
        setError(data.error ?? "processing_failed");
        return;
      }
      const entry: HistoryEntry = {
        tool: tool.id,
        at: Date.now(),
        output: data.output ?? {},
        mock: Boolean(data.mock),
      };
      setOutput(entry);
      setHistory((h) => [entry, ...h].slice(0, 10));
    } catch {
      setError("processing_failed");
    } finally {
      setRunning(false);
    }
  }

  const outputImage = useMemo(() => {
    const o = output?.output as { imageUrl?: string } | undefined;
    return o?.imageUrl ?? null;
  }, [output]);
  const outputVideo = useMemo(() => {
    const o = output?.output as { videoUrl?: string } | undefined;
    return o?.videoUrl ?? null;
  }, [output]);
  const outputImages = useMemo(() => {
    const o = output?.output as { imageUrls?: string[] } | undefined;
    return o?.imageUrls ?? null;
  }, [output]);
  const outputText = useMemo(() => {
    const o = output?.output as { text?: string } | undefined;
    return o?.text ?? null;
  }, [output]);

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr_300px]">
      {/* Tool sidebar */}
      <div className="glass-panel space-y-1 rounded-xl p-2 glow-ring-sm">
        <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
          {t("tools")}
        </p>
        <div className="flex flex-wrap gap-1 px-1 pb-1">
          {TOOL_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setCategory(cat.id)}
              className={cn(
                "rounded px-2 py-0.5 text-[10px] font-medium",
                category === cat.id
                  ? "bg-primary/20 text-primary"
                  : "bg-muted/60 text-muted-foreground",
              )}
            >
              {t(`category.${cat.labelKey}`)}
            </button>
          ))}
        </div>
        {filteredTools.map((tool_) => {
          const Icon = tool_.icon;
          const active = tool_.id === tool.id;
          return (
            <button
              key={tool_.id}
              onClick={() => {
                setTool(tool_);
                setOutput(null);
                setError(null);
                setPreviewUrl(null);
                setMaskUrl(null);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                active
                  ? "bg-primary/20 text-primary glow-ring-sm"
                  : "text-muted-foreground hover:bg-accent/60",
              )}
            >
              <Icon className="size-4" />
              <span className="truncate">{tt(`${tool_.i18nKey}.name`)}</span>
            </button>
          );
        })}
      </div>

      {/* Canvas / preview */}
      <div className="space-y-4">
        <div className="glass-panel rounded-xl p-4">
          <h2 className="text-lg font-semibold">{tt(`${tool.i18nKey}.name`)}</h2>
          <p className="text-sm text-muted-foreground">{tt(`${tool.i18nKey}.description`)}</p>
        </div>

        {needsImage ? (
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleFileDrop}
            className={cn(
              "upload-zone flex min-h-[220px] cursor-pointer flex-col items-center justify-center p-6 text-center",
              dragOver && "drag-over",
            )}
          >
            {inputUrl ? (
              inputKind === "video" ? (
                <video
                  src={displayUrl ?? inputUrl}
                  controls
                  className="max-h-64 rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={displayUrl ?? inputUrl} alt="input" className="max-h-64 rounded-lg object-contain" />
              )
            ) : (
              <>
                <Upload className="mb-2 size-8 text-primary/70" />
                <p className="text-sm font-medium">{t("dragDrop")}</p>
                <p className="mt-1 text-xs text-muted-foreground">{t("uploadFormats")}</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleUpload(f);
                e.target.value = "";
              }}
            />
            {uploading ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> {t("processing")}
              </p>
            ) : null}
          </div>
        ) : null}

        {(tool.id === "crop-resize" || tool.id === "adjustments") && inputUrl ? (
          <ImageAdjustments imageUrl={inputUrl} onPreview={onAdjustPreview} />
        ) : null}

        {tool.id === "object-cleanup" && inputUrl ? (
          <ObjectCleanupBrush imageUrl={inputUrl} onMaskReady={setMaskUrl} />
        ) : null}

        {tool.id === "video-slideshow" ? <VideoToolsPanel /> : null}

        {/* Output */}
        <div className="glass-panel rounded-xl p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold">{t("output")}</h3>
            {output ? (
              <div className="flex gap-2">
                {outputImage ? (
                  <a
                    href={outputImage}
                    download
                    className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
                  >
                    <Download className="size-3.5" /> {t("saveToLibrary")}
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>

          {error ? (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{t.has(`errors.${error}`) ? t(`errors.${error}`) : error}</span>
            </div>
          ) : output ? (
            <div className="space-y-2">
              {output.mock ? (
                <p className="rounded bg-amber-500/15 px-2 py-1 text-xs text-amber-300">
                  Mock result
                </p>
              ) : null}
              {outputImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={outputImage} alt="output" className="max-h-72 rounded-lg" />
              ) : null}
              {outputImages?.length ? (
                <div className="grid grid-cols-3 gap-2">
                  {outputImages.map((url, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={url} alt={`var-${i}`} className="rounded border" />
                  ))}
                </div>
              ) : null}
              {outputVideo ? (
                <video src={outputVideo} controls className="max-h-72 w-full rounded-lg" />
              ) : null}
              {outputText ? (
                <div className="space-y-2">
                  <p className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">{outputText}</p>
                  {tool.action === "text-to-speech" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => playTextToSpeech(outputText, fields.voice)}
                    >
                      <Play className="mr-1 size-3" /> Play voice
                    </Button>
                  ) : null}
                </div>
              ) : null}
              {!outputImage && !outputText && !outputVideo && !outputImages?.length ? (
                <pre className="overflow-auto rounded-lg bg-muted p-3 text-xs">
                  {JSON.stringify(output.output, null, 2)}
                </pre>
              ) : null}
            </div>
          ) : (
            <div className="flex min-h-[120px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <ImageOff className="mb-2 size-6" />
              {t("noOutput")}
            </div>
          )}
        </div>
      </div>

      {/* Settings + history */}
      <div className="space-y-4">
        <div className="glass-panel rounded-xl p-4 glow-ring-sm">
          <h3 className="mb-3 text-sm font-semibold">{t("settings")}</h3>
          <div className="space-y-3">
            {tool.fields.includes("prompt") ? (
              <div className="space-y-1.5">
                <Label>{tf("prompt")}</Label>
                <Textarea
                  rows={3}
                  placeholder={tf("promptPlaceholder")}
                  value={fields.prompt ?? ""}
                  onChange={(e) => setField("prompt", e.target.value)}
                />
              </div>
            ) : null}
            {tool.fields.includes("scene") ? (
              <div className="space-y-1.5">
                <Label>{tf("scene")}</Label>
                <Select
                  value={fields.scene ?? "studio"}
                  onChange={(e) => setField("scene", e.target.value)}
                >
                  <option value="studio">Studio Photography</option>
                  <option value="luxury">Luxury Concept</option>
                  <option value="lifestyle">Lifestyle Aesthetics</option>
                  <option value="outdoor">Outdoor Nature</option>
                  <option value="interior">Home Interior</option>
                  <option value="board">Professional Board Advertisement</option>
                </Select>
              </div>
            ) : null}
            {tool.fields.includes("count") ? (
              <div className="space-y-1.5">
                <Label>Jumlah variasi (max 50)</Label>
                <Input
                  type="number"
                  min={1}
                  max={50}
                  value={fields.count ?? "12"}
                  onChange={(e) => setField("count", e.target.value)}
                />
              </div>
            ) : null}
            {tool.fields.includes("scale") ? (
              <div className="space-y-1.5">
                <Label>Upscale (2-4x)</Label>
                <Input
                  type="number"
                  min={2}
                  max={4}
                  value={fields.scale ?? "2"}
                  onChange={(e) => setField("scale", e.target.value)}
                />
              </div>
            ) : null}
            {tool.id === "caption-generator" ? (
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    "title",
                    "description",
                    "caption",
                    "keywords",
                    "script",
                    "seo",
                    "facebook_ads",
                    "google_ads",
                    "tiktok_ads",
                    "instagram_ads",
                    "hashtag",
                    "cta",
                  ] as const
                ).map((ct) => (
                  <Button
                    key={ct}
                    type="button"
                    size="sm"
                    variant={fields.copyType === ct ? "default" : "outline"}
                    className="h-7 text-xs"
                    onClick={() => setField("copyType", ct)}
                  >
                    {tf(`copyType.${ct}`)}
                  </Button>
                ))}
              </div>
            ) : null}
            {tool.fields.includes("productName") ? (
              <div className="space-y-1.5">
                <Label>{tf("productName")}</Label>
                <Input
                  value={fields.productName ?? ""}
                  onChange={(e) => setField("productName", e.target.value)}
                />
              </div>
            ) : null}
            {tool.fields.includes("text") ? (
              <div className="space-y-1.5">
                <Label>{tf("text")}</Label>
                <Textarea
                  rows={4}
                  value={fields.text ?? ""}
                  onChange={(e) => setField("text", e.target.value)}
                />
              </div>
            ) : null}
            {tool.fields.includes("keywords") ? (
              <div className="space-y-1.5">
                <Label>{tf("keywords")}</Label>
                <Input
                  placeholder={tf("keywordsPlaceholder")}
                  value={fields.keywords ?? ""}
                  onChange={(e) => setField("keywords", e.target.value)}
                />
              </div>
            ) : null}
            {tool.fields.includes("marketplace") ? (
              <div className="space-y-1.5">
                <Label>{tf("marketplace")}</Label>
                <Select
                  value={fields.marketplace ?? "general"}
                  onChange={(e) => setField("marketplace", e.target.value)}
                >
                  <option value="general">{tf("marketplaceGeneral")}</option>
                  <option value="shopee">Shopee</option>
                  <option value="tokopedia">Tokopedia</option>
                  <option value="amazon">Amazon</option>
                  <option value="tiktok">TikTok Shop</option>
                </Select>
              </div>
            ) : null}
            {tool.fields.includes("tone") ? (
              <div className="space-y-1.5">
                <Label>{tf("tone")}</Label>
                <Input
                  value={fields.tone ?? ""}
                  onChange={(e) => setField("tone", e.target.value)}
                />
              </div>
            ) : null}
            {tool.fields.includes("language") ? (
              <div className="space-y-1.5">
                <Label>{tf("language")}</Label>
                <Select
                  value={fields.language ?? "en"}
                  onChange={(e) => setField("language", e.target.value)}
                >
                  <option value="en">English</option>
                  <option value="id">Bahasa Indonesia</option>
                  <option value="zh">中文</option>
                  <option value="es">Español</option>
                </Select>
              </div>
            ) : null}
            {tool.fields.includes("aspectRatio") ? (
              <div className="space-y-1.5">
                <Label>{tf("aspectRatio")}</Label>
                <Select
                  value={fields.aspectRatio ?? "9:16"}
                  onChange={(e) => setField("aspectRatio", e.target.value)}
                >
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                  <option value="16:9">16:9</option>
                </Select>
              </div>
            ) : null}
            {tool.fields.includes("voice") ? (
              <div className="space-y-1.5">
                <Label>{tf("voice")}</Label>
                <Select
                  value={fields.voice ?? "default"}
                  onChange={(e) => setField("voice", e.target.value)}
                >
                  <option value="default">Default</option>
                  <option value="warm">Warm</option>
                  <option value="energetic">Energetic</option>
                </Select>
              </div>
            ) : null}

            <div className="flex items-center justify-between rounded-lg bg-muted px-3 py-2 text-sm">
              <span className="flex items-center gap-1.5 text-muted-foreground">
                <Coins className="size-4 text-amber-500" />
                {t("creditCost", { count: tool.cost })}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {tCredits("balance")}: {credits}
              </span>
            </div>

            <Button
              className="w-full"
              onClick={handleRun}
              disabled={running || uploading || (needsImage && !inputUrl)}
            >
              {running ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> {t("processing")}
                </>
              ) : (
                <>
                  <Play className="size-4" /> {t("run")}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* History */}
        <div className="glass-panel rounded-xl p-4">
          <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
            <HistoryIcon className="size-4" /> {t("history")}
          </h3>
          {history.length === 0 ? (
            <p className="text-xs text-muted-foreground">{t("noHistory")}</p>
          ) : (
            <ul className="space-y-2">
              {history.map((h) => (
                <li
                  key={h.at}
                  className="flex items-center justify-between rounded-md border px-2 py-1.5 text-xs"
                >
                  <span className="font-medium">{tt(`${getToolById(h.tool).i18nKey}.name`)}</span>
                  <span className="text-muted-foreground">
                    {new Date(h.at).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
