"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Rocket,
  ShieldCheck,
  Download,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileDropzone } from "@/components/file-dropzone";
import { env } from "@/lib/env";
import { pollAIJob } from "@/lib/ai/poll-job";
import { runClientAI } from "@/features/lab/client-ai";
import { usePersona } from "@/features/persona/persona-context";
import { MARKETPLACE_LIST, getMarketplaceSpec, type MarketplaceId } from "@/lib/marketplace/constants";
import {
  scanCompliance,
  detectWhiteBackground,
  getImageDimensions,
} from "@/lib/marketplace/compliance";
import { calculateListingScore } from "@/lib/marketplace/listing-score";
import {
  exportToAllMarketplaces,
  downloadDataUrl,
  type MarketplaceExportItem,
} from "@/lib/marketplace/export";
import { useRouter } from "@/i18n/navigation";
import { generateCopyText } from "@/lib/ai/fallback-copy";

type Step = "upload" | "processing" | "results";

async function callServerAI(
  action: string,
  payload: Record<string, unknown>,
): Promise<Record<string, unknown>> {
  const res = await fetch(`/api/ai/${action}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  let data = await res.json();
  if (res.status === 202 && data.pollUrl) {
    const polled = await pollAIJob(data.pollUrl as string);
    data = { ...data, output: polled.output, mock: polled.mock };
  }
  if (!res.ok && res.status !== 202) throw new Error(data.error ?? "processing_failed");
  return data.output as Record<string, unknown>;
}

export function ListingIntelligenceStudio() {
  const router = useRouter();
  const { persona } = usePersona();
  const [step, setStep] = useState<Step>("upload");
  const [marketplace, setMarketplace] = useState<MarketplaceId>(persona.marketplaceId);
  const [productName, setProductName] = useState("");
  const [keywords, setKeywords] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [exports, setExports] = useState<MarketplaceExportItem[]>([]);
  const [score, setScore] = useState<ReturnType<typeof calculateListingScore> | null>(null);
  const [compliance, setCompliance] = useState<ReturnType<typeof scanCompliance>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMarketplace(persona.marketplaceId);
  }, [persona.marketplaceId]);

  async function generatePackage() {
    if (!imageUrl || !productName.trim()) {
      setError("Unggah foto dan isi nama produk.");
      return;
    }
    setError(null);
    setStep("processing");

    try {
      let bgUrl: string;
      if (env.demoMode) {
        const r = await runClientAI("remove-background", { imageUrl });
        bgUrl = r.output.imageUrl as string;
      } else {
        const out = await callServerAI("remove-background", { imageUrl, assetId: assetId ?? undefined });
        bgUrl = (out.imageUrl as string) ?? imageUrl;
      }
      setProcessedImage(bgUrl);

      const copyPayload = {
        productName,
        keywords,
        marketplace,
        language: marketplace === "shopee" || marketplace === "tokopedia" ? "id" : "en",
        type: "title",
      };

      let titleText: string;
      let descText: string;

      if (env.demoMode) {
        titleText = generateCopyText({ ...copyPayload, type: "title" });
        descText = generateCopyText({ ...copyPayload, type: "description" });
      } else {
        const titleOut = await callServerAI("generate-copy", copyPayload);
        const descOut = await callServerAI("generate-copy", { ...copyPayload, type: "description" });
        titleText = (titleOut.text as string) ?? generateCopyText({ ...copyPayload, type: "title" });
        descText = (descOut.text as string) ?? generateCopyText({ ...copyPayload, type: "description" });
      }

      setTitle(titleText);
      setDescription(descText);

      const dims = await getImageDimensions(bgUrl);
      const whiteBg = await detectWhiteBackground(bgUrl);
      const issues = scanCompliance({
        marketplace,
        title: titleText,
        imageWidth: dims.width,
        imageHeight: dims.height,
        hasWhiteBackground: whiteBg,
      });
      setCompliance(issues);

      const listingScore = calculateListingScore({
        marketplace,
        title: titleText,
        description: descText,
        keywords,
        imageCount: 1,
        hasWhiteBackground: whiteBg,
        imageWidth: dims.width,
        imageHeight: dims.height,
        complianceIssues: issues,
      });
      setScore(listingScore);

      const exported = await exportToAllMarketplaces(bgUrl);
      setExports(exported);
      setStep("results");
    } catch {
      setError("Gagal membuat paket listing. Periksa koneksi atau kredit Anda.");
      setStep("upload");
    }
  }

  const spec = getMarketplaceSpec(marketplace);

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2">
          <Rocket className="size-6 text-primary" />
          <h1 className="text-2xl font-bold">Listing Intelligence Engine</h1>
          <Badge>Baru</Badge>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          Satu foto → paket listing lengkap: foto siap marketplace, copy SEO, skor, dan ekspor multi-platform.
        </p>
      </div>

      {step === "upload" ? (
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <FileDropzone
              label="Unggah foto produk utama"
              onUpload={(url, _f, id) => {
                setImageUrl(url);
                setAssetId(id ?? null);
              }}
            />
            {imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={imageUrl} alt="produk" className="max-h-48 rounded-lg border object-contain" />
            ) : null}
          </div>
          <div className="space-y-4 rounded-xl border bg-card p-4">
            <div>
              <Label>Marketplace target</Label>
              <Select value={marketplace} onChange={(e) => setMarketplace(e.target.value as MarketplaceId)}>
                {MARKETPLACE_LIST.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
              <p className="mt-1 text-xs text-muted-foreground">
                Dimensi utama: {spec.mainImage.width}×{spec.mainImage.height}px
              </p>
            </div>
            <div>
              <Label>Nama produk</Label>
              <Input value={productName} onChange={(e) => setProductName(e.target.value)} placeholder="Contoh: Tas Kulit Premium" />
            </div>
            <div>
              <Label>Keyword (pisahkan koma)</Label>
              <Input value={keywords} onChange={(e) => setKeywords(e.target.value)} placeholder="tas wanita, kulit asli, gratis ongkir" />
            </div>
            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" size="lg" onClick={() => void generatePackage()} disabled={!imageUrl || !productName.trim()}>
              <Sparkles className="mr-2 size-4" />
              Generate paket listing
            </Button>
          </div>
        </div>
      ) : null}

      {step === "processing" ? (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
          <Loader2 className="size-10 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Memproses foto, copy, dan skor listing...</p>
        </div>
      ) : null}

      {step === "results" && score ? (
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-4 rounded-xl border bg-gradient-to-r from-primary/10 to-violet-500/10 p-6">
            <div className="text-center">
              <p className="text-5xl font-bold">{score.score}</p>
              <p className="text-sm text-muted-foreground">Listing Score</p>
            </div>
            <Badge variant={score.grade === "A" || score.grade === "B" ? "success" : "secondary"} className="text-lg px-4 py-1">
              Grade {score.grade}
            </Badge>
            <div className="flex-1 text-sm text-muted-foreground">
              {score.recommendations.map((r) => (
                <p key={r}>• {r}</p>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-4 rounded-xl border bg-card p-4">
              <h3 className="font-semibold">Foto utama (background dihapus)</h3>
              {processedImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={processedImage} alt="processed" className="max-h-64 rounded-lg border object-contain" />
              ) : null}
              {processedImage ? (
                <Button variant="outline" onClick={() => downloadDataUrl(processedImage, `${productName}-main.png`)}>
                  <Download className="mr-2 size-4" />
                  Unduh foto utama
                </Button>
              ) : null}
            </div>

            <div className="space-y-4 rounded-xl border bg-card p-4">
              <h3 className="font-semibold">Copy listing</h3>
              <div>
                <Label>Judul</Label>
                <p className="mt-1 rounded-lg border bg-muted/50 p-3 text-sm">{title}</p>
              </div>
              <div>
                <Label>Deskripsi</Label>
                <p className="mt-1 whitespace-pre-wrap rounded-lg border bg-muted/50 p-3 text-sm">{description}</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 flex items-center gap-2 font-semibold">
              <ShieldCheck className="size-5 text-primary" />
              Compliance Guardian
            </h3>
            <ul className="space-y-2">
              {compliance.map((issue) => (
                <li key={issue.id} className="flex items-start gap-2 text-sm">
                  {issue.severity === "error" ? (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
                  ) : issue.severity === "warning" ? (
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-500" />
                  )}
                  <span>
                    {issue.message}
                    {issue.fix ? <span className="block text-xs text-muted-foreground">→ {issue.fix}</span> : null}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-3 font-semibold">Ekspor multi-marketplace</h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {exports.map((ex) => (
                <div key={ex.marketplaceId} className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium text-sm">{ex.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {ex.width}×{ex.height}px
                    </p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => downloadDataUrl(ex.dataUrl, `${productName}-${ex.marketplaceId}.jpg`)}
                  >
                    <Download className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setStep("upload")}>
              Buat listing baru
            </Button>
            <Button onClick={() => {
              if (processedImage) sessionStorage.setItem("clartas-pending-image", processedImage);
              router.push("/editor");
            }}>
              Edit lanjutan di Editor
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
