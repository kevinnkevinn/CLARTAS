"use client";

import { useState } from "react";
import { Send, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const CHANNELS = ["WhatsApp", "Telegram", "Messenger", "Instagram DM", "Website Chat"] as const;

const AUTO_REPLIES = [
  "Halo! Terima kasih sudah chat. Produk ready stock ✅",
  "Ongkir gratis untuk order hari ini 🚚",
  "Mau lihat varian warna lain?",
];

export function CustomerServiceChat() {
  const [channel, setChannel] = useState<(typeof CHANNELS)[number]>("WhatsApp");
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([
    { role: "bot", text: "Halo! Saya AI CS CLARTAS. Ada yang bisa dibantu?" },
  ]);
  const [input, setInput] = useState("");
  const [autoFollowUp, setAutoFollowUp] = useState(true);
  const [upsell, setUpsell] = useState(true);

  function send() {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");

    setTimeout(() => {
      let reply = `Terima kasih pesannya via ${channel}. `;
      if (userMsg.toLowerCase().includes("harga")) {
        reply += "Harga spesial hari ini Rp 99.000. Mau saya buatkan link checkout?";
      } else if (userMsg.toLowerCase().includes("ongkir")) {
        reply += "Gratis ongkir untuk area Jabodetabek. COD juga tersedia.";
      } else {
        reply += AUTO_REPLIES[Math.floor(Math.random() * AUTO_REPLIES.length)]!;
      }
      if (upsell) reply += " 💡 Rekomendasi: bundle 2 pcs hemat 15%!";
      setMessages((m) => [...m, { role: "bot", text: reply }]);

      if (autoFollowUp) {
        setTimeout(() => {
          setMessages((m) => [
            ...m,
            { role: "bot", text: "Follow-up otomatis: Apakah masih tertarik? Stok terbatas!" },
          ]);
        }, 2000);
      }
    }, 800);
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase text-muted-foreground">Channel</p>
        {CHANNELS.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setChannel(c)}
            className={`block w-full rounded-lg border px-3 py-2 text-left text-sm ${channel === c ? "border-primary bg-primary/10" : ""}`}
          >
            {c}
          </button>
        ))}
        <label className="mt-4 flex items-center gap-2 text-xs">
          <input type="checkbox" checked={autoFollowUp} onChange={(e) => setAutoFollowUp(e.target.checked)} />
          Auto follow-up
        </label>
        <label className="flex items-center gap-2 text-xs">
          <input type="checkbox" checked={upsell} onChange={(e) => setUpsell(e.target.checked)} />
          Upsell / cross-sell
        </label>
      </div>
      <div className="flex flex-col rounded-xl border bg-card">
        <div className="flex items-center gap-2 border-b p-3">
          <Bot className="size-5 text-primary" />
          <span className="font-medium">AI Chatbot — {channel}</span>
          <Badge variant="secondary" className="ml-auto">
            Online
          </Badge>
        </div>
        <div className="flex-1 space-y-3 overflow-y-auto p-4" style={{ minHeight: 320 }}>
          {messages.map((m, i) => (
            <div
              key={i}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${
                m.role === "user" ? "ml-auto bg-primary text-primary-foreground" : "bg-muted"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>
        <div className="flex gap-2 border-t p-3">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pesan pelanggan..."
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
