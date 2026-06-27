"use client";

import { useState } from "react";
import { Plus, Play, Trash2, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

interface Step {
  id: string;
  type: "trigger" | "action";
  value: string;
}

const TRIGGERS = ["Produk baru ditambahkan", "Foto diupload", "Order masuk", "Stok habis"];
const ACTIONS = [
  "Generate foto produk",
  "Generate video iklan",
  "Generate caption",
  "Publish ke Shopee",
  "Publish ke Tokopedia",
  "Kirim notifikasi email",
  "Trigger Make.com webhook",
];

export function WorkflowBuilder() {
  const [name, setName] = useState("Workflow produk baru");
  const [steps, setSteps] = useState<Step[]>([
    { id: "1", type: "trigger", value: TRIGGERS[0]! },
    { id: "2", type: "action", value: ACTIONS[0]! },
    { id: "3", type: "action", value: ACTIONS[1]! },
    { id: "4", type: "action", value: ACTIONS[2]! },
    { id: "5", type: "action", value: ACTIONS[3]! },
  ]);
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);

  function addStep(type: "trigger" | "action") {
    setSteps((s) => [
      ...s,
      {
        id: crypto.randomUUID(),
        type,
        value: type === "trigger" ? TRIGGERS[0]! : ACTIONS[0]!,
      },
    ]);
  }

  async function runWorkflow() {
    setRunning(true);
    setLog([]);
    for (const step of steps) {
      await new Promise((r) => setTimeout(r, 600));
      setLog((l) => [...l, `✓ ${step.type === "trigger" ? "IF" : "THEN"}: ${step.value}`]);
    }
    setLog((l) => [...l, "✅ Workflow selesai — semua aksi dieksekusi"]);
    setRunning(false);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
      <div className="space-y-4">
        <div>
          <Label>Nama workflow</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="space-y-2">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center gap-2 rounded-lg border bg-card p-3">
              <span className="w-12 text-xs font-bold text-primary">
                {step.type === "trigger" ? "IF" : "THEN"}
              </span>
              <Select
                value={step.value}
                onChange={(e) =>
                  setSteps((s) =>
                    s.map((x) => (x.id === step.id ? { ...x, value: e.target.value } : x)),
                  )
                }
                className="flex-1"
              >
                {(step.type === "trigger" ? TRIGGERS : ACTIONS).map((o) => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </Select>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSteps((s) => s.filter((x) => x.id !== step.id))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => addStep("action")}>
            <Plus className="mr-1 size-3" /> Tambah aksi
          </Button>
        </div>
        <Button onClick={runWorkflow} disabled={running}>
          <Play className="mr-2 size-4" /> Jalankan workflow
        </Button>
      </div>
      <div className="rounded-xl border bg-card p-4">
        <h3 className="mb-3 flex items-center gap-2 font-semibold">
          <Workflow className="size-4" /> Log eksekusi
        </h3>
        {log.length === 0 ? (
          <p className="text-sm text-muted-foreground">Belum dijalankan</p>
        ) : (
          <ul className="space-y-1 text-sm font-mono">
            {log.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
