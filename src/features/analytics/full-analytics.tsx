"use client";

import { BarChart3, TrendingUp, DollarSign, MousePointer, Heart } from "lucide-react";

const METRICS = [
  { label: "Conversion Rate", value: "3.8%", icon: TrendingUp, change: "+0.4%" },
  { label: "CTR", value: "5.2%", icon: MousePointer, change: "+1.1%" },
  { label: "Engagement", value: "12.4K", icon: Heart, change: "+18%" },
  { label: "Revenue", value: "Rp 48.2M", icon: DollarSign, change: "+22%" },
  { label: "Profit", value: "Rp 12.1M", icon: BarChart3, change: "+15%" },
  { label: "ROI", value: "340%", icon: TrendingUp, change: "+45%" },
];

export function FullAnalyticsDashboard() {
  return (
    <div className="space-y-6">
      <p className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm text-blue-800">
        Data demo — hubungkan marketplace untuk metrik live
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {METRICS.map((m) => (
          <div key={m.label} className="rounded-xl border bg-card p-4">
            <div className="flex items-center justify-between">
              <m.icon className="size-5 text-muted-foreground" />
              <span className="text-xs text-green-600">{m.change}</span>
            </div>
            <p className="mt-2 text-2xl font-bold">{m.value}</p>
            <p className="text-sm text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-4 font-semibold">Tren 30 hari</h3>
        <div className="flex h-32 items-end gap-1">
          {Array.from({ length: 30 }, (_, i) => {
            const h = 20 + Math.sin(i / 3) * 30 + (i % 5) * 8;
            return (
              <div
                key={i}
                className="flex-1 rounded-t bg-primary/70"
                style={{ height: `${h}%` }}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
