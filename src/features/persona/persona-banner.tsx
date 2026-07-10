"use client";

import { Store, Building2, Camera, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { usePersona } from "@/features/persona/persona-context";
import { getMarketplaceSpec } from "@/lib/marketplace/constants";

const PERSONAS = [
  { id: "individual", label: "Individual", icon: Users },
  { id: "shopee", label: "Shopee Seller", icon: Store },
  { id: "tokopedia", label: "Tokopedia Seller", icon: Store },
  { id: "tiktok", label: "TikTok Seller", icon: Store },
  { id: "amazon", label: "Amazon Seller", icon: Store },
  { id: "etsy", label: "Etsy Seller", icon: Store },
  { id: "shopify", label: "Shopify Seller", icon: Store },
  { id: "umkm", label: "UMKM", icon: Building2 },
  { id: "sme", label: "SME", icon: Building2 },
  { id: "agency", label: "Agency", icon: Building2 },
  { id: "influencer", label: "Influencer", icon: Camera },
  { id: "live", label: "Live Streamer", icon: Camera },
] as const;

export function PersonaBanner() {
  const { persona, setPersona } = usePersona();
  const active = PERSONAS.find((p) => p.id === persona.personaId) ?? PERSONAS[1];
  const mp = getMarketplaceSpec(persona.marketplaceId);

  return (
    <div className="rounded-xl border bg-gradient-to-r from-primary/10 to-violet-500/10 p-4">
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">Persona penjual</p>
      <div className="flex flex-wrap gap-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setPersona(p.id)}
            className={`rounded-full border px-3 py-1 text-xs transition ${persona.personaId === p.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="mt-3 text-sm">
        Mode aktif: <Badge>{active.label}</Badge> — marketplace default{" "}
        <Badge variant="secondary">{mp.name}</Badge>, dimensi foto {mp.mainImage.width}×
        {mp.mainImage.height}px, tone konten disesuaikan.
      </div>
    </div>
  );
}
