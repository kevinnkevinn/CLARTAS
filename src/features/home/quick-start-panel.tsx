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

const QUICK_ACTIONS = [
  { tool: "remove-background", href: "/editor?tool=remove-background", icon: Scissors, label: "Hapus background" },
  { tool: "product-studio", href: "/editor?tool=product-studio", icon: Sparkles, label: "Studio produk" },
  { tool: "caption-generator", href: "/editor?tool=caption-generator", icon: PenLine, label: "Generate caption" },
  { tool: "video-slideshow", href: "/editor?tool=video-slideshow", icon: Clapperboard, label: "Buat video" },
  { tool: "batch", href: "/photography", icon: Camera, label: "Variasi foto massal" },
  { tool: "design", href: "/design", icon: Palette, label: "Buat desain" },
] as const;

export function QuickStartPanel() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [running, setRunning] = useState(false);

  async function quickRemoveBg() {
    if (!imageUrl) return;
    setRunning(true);
    try {
      const r = await runClientAI("remove-background", { imageUrl });
      const url = r.output.imageUrl as string;
      setPreview(url);
      addDemoAssetFromUrl(url, `quick-bg-${Date.now()}.png`);
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
      <FileDropzone
        label="Upload foto atau video produk Anda di sini"
        onUpload={(url) => {
          setImageUrl(url);
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
