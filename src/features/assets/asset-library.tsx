"use client";

import { useMemo, useState, useTransition } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Images, FileVideo, Search, Trash2, Pencil, ExternalLink, LayoutGrid, List } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteAssetAction, renameAssetAction } from "@/features/assets/actions";
import { useToast } from "@/components/ui/toast";
import type { AssetWithUrl } from "@/features/assets/service";
import { formatDate } from "@/lib/utils";

type Filter = "all" | "images" | "videos" | "text";
type ViewMode = "grid" | "list";
type StatusFilter = "all" | "ready" | "processing" | "failed";

const FILTER_LABELS: Record<Filter, string> = {
  all: "filterAll",
  images: "filterImages",
  videos: "filterVideos",
  text: "filterText",
};

interface AssetLibraryProps {
  assets: AssetWithUrl[];
  locale: string;
}

export function AssetLibrary({ assets, locale }: AssetLibraryProps) {
  const t = useTranslations("assets");
  const tc = useTranslations("common");
  const router = useRouter();
  const { toast } = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [tagFilter, setTagFilter] = useState("");
  const [query, setQuery] = useState("");
  const [renameId, setRenameId] = useState<string | null>(null);
  const [newName, setNewName] = useState("");
  const [pending, startTransition] = useTransition();

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const isVideo = a.file_type.startsWith("video/");
      const isText = a.file_type.startsWith("text/") || Boolean((a.metadata as { text?: string })?.text);
      if (filter === "images" && (isVideo || isText)) return false;
      if (filter === "videos" && !isVideo) return false;
      if (filter === "text" && !isText) return false;
      if (statusFilter !== "all" && a.processing_status !== statusFilter) return false;
      if (query && !a.original_filename.toLowerCase().includes(query.toLowerCase())) {
        return false;
      }
      if (tagFilter) {
        const tags = (a.metadata?.tags as string[] | undefined) ?? [];
        if (!tags.some((t) => t.toLowerCase().includes(tagFilter.toLowerCase()))) return false;
      }
      return true;
    });
  }, [assets, filter, query, statusFilter, tagFilter]);

  function handleDelete(id: string) {
    if (!confirm(tc("delete") + "?")) return;
    startTransition(async () => {
      const res = await deleteAssetAction(id);
      if (res.error) toast({ title: res.error, variant: "error" });
      else {
        toast({ title: t("deleted"), variant: "success" });
        router.refresh();
      }
    });
  }

  function handleRename() {
    if (!renameId || !newName.trim()) return;
    startTransition(async () => {
      const res = await renameAssetAction(renameId, newName.trim());
      if (res.error) toast({ title: res.error, variant: "error" });
      else {
        toast({ title: t("renamed"), variant: "success" });
        setRenameId(null);
        router.refresh();
      }
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-9"
            placeholder={t("searchPlaceholder")}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {(["all", "images", "videos", "text"] as Filter[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filter === f ? "default" : "outline"}
              onClick={() => setFilter(f)}
            >
              {t(FILTER_LABELS[f] as "filterAll")}
            </Button>
          ))}
          <Button
            size="sm"
            variant={viewMode === "grid" ? "default" : "outline"}
            onClick={() => setViewMode("grid")}
            aria-label={t("gridView")}
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            size="sm"
            variant={viewMode === "list" ? "default" : "outline"}
            onClick={() => setViewMode("list")}
            aria-label={t("listView")}
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="sm:w-40"
        >
          <option value="all">{t("filterStatusAll")}</option>
          <option value="ready">{t("status.ready")}</option>
          <option value="processing">{t("status.processing")}</option>
          <option value="failed">{t("status.failed")}</option>
        </Select>
        <Input
          placeholder={t("filterByTag")}
          value={tagFilter}
          onChange={(e) => setTagFilter(e.target.value)}
          className="sm:max-w-xs"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-center text-sm text-muted-foreground">{t("noResults")}</p>
      ) : viewMode === "list" ? (
        <ul className="divide-y rounded-xl border">
          {filtered.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-3 p-3 text-sm">
              <Link href={`/assets/${a.id}`} className="min-w-0 flex-1 truncate font-medium hover:underline">
                {a.original_filename}
              </Link>
              <Badge variant="secondary">{a.processing_status}</Badge>
              <span className="hidden text-xs text-muted-foreground sm:inline">
                {formatDate(a.created_at, locale)}
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {filtered.map((a) => {
            const isVideo = a.file_type.startsWith("video/");
            const tags = (a.metadata?.tags as string[] | undefined) ?? [];
            return (
              <div key={a.id} className="group overflow-hidden rounded-xl border bg-card">
                <Link href={`/assets/${a.id}`} className="block">
                  <div className="flex aspect-square items-center justify-center bg-muted">
                    {isVideo ? (
                      <FileVideo className="size-10 text-muted-foreground" />
                    ) : a.signedUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={a.signedUrl} alt="" className="size-full object-cover" />
                    ) : (
                      <Images className="size-10 text-muted-foreground" />
                    )}
                  </div>
                </Link>
                <div className="p-3">
                  <p className="truncate text-sm font-medium">{a.original_filename}</p>
                  <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{formatDate(a.created_at, locale)}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {a.processing_status}
                    </Badge>
                  </div>
                  {tags.length > 0 ? (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {tags.slice(0, 3).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-[10px]">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  ) : null}
                  <div className="mt-2 flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100">
                    <Link
                      href={`/assets/${a.id}`}
                      className={buttonVariants({ size: "sm", variant: "ghost", className: "h-7 px-2" })}
                    >
                      <ExternalLink className="size-3.5" />
                    </Link>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2"
                      disabled={pending}
                      onClick={() => {
                        setRenameId(a.id);
                        setNewName(a.original_filename);
                      }}
                    >
                      <Pencil className="size-3.5" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 px-2 text-destructive"
                      disabled={pending}
                      onClick={() => handleDelete(a.id)}
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!renameId} onOpenChange={(o) => !o && setRenameId(null)}>
        <DialogContent onClose={() => setRenameId(null)}>
          <DialogHeader>
            <DialogTitle>{t("rename")}</DialogTitle>
            <DialogDescription>{t("renameHint")}</DialogDescription>
          </DialogHeader>
          <Input value={newName} onChange={(e) => setNewName(e.target.value)} />
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setRenameId(null)}>
              {tc("cancel")}
            </Button>
            <Button onClick={handleRename} disabled={pending}>
              {tc("save")}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
