"use client";

import { useMemo, useRef, useState } from "react";
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
import { EDITOR_TOOLS, getToolById, type EditorTool } from "./tools";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

  const [tool, setTool] = useState<EditorTool>(getToolById(initialTool));
  const [uploading, setUploading] = useState(false);
  const [running, setRunning] = useState(false);
  const [inputUrl, setInputUrl] = useState<string | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [output, setOutput] = useState<HistoryEntry | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const needsImage = tool.inputType === "image" || tool.inputType === "images";
  const setField = (k: string, v: string) => setFields((p) => ({ ...p, [k]: v }));

  async function handleUpload(file: File) {
    setError(null);
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "upload_failed");
        return;
      }
      setInputUrl(data.signedUrl);
      setAssetId(data.asset?.id ?? null);
    } catch {
      setError("upload_failed");
    } finally {
      setUploading(false);
    }
  }

  function buildPayload(): Record<string, unknown> {
    switch (tool.action) {
      case "generate-copy":
        return {
          productName: (fields.text ?? "").slice(0, 200) || "Product",
          details: fields.text ?? "",
          tone: fields.tone || undefined,
          language: fields.language || "en",
          type: "description",
        };
      case "text-to-speech":
        return { text: fields.text ?? "", voice: fields.voice || "default" };
      case "video-slideshow":
        return {
          imageUrls: inputUrl ? [inputUrl] : [],
          aspectRatio: (fields.aspectRatio as string) || "9:16",
        };
      default:
        return {
          imageUrl: inputUrl ?? undefined,
          assetId: assetId ?? undefined,
          prompt: fields.prompt || undefined,
          scene: fields.scene || undefined,
        };
    }
  }

  async function handleRun() {
    if (!tool.action) {
      // Local-only tool (crop/resize) — nothing to call.
      setOutput({ tool: tool.id, at: Date.now(), output: { imageUrl: inputUrl }, mock: true });
      return;
    }
    setError(null);
    setRunning(true);
    try {
      const res = await fetch(`/api/ai/${tool.action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await res.json();
      if (res.status === 402) {
        setError(
          tCredits("insufficientMessage", {
            required: data.required,
            available: data.available,
          }),
        );
        return;
      }
      if (!res.ok) {
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
  const outputText = useMemo(() => {
    const o = output?.output as { text?: string } | undefined;
    return o?.text ?? null;
  }, [output]);

  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr_300px]">
      {/* Tool sidebar */}
      <div className="space-y-1 rounded-xl border bg-card p-2">
        <p className="px-2 py-1 text-xs font-semibold uppercase text-muted-foreground">
          {t("tools")}
        </p>
        {EDITOR_TOOLS.map((tool_) => {
          const Icon = tool_.icon;
          const active = tool_.id === tool.id;
          return (
            <button
              key={tool_.id}
              onClick={() => {
                setTool(tool_);
                setOutput(null);
                setError(null);
              }}
              className={cn(
                "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-medium transition-colors",
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent",
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
        <div className="rounded-xl border bg-card p-4">
          <h2 className="text-lg font-semibold">{tt(`${tool.i18nKey}.name`)}</h2>
          <p className="text-sm text-muted-foreground">{tt(`${tool.i18nKey}.description`)}</p>
        </div>

        {needsImage ? (
          <div
            onClick={() => fileRef.current?.click()}
            className="flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed bg-card p-6 text-center transition-colors hover:border-primary"
          >
            {inputUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={inputUrl} alt="input" className="max-h-64 rounded-lg object-contain" />
            ) : (
              <>
                <Upload className="mb-2 size-8 text-muted-foreground" />
                <p className="text-sm font-medium">{t("dragDrop")}</p>
              </>
            )}
            <input
              ref={fileRef}
              type="file"
              accept="image/*,video/*"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleUpload(f);
              }}
            />
            {uploading ? (
              <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                <Loader2 className="size-3 animate-spin" /> {t("processing")}
              </p>
            ) : null}
          </div>
        ) : null}

        {/* Output */}
        <div className="rounded-xl border bg-card p-4">
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
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <span>{error}</span>
            </div>
          ) : output ? (
            <div className="space-y-2">
              {output.mock ? (
                <p className="rounded bg-amber-50 px-2 py-1 text-xs text-amber-700">
                  Mock result
                </p>
              ) : null}
              {outputImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={outputImage} alt="output" className="max-h-72 rounded-lg" />
              ) : null}
              {outputText ? (
                <p className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">{outputText}</p>
              ) : null}
              {!outputImage && !outputText ? (
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
        <div className="rounded-xl border bg-card p-4">
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
                </Select>
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
        <div className="rounded-xl border bg-card p-4">
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
