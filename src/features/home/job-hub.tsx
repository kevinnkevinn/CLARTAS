"use client";

import { useRouter } from "@/i18n/navigation";
import {
  Scissors,
  Sparkles,
  PenLine,
  Clapperboard,
  Camera,
  Rocket,
  BarChart3,
  Package,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const JOBS: {
  href: string;
  icon: typeof Rocket;
  label: string;
  desc: string;
  badge?: string;
}[] = [
  {
    href: "/listing-intelligence",
    icon: Rocket,
    label: "Buat listing lengkap",
    desc: "Foto + copy + skor dalam satu alur",
    badge: "Baru",
  },
  {
    href: "/editor?tool=remove-background",
    icon: Scissors,
    label: "Edit foto produk",
    desc: "Hapus background, studio shot",
  },
  {
    href: "/editor?tool=caption-generator",
    icon: PenLine,
    label: "Tulis copy listing",
    desc: "Judul, deskripsi, caption SEO",
  },
  {
    href: "/editor?tool=video-slideshow",
    icon: Clapperboard,
    label: "Buat video iklan",
    desc: "Slideshow & video pendek",
  },
  {
    href: "/photography",
    icon: Camera,
    label: "Variasi foto massal",
    desc: "12–48 variasi sekaligus",
  },
  {
    href: "/content",
    icon: Sparkles,
    label: "Generator konten",
    desc: "Copy multi-marketplace",
  },
  {
    href: "/ecommerce",
    icon: BarChart3,
    label: "Analisis listing",
    desc: "Skor & rekomendasi harga",
  },
  {
    href: "/assets",
    icon: Package,
    label: "Kelola aset",
    desc: "Pustaka foto & video",
  },
] as const;

export function JobHub() {
  const router = useRouter();

  return (
    <div className="space-y-3">
      <h2 className="text-sm font-semibold text-muted-foreground">Apa yang ingin Anda lakukan?</h2>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {JOBS.map(({ href, icon: Icon, label, desc, badge }) => (
          <button
            key={href}
            type="button"
            onClick={() => router.push(href)}
            className="group flex flex-col items-start gap-2 rounded-xl border bg-card p-4 text-left transition-colors hover:border-primary hover:bg-accent/50"
          >
            <div className="flex w-full items-center justify-between">
              <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" />
              </span>
              {badge ? <Badge variant="secondary">{badge}</Badge> : null}
              <ArrowRight className="size-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
            </div>
            <span className="font-medium">{label}</span>
            <span className="text-xs text-muted-foreground">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
