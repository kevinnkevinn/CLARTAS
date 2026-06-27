"use client";

import { useState } from "react";
import { Bot, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { agentRespond } from "@/features/lab/client-ai";

const AGENTS = [
  { id: "marketing", name: "Marketing Agent", desc: "Kampanye, ads, social media" },
  { id: "design", name: "Design Agent", desc: "Visual, brand, layout" },
  { id: "sales", name: "Sales Agent", desc: "Pricing, bundling, conversion" },
  { id: "cs", name: "Customer Service Agent", desc: "Balas chat, follow-up" },
  { id: "marketplace", name: "Marketplace Agent", desc: "Listing, sync, SEO" },
] as const;

export function AgentConsole() {
  const [agent, setAgent] = useState("marketing");
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "agent"; text: string }[]>([]);

  function send() {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((m) => [...m, { role: "user", text: userText }]);
    setInput("");
    setTimeout(() => {
      setMessages((m) => [...m, { role: "agent", text: agentRespond(agent, userText) }]);
    }, 500);
  }

  const current = AGENTS.find((a) => a.id === agent)!;

  return (
    <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
      <div className="space-y-1">
        {AGENTS.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => {
              setAgent(a.id);
              setMessages([]);
            }}
            className={`w-full rounded-lg border p-3 text-left text-sm ${agent === a.id ? "border-primary bg-primary/5" : ""}`}
          >
            <p className="font-medium">{a.name}</p>
            <p className="text-xs text-muted-foreground">{a.desc}</p>
          </button>
        ))}
      </div>
      <div className="flex flex-col rounded-xl border">
        <div className="flex items-center gap-2 border-b p-3">
          <Bot className="size-5 text-primary" />
          <span className="font-semibold">{current.name}</span>
        </div>
        <div className="min-h-[300px] flex-1 space-y-2 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Tanya agent tentang {current.desc.toLowerCase()}...
            </p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-lg p-3 text-sm ${m.role === "user" ? "ml-8 bg-muted" : "mr-8 border bg-card"}`}
              >
                {m.text}
              </div>
            ))
          )}
        </div>
        <div className="flex gap-2 border-t p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Instruksi untuk ${current.name}...`}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button onClick={send}>
            <Send className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
