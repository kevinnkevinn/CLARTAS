"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  Scissors,
  Sparkles,
  PenLine,
  Clapperboard,
  Camera,
  Palette,
  Loader2,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { FileDropzone } from "@/components/file-dropzone";
import { runClientAI } from "@/features/lab/client-ai";
import { addDemoAssetFromUrl } from "@/features/demo/local-assets";
import { env } from "@/lib/env";
import { pollAIJob } from "@/lib/ai/poll-job";

const QUICK_ACTIONS = [
  { href: "/editor?tool=remove-background", icon: Scissors, label: "Hapus background" },
  { href: "/editor?tool=product-studio", icon: Sparkles, label: "Studio produk" },
  { href: "/editor?tool=caption-generator", icon: PenLine, label: "Generate caption" },
  { href: "/editor?tool=video-slideshow", icon: Clapperboard, label: "Buat video" },
  { href: "/photography", icon: Camera, label: "Variasi foto massal" },
  { href: "/listing-intelligence", icon: Sparkles, label: "Listing Intelligence" },
  { href: "/design", icon: Palette, label: "Buat desain" },
] as const;

async function removeBackgroundApi(imageUrl: string, assetId?: string | null) {
  const res = await fetch("/api/ai/remove-background", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl, assetId: assetId ?? undefined }),
  });
  let data = await res.json();
  if (res.status === 202 && data.pollUrl) {
    const polled = await pollAIJob(data.pollUrl as string);
    data = { ...data, output: polled.output };
  }
  if (!res.ok && res.status !== 202) throw new Error(data.error ?? "processing_failed");
  return data.output?.imageUrl as string;
}

export function QuickStartPanel() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [assetId, setAssetId] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function quickRemoveBg() {
    if (!imageUrl) return;
    setRunning(true);
    setError(null);
    try {
      const url = env.demoMode
        ? ((await runClientAI("remove-background", { imageUrl })).output.imageUrl as string)
        : await removeBackgroundApi(imageUrl, assetId);
      setPreview(url);
      addDemoAssetFromUrl(url, `quick-bg-${Date.now()}.png`);
    } catch {
      setError("Gagal memproses. Coba lagi atau periksa koneksi.");
    } finally {
      setRunning(false);
    }
  }

  function go(href: string) {
    if (imageUrl && typeof window !== "undefined") {
      sessionStorage.setItem("clartas-pending-image", imageUrl);
    }
    router.push(href);
  }

  return (
    <div className="space-y-4 rounded-xl border bg-card p-4 md:p-6">
      <h2 className="text-lg font-semibold">Mulai cepat</h2>
      <p className="text-sm text-muted-foreground">
        Unggah foto produk dan mulai edit — atau pilih tindakan di bawah.
      </p>
      <FileDropzone
        label="Upload foto atau video produk Anda di sini"
        onUpload={(url, _file, id) => {
          setImageUrl(url);
          setAssetId(id ?? null);
          setPreview(null);
          sessionStorage.setItem("clartas-pending-image", url);
        }}
      />

      {imageUrl ? (
        <div className="flex flex-wrap items-start gap-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview ?? imageUrl} alt="preview" className="max-h-40 rounded-lg border object-contain" />
          <Button onClick={quickRemoveBg} disabled={running}>
            {running ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Scissors className="mr-2 size-4" />}
            Coba hapus background sekarang
          </Button>
        </div>
      ) : null}

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {QUICK_ACTIONS.map(({ href, icon: Icon, label }) => (
          <Button
            key={href}
            type="button"
            variant="outline"
            className="h-auto justify-start gap-2 py-3 text-left"
            onClick={() => go(href)}
          >
            <Icon className="size-4 shrink-0 text-primary" />
            <span className="flex-1">{label}</span>
            <ArrowRight className="size-4 shrink-0 opacity-50" />
          </Button>
        ))}
      </div>
    </div>
  );
}
