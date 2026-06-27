"use client";

import { useState } from "react";
import { Store, Building2, Camera, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const PERSONAS = [
  { id: "individual", label: "Individual", icon: Users },
  { id: "shopee", label: "Shopee Seller", icon: Store },
  { id: "tokopedia", label: "Tokopedia Seller", icon: Store },
  { id: "tiktok", label: "TikTok Seller", icon: Store },
  { id: "amazon", label: "Amazon Seller", icon: Store },
  { id: "etsy", label: "Etsy Seller", icon: Store },
  { id: "shopify", label: "Shopify Seller", icon: Store },
  { id: "ebay", label: "eBay Seller", icon: Store },
  { id: "umkm", label: "UMKM", icon: Building2 },
  { id: "sme", label: "SME", icon: Building2 },
  { id: "enterprise", label: "Enterprise", icon: Building2 },
  { id: "agency", label: "Agency", icon: Building2 },
  { id: "influencer", label: "Influencer", icon: Camera },
  { id: "affiliate", label: "Affiliate Marketer", icon: Users },
  { id: "live", label: "Live Streamer", icon: Camera },
  { id: "youtube", label: "YouTuber", icon: Camera },
  { id: "tiktok-creator", label: "TikTok Creator", icon: Camera },
  { id: "instagram", label: "Instagram Creator", icon: Camera },
];

export function PersonaBanner() {
  const [selected, setSelected] = useState("shopee");
  const persona = PERSONAS.find((p) => p.id === selected);

  return (
    <div className="mb-6 rounded-xl border bg-gradient-to-r from-primary/10 to-violet-500/10 p-4">
      <p className="mb-2 text-xs font-semibold uppercase text-muted-foreground">User Persona</p>
      <div className="flex flex-wrap gap-2">
        {PERSONAS.map((p) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setSelected(p.id)}
            className={`rounded-full border px-3 py-1 text-xs transition ${selected === p.id ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:border-primary/50"}`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {persona ? (
        <div className="mt-3 text-sm">
          Mode aktif: <Badge>{persona.label}</Badge> — UI dan rekomendasi disesuaikan untuk persona
          ini (format marketplace, tone konten, rasio video).
        </div>
      ) : null}
    </div>
  );
}
