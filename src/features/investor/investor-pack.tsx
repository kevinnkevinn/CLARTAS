"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function InvestorPack() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Executive Summary</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          CLARTAS adalah AI-powered e-commerce content factory yang mengotomatisasi produksi foto,
          video, copy, dan desain untuk penjual global. Target: UMKM hingga enterprise. Model SaaS +
          usage credits.
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Business Model Canvas</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-2 text-sm">
            <p>
              <strong>Value:</strong> Konten siap jual dalam hitungan menit
            </p>
            <p>
              <strong>Customer:</strong> Seller marketplace, brand, agency
            </p>
            <p>
              <strong>Revenue:</strong> Subscription + AI credits + white-label
            </p>
            <p>
              <strong>Channels:</strong> Web, mobile, marketplace partnerships
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>SWOT</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <strong>S:</strong> All-in-one AI workflow
            </div>
            <div>
              <strong>W:</strong> Dependensi AI providers
            </div>
            <div>
              <strong>O:</strong> Boom social commerce SEA
            </div>
            <div>
              <strong>T:</strong> Kompetitor global (Canva, CapCut)
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Financial Projection (ilustrasi)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 gap-4 text-center text-sm">
            {[
              { y: "Y1", arr: "$120K" },
              { y: "Y2", arr: "$800K" },
              { y: "Y3", arr: "$3.2M" },
              { y: "Y5", arr: "$18M" },
            ].map((r) => (
              <div key={r.y} className="rounded-lg bg-muted p-3">
                <p className="text-xs text-muted-foreground">{r.y}</p>
                <p className="text-lg font-bold">{r.arr}</p>
                <p className="text-xs">ARR</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Growth Strategy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Land dengan seller Indonesia → ekspansi SEA → integrasi marketplace global → enterprise
            white-label.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Exit Strategy</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Strategic acquisition oleh platform e-commerce / creative suite, atau IPO path Y7+.
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>IPO Roadmap</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            Y4: $10M ARR · Y5: audit Big4 · Y6: S-1 filing · Y7: public listing target.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
