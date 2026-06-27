"use client";

import { useRef, useState } from "react";
import { Download, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { FileDropzone } from "@/components/file-dropzone";

const TEMPLATES = [
  { id: "banner", w: 1200, h: 400, label: "Banner" },
  { id: "flyer", w: 800, h: 1000, label: "Flyer" },
  { id: "poster", w: 1080, h: 1350, label: "Poster" },
  { id: "thumbnail", w: 1280, h: 720, label: "Thumbnail" },
  { id: "catalog", w: 1000, h: 1000, label: "Katalog produk" },
  { id: "brochure", w: 850, h: 1100, label: "Brosur" },
  { id: "packaging", w: 900, h: 900, label: "Packaging" },
  { id: "logo", w: 512, h: 512, label: "Logo" },
] as const;

export function DesignGeneratorStudio() {
  const [template, setTemplate] = useState("banner");
  const [title, setTitle] = useState("Nama Produk");
  const [subtitle, setSubtitle] = useState("Tagline / Harga");
  const [color, setColor] = useState("#6366f1");
  const [productUrl, setProductUrl] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const tpl = TEMPLATES.find((t) => t.id === template) ?? TEMPLATES[0]!;

  function render() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = tpl.w;
    canvas.height = tpl.h;
    const ctx = canvas.getContext("2d")!;
    const grad = ctx.createLinearGradient(0, 0, tpl.w, tpl.h);
    grad.addColorStop(0, color);
    grad.addColorStop(1, "#1e1b4b");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, tpl.w, tpl.h);

    if (productUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const size = Math.min(tpl.w, tpl.h) * 0.45;
        ctx.drawImage(img, (tpl.w - size) / 2, tpl.h * 0.15, size, size);
        ctx.fillStyle = "#fff";
        ctx.font = `bold ${tpl.w / 15}px sans-serif`;
        ctx.textAlign = "center";
        ctx.fillText(title, tpl.w / 2, tpl.h * 0.78);
        ctx.font = `${tpl.w / 25}px sans-serif`;
        ctx.fillText(subtitle, tpl.w / 2, tpl.h * 0.85);
        setPreview(canvas.toDataURL("image/png"));
      };
      img.src = productUrl;
    } else {
      ctx.fillStyle = "#fff";
      ctx.font = `bold ${tpl.w / 12}px sans-serif`;
      ctx.textAlign = "center";
      ctx.fillText(title, tpl.w / 2, tpl.h / 2);
      ctx.font = `${tpl.w / 20}px sans-serif`;
      ctx.fillText(subtitle, tpl.w / 2, tpl.h / 2 + tpl.w / 15);
      setPreview(canvas.toDataURL("image/png"));
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <div>
          <Label>Template</Label>
          <Select value={template} onChange={(e) => setTemplate(e.target.value)}>
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.label} ({t.w}×{t.h})
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Judul</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} />
        </div>
        <div>
          <Label>Subjudul</Label>
          <Input value={subtitle} onChange={(e) => setSubtitle(e.target.value)} />
        </div>
        <div>
          <Label>Warna brand</Label>
          <Input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <FileDropzone
          accept="image/*"
          label="Foto produk (opsional)"
          onUpload={(url) => setProductUrl(url)}
        />
        <Button className="w-full" onClick={render}>
          <Sparkles className="mr-2 size-4" /> Generate desain
        </Button>
        <canvas ref={canvasRef} className="hidden" />
      </div>
      <div className="flex min-h-[400px] items-center justify-center rounded-xl border bg-muted/30 p-4">
        {preview ? (
          <div className="space-y-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="design" className="max-h-[500px] rounded-lg shadow-lg" />
            <a href={preview} download={`clartas-${template}.png`}>
              <Button variant="outline">
                <Download className="mr-2 size-4" /> Download PNG
              </Button>
            </a>
          </div>
        ) : (
          <p className="text-muted-foreground">Preview desain akan muncul di sini</p>
        )}
      </div>
    </div>
  );
}
