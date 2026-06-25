"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Label } from "@/components/ui/label";

interface ImageAdjustmentsProps {
  imageUrl: string;
  onPreview: (url: string) => void;
}

export function ImageAdjustments({ imageUrl, onPreview }: ImageAdjustmentsProps) {
  const t = useTranslations("editor.adjustments");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
      ctx.drawImage(img, 0, 0);
      onPreview(canvas.toDataURL("image/png"));
    };
    img.src = imageUrl;
  }, [imageUrl, brightness, contrast, saturation, onPreview]);

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{t("title")}</p>
      <canvas ref={canvasRef} className="hidden" />
      {(
        [
          ["brightness", brightness, setBrightness],
          ["contrast", contrast, setContrast],
          ["saturation", saturation, setSaturation],
        ] as const
      ).map(([key, value, setter]) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <Label>{t(key)}</Label>
            <span className="text-muted-foreground">{value}%</span>
          </div>
          <input
            type="range"
            min={50}
            max={150}
            value={value}
            onChange={(e) => setter(Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
      ))}
    </div>
  );
}
