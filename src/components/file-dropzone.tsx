"use client";

import { useCallback, useRef, useState } from "react";
import { Upload, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { uploadMediaFile } from "@/lib/upload-client";

const MIME_LABEL: Record<string, string> = {
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/webp": "WebP",
  "image/gif": "GIF",
  "video/mp4": "MP4",
  "video/quicktime": "MOV",
  "video/webm": "WebM",
};

function getUploadErrorMessage(code: string, accept: string): string {
  const formats = accept
    .split(",")
    .map((t) => MIME_LABEL[t.trim()] ?? t.trim())
    .filter(Boolean)
    .join(", ");

  switch (code) {
    case "invalid_file_type":
      return `Format tidak didukung. Gunakan: ${formats}`;
    case "file_too_large":
      return "File terlalu besar. Foto maks. 10 MB, video maks. 100 MB";
    case "Unauthorized":
      return "Sesi habis. Silakan login kembali";
    case "upload_failed":
    default:
      return "Upload gagal. Periksa koneksi internet dan coba lagi";
  }
}

interface FileDropzoneProps {
  accept?: string;
  multiple?: boolean;
  onUpload: (url: string, file: File, assetId?: string) => void;
  className?: string;
  label?: string;
  errorLabels?: Partial<Record<string, string>>;
}

export function FileDropzone({
  accept = "image/jpeg,image/png,image/webp,image/gif,video/mp4,video/quicktime,video/webm",
  multiple = false,
  onUpload,
  className,
  label = "Upload foto atau video",
  errorLabels = {},
}: FileDropzoneProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);
      setUploading(true);
      try {
        const result = await uploadMediaFile(file);
        if (!result.ok) {
          setError(errorLabels[result.error] ?? getUploadErrorMessage(result.error, accept));
          return;
        }
        onUpload(result.data.signedUrl, file, result.data.assetId);
      } catch {
        setError(errorLabels.upload_failed ?? getUploadErrorMessage("upload_failed", accept));
      } finally {
        setUploading(false);
      }
    },
    [accept, errorLabels, onUpload],
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) void processFile(file);
  }

  return (
    <div
      className={cn(
        "upload-zone flex flex-col items-center justify-center p-8",
        dragOver && "drag-over",
        className,
      )}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      onClick={() => ref.current?.click()}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") ref.current?.click();
      }}
    >
      <input
        ref={ref}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          if (!files?.length) return;
          void processFile(files[0]!);
          if (multiple) {
            for (let i = 1; i < files.length; i++) void processFile(files[i]!);
          }
          e.target.value = "";
        }}
      />
      {uploading ? (
        <Loader2 className="size-8 animate-spin text-primary" />
      ) : (
        <>
          <Upload className="mb-2 size-8 text-primary/70" />
          <p className="mb-3 text-center text-sm text-muted-foreground">{label}</p>
          <Button
            type="button"
            variant="outline"
            className="border-primary/30 hover:border-primary/50 hover:bg-primary/10"
            onClick={(e) => {
              e.stopPropagation();
              ref.current?.click();
            }}
          >
            Pilih file
          </Button>
        </>
      )}
      {error ? (
        <p className="mt-3 flex items-center gap-1 text-xs text-destructive">
          <AlertCircle className="size-3.5" />
          {error}
        </p>
      ) : null}
    </div>
  );
}
