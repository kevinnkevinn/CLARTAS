"use client";

import { useState } from "react";
import {
  ArrowLeft,
  Briefcase,
  ChartNoAxesColumn,
  Delete,
  Home,
  Plus,
  Settings,
  ShoppingBag,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const QUICK_AMOUNTS = ["50", "100", "500", "Max"] as const;
const KEYPAD = ["1", "2", "3", "4", "5", "6", "7", "8", "9", ",", "0", "⌫"] as const;

export function ProductPreview({
  greeting,
  balanceLabel,
  transferLabel,
  addLabel,
  notificationsTitle,
  contactsLabel,
  missedCalls,
  lastChats,
  withdrawalTitle,
  youSend,
  withdrawCta,
  settingsTitle,
  settingsItems,
}: {
  greeting: string;
  balanceLabel: string;
  transferLabel: string;
  addLabel: string;
  notificationsTitle: string;
  contactsLabel: string;
  missedCalls: string;
  lastChats: string;
  withdrawalTitle: string;
  youSend: string;
  withdrawCta: string;
  settingsTitle: string;
  settingsItems: { title: string; subtitle: string }[];
}) {
  const [tab, setTab] = useState<"calls" | "chats">("chats");
  const [amount, setAmount] = useState("2,795");
  const [quick, setQuick] = useState<(typeof QUICK_AMOUNTS)[number]>("Max");
  const [activeSetting, setActiveSetting] = useState(2);

  function onKey(key: string) {
    if (key === "⌫") {
      setAmount((prev) => prev.slice(0, -1) || "0");
      return;
    }
    setAmount((prev) => {
      const next = prev === "0" ? key : `${prev}${key}`;
      return next.length > 8 ? prev : next;
    });
  }

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-border/70 bg-[#F3F5F8] p-3 shadow-[0_40px_80px_-40px_rgba(0,0,0,0.35)] dark:border-white/10 dark:bg-[#050505] sm:rounded-[2rem] sm:p-4 lg:p-5">
      <div className="flex gap-3 lg:gap-4">
        {/* Sidebar */}
        <aside className="hidden w-14 shrink-0 flex-col items-center gap-3 rounded-[1.5rem] bg-white py-4 dark:bg-[#111] sm:flex">
          <div className="mb-2 flex size-9 items-center justify-center rounded-full bg-foreground text-background">
            <span className="font-display text-sm font-bold">C</span>
          </div>
          {[Home, Wallet, ShoppingBag, ChartNoAxesColumn, Briefcase, Users].map((Icon, i) => (
            <button
              key={Icon.displayName ?? i}
              type="button"
              className={cn(
                "flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground",
                i === 4 && "bg-foreground text-background hover:bg-foreground hover:text-background",
              )}
              aria-label={`nav-${i}`}
            >
              <Icon className="size-4" />
            </button>
          ))}
          <button
            type="button"
            className="mt-auto flex size-10 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
            aria-label="settings"
          >
            <Settings className="size-4" />
          </button>
        </aside>

        {/* Main column */}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="rounded-[1.5rem] bg-white p-4 dark:bg-[#111] sm:p-5">
            <div className="flex items-center gap-2">
              <div className="size-8 overflow-hidden rounded-full bg-gradient-to-br from-teal to-sky-400" />
              <p className="text-sm font-medium text-muted-foreground">{greeting}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  $42,745
                </p>
                <p className="mt-1 text-sm text-emerald-500">{balanceLabel}</p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-full border border-border bg-background px-4 py-2 text-sm font-medium transition hover:bg-muted"
                >
                  {transferLabel}
                </button>
                <button
                  type="button"
                  className="inline-flex items-center gap-1 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition hover:opacity-90"
                >
                  <Plus className="size-4" />
                  {addLabel}
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 dark:bg-white/[0.03]">
                <p className="text-xs text-muted-foreground">Fiat</p>
                <p className="mt-1 text-sm font-semibold">£ $ €</p>
                <p className="mt-2 text-xs font-medium text-emerald-500">+12.05%</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/40 p-3 dark:bg-white/[0.03]">
                <p className="text-xs text-muted-foreground">Ethereum</p>
                <p className="mt-1 text-sm font-semibold">$2,356</p>
                <p className="mt-2 text-xs font-medium text-emerald-500">+0.08%</p>
              </div>
              <div className="col-span-2 rounded-2xl bg-gradient-to-br from-sky-400 to-teal p-3 text-white sm:col-span-1">
                <div className="flex size-8 items-center justify-center rounded-full bg-white/20 text-xs font-bold">
                  JC
                </div>
                <p className="mt-2 text-sm font-semibold">Jameson Cole</p>
              </div>
              <div className="hidden rounded-2xl border border-border/60 bg-muted/40 p-3 dark:bg-white/[0.03] sm:block">
                <p className="text-xs text-muted-foreground">VISA</p>
                <p className="mt-1 text-sm font-semibold">•••• 9471</p>
              </div>
            </div>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[1.5rem] bg-white p-4 dark:bg-[#111] sm:p-5">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div>
                  <h3 className="font-display text-lg font-bold">{notificationsTitle}</h3>
                  <p className="text-xs text-muted-foreground">{contactsLabel}</p>
                </div>
                <div className="flex rounded-full bg-muted p-1 dark:bg-white/5">
                  <button
                    type="button"
                    onClick={() => setTab("calls")}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition",
                      tab === "calls" ? "bg-foreground text-background" : "text-muted-foreground",
                    )}
                  >
                    {missedCalls}
                  </button>
                  <button
                    type="button"
                    onClick={() => setTab("chats")}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition",
                      tab === "chats" ? "bg-foreground text-background" : "text-muted-foreground",
                    )}
                  >
                    {lastChats}
                  </button>
                </div>
              </div>
              <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-700 via-slate-800 to-slate-900 p-4 min-h-[180px]">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_20%,rgba(255,255,255,0.12),transparent_45%)]" />
                <div className="relative space-y-2">
                  <div className="max-w-[80%] rounded-2xl rounded-bl-md bg-white px-3 py-2 text-xs text-slate-900">
                    Listing assets are ready for review.
                  </div>
                  <div className="ml-auto max-w-[75%] rounded-2xl rounded-br-md bg-white/20 px-3 py-2 text-xs text-white backdrop-blur">
                    Publish to Shopee & Tokopedia?
                  </div>
                  <p className="text-[11px] text-white/60">typing…</p>
                </div>
              </div>
            </div>

            {/* Withdrawal panel */}
            <div className="rounded-[1.5rem] bg-white p-4 dark:bg-[#111] sm:p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ArrowLeft className="size-4 text-muted-foreground" />
                  <h3 className="text-sm font-semibold">{withdrawalTitle}</h3>
                </div>
                <X className="size-4 text-muted-foreground" />
              </div>
              <div className="mt-3 rounded-2xl bg-gradient-to-br from-sky-400 to-teal p-4 text-white">
                <p className="text-xs opacity-90">{youSend}</p>
                <p className="mt-1 font-display text-3xl font-bold tracking-tight">{amount}</p>
                <p className="mt-1 text-xs opacity-80">Ethereum USDT</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_AMOUNTS.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      setQuick(q);
                      if (q !== "Max") setAmount(q);
                    }}
                    className={cn(
                      "rounded-full px-3 py-1.5 text-xs font-medium transition",
                      quick === q
                        ? "bg-foreground text-background"
                        : "bg-muted text-muted-foreground hover:text-foreground dark:bg-white/5",
                    )}
                  >
                    {q}
                  </button>
                ))}
              </div>
              <div className="mt-3 grid grid-cols-3 gap-1.5">
                {KEYPAD.map((key) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onKey(key === "⌫" ? "⌫" : key)}
                    className="flex h-10 items-center justify-center rounded-xl text-sm font-semibold transition hover:bg-muted dark:hover:bg-white/5"
                  >
                    {key === "⌫" ? <Delete className="size-4" /> : key}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="mt-3 w-full rounded-2xl bg-foreground py-3 text-sm font-semibold text-background transition hover:opacity-90"
              >
                {withdrawCta.replace("{amount}", amount)}
              </button>
            </div>
          </div>

          <div className="rounded-[1.5rem] bg-white p-4 dark:bg-[#111] sm:p-5">
            <h3 className="font-display text-base font-bold">{settingsTitle}</h3>
            <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
              {settingsItems.map((item, i) => (
                <button
                  key={item.title}
                  type="button"
                  onClick={() => setActiveSetting(i)}
                  className={cn(
                    "min-w-[140px] shrink-0 rounded-2xl border border-border/60 p-3 text-left transition",
                    activeSetting === i
                      ? "border-transparent bg-gradient-to-br from-sky-400 to-teal text-white"
                      : "bg-muted/30 hover:bg-muted/60 dark:bg-white/[0.03]",
                  )}
                >
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p
                    className={cn(
                      "mt-1 text-xs",
                      activeSetting === i ? "text-white/80" : "text-muted-foreground",
                    )}
                  >
                    {item.subtitle}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
