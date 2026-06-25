"use client";

import { useRef, useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { validateUpload } from "@/lib/upload-validation";
import { isImage } from "@/lib/upload-validation";

export function AssetUploader() {
  const t = useTranslations("assets");
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setError(null);

    for (const file of Array.from(files)) {
      const v = validateUpload(file.type, file.size);
      if (!v.ok) {
        const kind = isImage(file.type) ? "image" : "video";
        setError(
          v.error === "size"
            ? t(`uploadValidation.${kind}Size`)
            : t("uploadValidation.imageType"),
        );
        continue;
      }
      setUploading(true);
      try {
        const fd = new FormData();
        fd.append("file", file);
        const res = await fetch("/api/upload", { method: "POST", body: fd });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error ?? "upload_failed");
        }
      } catch {
        setError("upload_failed");
      } finally {
        setUploading(false);
      }
    }
    router.refresh();
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
        className="hidden"
        onChange={(e) => onFiles(e.target.files)}
      />
      <Button onClick={() => inputRef.current?.click()} disabled={uploading}>
        {uploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
        {t("uploadButton")}
      </Button>
      {error ? (
        <p className="flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
