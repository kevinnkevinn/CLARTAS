"use client";

import { useState } from "react";
import { TrendingUp, DollarSign, BarChart3, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { analyzeMarket } from "@/features/lab/client-ai";

const MARKETPLACES = ["Shopee", "Tokopedia", "Lazada", "TikTok Shop", "Amazon", "Etsy", "Shopify", "WooCommerce"];

export function EcommerceAssistant() {
  const [product, setProduct] = useState("");
  const [marketplace, setMarketplace] = useState("Shopee");
  const [price, setPrice] = useState("");
  const [analysis, setAnalysis] = useState<ReturnType<typeof analyzeMarket> | null>(null);
  const [loading, setLoading] = useState(false);

  function run() {
    setLoading(true);
    setTimeout(() => {
      setAnalysis(analyzeMarket(product || "produk"));
      setLoading(false);
    }, 600);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-3">
        <div>
          <Label>Nama produk</Label>
          <Input value={product} onChange={(e) => setProduct(e.target.value)} />
        </div>
        <div>
          <Label>Marketplace</Label>
          <Select value={marketplace} onChange={(e) => setMarketplace(e.target.value)}>
            {MARKETPLACES.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label>Harga Anda (Rp)</Label>
          <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
      </div>
      <Button onClick={run} disabled={loading}>
        {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <TrendingUp className="mr-2 size-4" />}
        Analisis listing & kompetitor
      </Button>

      {analysis ? (
        <div className="grid gap-4 md:grid-cols-3">
          <ScoreCard label="Opportunity Score" value={analysis.opportunity} icon={TrendingUp} />
          <ScoreCard label="Competition Score" value={analysis.competition} icon={BarChart3} />
          <ScoreCard label="Market Size Score" value={analysis.marketSize} icon={DollarSign} />
          <div className="rounded-xl border bg-card p-4 md:col-span-2">
            <h3 className="mb-2 font-semibold">Rekomendasi harga</h3>
            <p className="text-sm">
              Harga pasar: Rp {analysis.avgPrice.toLocaleString("id-ID")} · Harga optimal: Rp{" "}
              {analysis.optimalPrice.toLocaleString("id-ID")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">
              Trend: {analysis.trending ? "🔥 Produk trending" : "Stabil"} · Platform: {marketplace}
            </p>
            <h4 className="mb-2 mt-4 font-medium">Optimasi listing untuk {marketplace}</h4>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              <li>Judul: sertakan keyword utama di 60 karakter pertama</li>
              <li>Foto: minimal 5 sudut + lifestyle shot</li>
              <li>Deskripsi: bullet point + garansi + CTA</li>
              <li>Sync stok ke {MARKETPLACES.slice(0, 4).join(", ")}</li>
            </ul>
          </div>
          <div className="rounded-xl border bg-card p-4">
            <h3 className="mb-2 font-semibold">Kompetitor</h3>
            <ul className="space-y-2 text-sm">
              {analysis.competitors.map((c: { name: string; price: number; rating: number }) => (
                <li key={c.name} className="flex justify-between border-b pb-1">
                  <span>{c.name}</span>
                  <span>
                    Rp {c.price.toLocaleString("id-ID")} · ⭐{c.rating}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function ScoreCard({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border bg-card p-4">
      <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className="size-4" /> {label}
      </div>
      <p className="text-3xl font-bold">{value}</p>
      <div className="mt-2 h-2 rounded-full bg-muted">
        <div className="h-2 rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
