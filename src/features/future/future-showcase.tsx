"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Glasses,
  Cpu,
  Sparkles,
  Brain,
  Rocket,
  Bot,
  Users,
  Database,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

const TECH = [
  { icon: Glasses, title: "AR Commerce", desc: "Coba produk secara augmented reality di kamera HP" },
  { icon: Box, title: "VR Commerce", desc: "Virtual shopping mall 3D" },
  { icon: Cpu, title: "Spatial Commerce", desc: "Mixed reality — produk di ruang nyata" },
  { icon: Sparkles, title: "Hologram Commerce", desc: "Showcase produk holografik" },
  { icon: Bot, title: "AI Digital Human", desc: "Salesperson virtual interaktif" },
  { icon: Users, title: "AI Influencer", desc: "Influencer otomatis untuk promosi" },
  { icon: Brain, title: "Brain-Computer Interface", desc: "Interaksi belanja via sinyal otak (riset)" },
  { icon: Database, title: "Quantum AI Ready", desc: "Arsitektur siap komputasi kuantum" },
  { icon: Rocket, title: "Autonomous Commerce", desc: "AI menjalankan bisnis end-to-end" },
  { icon: Brain, title: "AGI Integration", desc: "Slot integrasi AGI masa depan" },
  { icon: Box, title: "Robotics Integration", desc: "Warehouse robot orchestration" },
  { icon: Database, title: "Digital Twin Commerce", desc: "Replika digital bisnis real-time" },
];

export function FutureTechShowcase() {
  const [arActive, setArActive] = useState(false);

  useEffect(() => {
    if (!arActive) return;
    const t = setTimeout(() => setArActive(false), 5000);
    return () => clearTimeout(t);
  }, [arActive]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-violet-200 bg-violet-50 p-4 dark:border-violet-900 dark:bg-violet-950/30">
        <h3 className="font-semibold">Demo AR Commerce</h3>
        <p className="mb-3 text-sm text-muted-foreground">
          Simulasi preview produk di ruangan (gunakan kamera jika diizinkan browser)
        </p>
        <button
          type="button"
          onClick={() => setArActive(true)}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white"
        >
          Aktifkan AR Preview
        </button>
        {arActive ? (
          <div className="mt-4 flex h-48 items-center justify-center rounded-lg border-2 border-dashed border-violet-400 bg-violet-100/50">
            <p className="text-center text-sm">
              🛋️ Produk virtual ditempatkan di ruangan Anda
              <br />
              <span className="text-muted-foreground">(Modul AR penuh — roadmap 5–10 tahun)</span>
            </p>
          </div>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {TECH.map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <Icon className="size-6 text-primary" />
              <Badge variant="outline">Roadmap</Badge>
            </div>
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
