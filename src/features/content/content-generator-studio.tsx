"use client";

import { useState } from "react";
import { Sparkles, Loader2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { runClientAI } from "@/features/lab/client-ai";

const CONTENT_TYPES = [
  { id: "title", label: "Judul produk" },
  { id: "description", label: "Deskripsi produk" },
  { id: "seo", label: "SEO description" },
  { id: "keywords", label: "Keyword" },
  { id: "caption", label: "Caption sosmed" },
  { id: "hashtag", label: "Hashtag" },
  { id: "cta", label: "CTA" },
  { id: "script", label: "Script video" },
  { id: "facebook_ads", label: "Facebook Ads" },
  { id: "google_ads", label: "Google Ads" },
  { id: "tiktok_ads", label: "TikTok Ads" },
  { id: "instagram_ads", label: "Instagram Ads" },
] as const;

export function ContentGeneratorStudio() {
  const [productName, setProductName] = useState("");
  const [details, setDetails] = useState("");
  const [keywords, setKeywords] = useState("");
  const [marketplace, setMarketplace] = useState("shopee");
  const [results, setResults] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function generate(type: string) {
    setLoading(type);
    try {
      const r = await runClientAI("generate-copy", {
        productName: productName || "Produk",
        details,
        keywords,
        marketplace,
        type,
        tone: "professional",
        language: "id",
      });
      setResults((p) => ({ ...p, [type]: r.output.text as string }));
    } finally {
      setLoading(null);
    }
  }

  async function generateAll() {
    for (const t of CONTENT_TYPES) {
      await generate(t.id);
    }
  }

  function copyText(key: string, text: string) {
    void navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 rounded-xl border bg-card p-4 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <Label>Nama produk</Label>
            <Input value={productName} onChange={(e) => setProductName(e.target.value)} />
          </div>
          <div>
            <Label>Detail produk</Label>
            <Textarea rows={4} value={details} onChange={(e) => setDetails(e.target.value)} />
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <Label>Keywords</Label>
            <Input
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder="murah, original, garansi"
            />
          </div>
          <div>
            <Label>Marketplace</Label>
            <Select value={marketplace} onChange={(e) => setMarketplace(e.target.value)}>
              <option value="shopee">Shopee</option>
              <option value="tokopedia">Tokopedia</option>
              <option value="lazada">Lazada</option>
              <option value="tiktok">TikTok Shop</option>
              <option value="amazon">Amazon</option>
              <option value="etsy">Etsy</option>
            </Select>
          </div>
          <Button onClick={generateAll} className="w-full">
            <Sparkles className="mr-2 size-4" /> Generate semua konten
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {CONTENT_TYPES.map(({ id, label }) => (
          <div key={id} className="rounded-xl border bg-card p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="font-medium">{label}</h3>
              <Button
                size="sm"
                variant="outline"
                disabled={loading === id}
                onClick={() => generate(id)}
              >
                {loading === id ? <Loader2 className="size-3 animate-spin" /> : "Generate"}
              </Button>
            </div>
            {results[id] ? (
              <div className="relative">
                <pre className="whitespace-pre-wrap rounded-lg bg-muted p-3 text-sm">{results[id]}</pre>
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute right-2 top-2"
                  onClick={() => copyText(id, results[id]!)}
                >
                  {copied === id ? <Check className="size-3" /> : <Copy className="size-3" />}
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Belum di-generate</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
