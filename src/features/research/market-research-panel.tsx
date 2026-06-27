"use client";

import { useState } from "react";
import { Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { analyzeMarket } from "@/features/lab/client-ai";

export function MarketResearchPanel() {
  const [query, setQuery] = useState("");
  const [data, setData] = useState<ReturnType<typeof analyzeMarket> | null>(null);
  const [loading, setLoading] = useState(false);

  function search() {
    setLoading(true);
    setTimeout(() => {
      setData(analyzeMarket(query || "produk viral"));
      setLoading(false);
    }, 500);
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-2">
        <div className="flex-1">
          <Label>Kata kunci / kategori produk</Label>
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="tas kulit, skincare, gadget..."
          />
        </div>
        <Button className="mt-6" onClick={search} disabled={loading}>
          {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
        </Button>
      </div>

      {data ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Metric title="Opportunity Score" value={data.opportunity} />
            <Metric title="Competition Score" value={data.competition} />
            <Metric title="Market Size Score" value={data.marketSize} />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border p-4">
              <h3 className="font-semibold">Produk trending</h3>
              <p className="mt-2 text-sm">
                {data.trending ? `"${query}" sedang viral di TikTok & Shopee` : "Tren stabil minggu ini"}
              </p>
            </div>
            <div className="rounded-xl border p-4">
              <h3 className="font-semibold">Review pelanggan (sample)</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {data.reviews.map((r, i) => (
                  <li key={i}>
                    {"⭐".repeat(r.rating)} {r.text}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return (
    <div className="rounded-xl border bg-card p-4 text-center">
      <p className="text-sm text-muted-foreground">{title}</p>
      <p className="text-4xl font-bold text-primary">{value}</p>
    </div>
  );
}
