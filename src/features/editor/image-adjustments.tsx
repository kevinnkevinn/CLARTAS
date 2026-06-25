"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

export interface ImageTransformState {
  brightness: number;
  contrast: number;
  saturation: number;
  hue: number;
  exposure: number;
  rotate: number;
  flipH: boolean;
  flipV: boolean;
  aspectPreset: string;
}

const DEFAULT_TRANSFORM: ImageTransformState = {
  brightness: 100,
  contrast: 100,
  saturation: 100,
  hue: 0,
  exposure: 100,
  rotate: 0,
  flipH: false,
  flipV: false,
  aspectPreset: "free",
};

interface ImageAdjustmentsProps {
  imageUrl: string;
  onPreview: (url: string) => void;
  onTransformChange?: (t: ImageTransformState) => void;
}

const PRESETS = [
  { id: "free", labelKey: "presetFree" },
  { id: "1:1", labelKey: "presetSquare" },
  { id: "9:16", labelKey: "presetTiktok" },
  { id: "4:5", labelKey: "presetInstagram" },
  { id: "16:9", labelKey: "presetYoutube" },
  { id: "1200x628", labelKey: "presetMarketplace" },
] as const;

export function ImageAdjustments({
  imageUrl,
  onPreview,
  onTransformChange,
}: ImageAdjustmentsProps) {
  const t = useTranslations("editor.adjustments");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [transform, setTransform] = useState<ImageTransformState>(DEFAULT_TRANSFORM);

  const applyTransform = useCallback(
    (tState: ImageTransformState) => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const rot = tState.rotate % 360;
        const swap = rot === 90 || rot === 270;
        canvas.width = swap ? img.height : img.width;
        canvas.height = swap ? img.width : img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((rot * Math.PI) / 180);
        ctx.scale(tState.flipH ? -1 : 1, tState.flipV ? -1 : 1);
        ctx.filter = [
          `brightness(${tState.brightness}%)`,
          `contrast(${tState.contrast}%)`,
          `saturate(${tState.saturation}%)`,
          `hue-rotate(${tState.hue}deg)`,
          `brightness(${tState.exposure}%)`,
        ].join(" ");
        ctx.drawImage(img, -img.width / 2, -img.height / 2);
        ctx.restore();

        onPreview(canvas.toDataURL("image/png"));
        onTransformChange?.(tState);
      };
      img.src = imageUrl;
    },
    [imageUrl, onPreview, onTransformChange],
  );

  useEffect(() => {
    applyTransform(transform);
  }, [transform, applyTransform]);

  function update<K extends keyof ImageTransformState>(key: K, value: ImageTransformState[K]) {
    setTransform((p) => ({ ...p, [key]: value }));
  }

  const sliders = [
    ["brightness", 50, 150, transform.brightness],
    ["contrast", 50, 150, transform.contrast],
    ["saturation", 0, 200, transform.saturation],
    ["hue", -180, 180, transform.hue],
    ["exposure", 50, 150, transform.exposure],
  ] as const;

  return (
    <div className="space-y-3 rounded-lg border bg-muted/30 p-3">
      <p className="text-xs font-semibold uppercase text-muted-foreground">{t("title")}</p>
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex flex-wrap gap-1">
        {PRESETS.map((p) => (
          <Button
            key={p.id}
            type="button"
            size="sm"
            variant={transform.aspectPreset === p.id ? "default" : "outline"}
            className="h-7 text-xs"
            onClick={() => update("aspectPreset", p.id)}
          >
            {t(p.labelKey)}
          </Button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="outline" onClick={() => update("rotate", (transform.rotate + 90) % 360)}>
          {t("rotate")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => update("flipH", !transform.flipH)}>
          {t("flipH")}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => update("flipV", !transform.flipV)}>
          {t("flipV")}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setTransform(DEFAULT_TRANSFORM)}>
          {t("reset")}
        </Button>
      </div>

      {sliders.map(([key, min, max, value]) => (
        <div key={key} className="space-y-1">
          <div className="flex justify-between text-xs">
            <Label>{t(key)}</Label>
            <span className="text-muted-foreground">{value}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => update(key, Number(e.target.value) as never)}
            className="w-full accent-primary"
          />
        </div>
      ))}
    </div>
  );
}
