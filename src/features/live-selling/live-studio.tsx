"use client";

import { useState } from "react";
import { Radio, Mic, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { generateLiveScript, playTextToSpeech } from "@/features/lab/client-ai";

export function LiveSellingStudio() {
  const [product, setProduct] = useState("");
  const [platform, setPlatform] = useState("Shopee Live");
  const [script, setScript] = useState("");
  const [loading, setLoading] = useState(false);

  function generate() {
    setLoading(true);
    setTimeout(() => {
      setScript(generateLiveScript(product || "Produk", platform));
      setLoading(false);
    }, 400);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4 rounded-xl border bg-card p-4">
        <div>
          <Label>Nama produk</Label>
          <Input value={product} onChange={(e) => setProduct(e.target.value)} />
        </div>
        <div>
          <Label>Platform live</Label>
          <Select value={platform} onChange={(e) => setPlatform(e.target.value)}>
            <option>Shopee Live</option>
            <option>TikTok Live</option>
            <option>Instagram Live</option>
            <option>YouTube Live</option>
          </Select>
        </div>
        <Button onClick={generate} disabled={loading} className="w-full">
          {loading ? <Loader2 className="mr-2 size-4 animate-spin" /> : <Radio className="mr-2 size-4" />}
          Generate live script
        </Button>
        <p className="text-xs text-muted-foreground">
          Virtual host / AI presenter: gunakan voiceover + script di bawah. Auto-answer customer
          terhubung ke modul Customer Service.
        </p>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Script live selling</h3>
          {script ? (
            <Button size="sm" variant="outline" onClick={() => playTextToSpeech(script)}>
              <Mic className="mr-1 size-3" /> AI Host voice
            </Button>
          ) : null}
        </div>
        {script ? (
          <pre className="max-h-[400px] overflow-auto whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
            {script}
          </pre>
        ) : (
          <p className="text-sm text-muted-foreground">Script akan muncul setelah generate</p>
        )}
      </div>
    </div>
  );
}
