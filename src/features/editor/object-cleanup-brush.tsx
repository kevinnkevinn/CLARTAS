"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Eraser } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface ObjectCleanupBrushProps {
  imageUrl: string;
  onMaskReady: (maskDataUrl: string | null) => void;
}

export function ObjectCleanupBrush({ imageUrl, onMaskReady }: ObjectCleanupBrushProps) {
  const t = useTranslations("editor.brush");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [drawing, setDrawing] = useState(false);
  const [brushSize, setBrushSize] = useState(24);

  const initCanvas = useCallback((canvas: HTMLCanvasElement, img: HTMLImageElement) => {
    canvas.width = Math.min(img.width, 800);
    canvas.height = Math.min(img.height, 800);
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    onMaskReady(null);
  }, [onMaskReady]);

  const loadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => initCanvas(canvas, img);
    img.src = imageUrl;
  }, [imageUrl, initCanvas]);

  useEffect(() => {
    loadImage();
  }, [loadImage]);

  function paint(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas || !drawing) return;
    const rect = canvas.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * canvas.width;
    const y = ((e.clientY - rect.top) / rect.height) * canvas.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    ctx.fill();
  }

  function exportMask() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    onMaskReady(canvas.toDataURL("image/png"));
  }

  function clearMask() {
    loadImage();
  }

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase text-muted-foreground">
        <Eraser className="size-3.5" />
        {t("title")}
      </div>
      <p className="text-xs text-muted-foreground">{t("hint")}</p>
      <div className="relative mx-auto max-w-md overflow-hidden rounded-lg border bg-black">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="block w-full opacity-40" />
        <canvas
          ref={canvasRef}
          className="absolute inset-0 size-full cursor-crosshair opacity-70"
          onMouseDown={() => setDrawing(true)}
          onMouseUp={() => {
            setDrawing(false);
            exportMask();
          }}
          onMouseLeave={() => setDrawing(false)}
          onMouseMove={paint}
        />
      </div>
      <div className="space-y-1">
        <Label className="text-xs">{t("brushSize")}</Label>
        <input
          type="range"
          min={8}
          max={64}
          value={brushSize}
          onChange={(e) => setBrushSize(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" size="sm" variant="outline" onClick={clearMask}>
          {t("clear")}
        </Button>
        <Button type="button" size="sm" onClick={exportMask}>
          {t("applyMask")}
        </Button>
      </div>
    </div>
  );
}
