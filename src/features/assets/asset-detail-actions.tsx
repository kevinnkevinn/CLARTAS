"use client";

import { useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Download, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteAssetAction } from "@/features/assets/actions";
import { useToast } from "@/components/ui/toast";

interface AssetDetailActionsProps {
  assetId: string;
  filename: string;
  downloadUrl: string | null;
}

export function AssetDetailActions({ assetId, filename, downloadUrl }: AssetDetailActionsProps) {
  const t = useTranslations("assets");
  const tc = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    if (!confirm(tc("delete") + "?")) return;
    startTransition(async () => {
      const res = await deleteAssetAction(assetId);
      if (res.error) toast({ title: res.error, variant: "error" });
      else {
        toast({ title: t("deleted"), variant: "success" });
        router.push("/assets");
      }
    });
  }

  return (
    <div className="flex gap-2 pt-2">
      {downloadUrl ? (
        <a href={downloadUrl} download={filename}>
          <Button variant="outline" size="sm">
            <Download className="size-4" />
            {tc("download")}
          </Button>
        </a>
      ) : null}
      <Button variant="destructive" size="sm" disabled={pending} onClick={handleDelete}>
        <Trash2 className="size-4" />
        {tc("delete")}
      </Button>
    </div>
  );
}
