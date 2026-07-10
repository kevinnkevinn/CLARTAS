"use client";

import { useState } from "react";
import { ArrowUpRight, Shield, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export function HeroVisual({
  spendLabel,
  spendStatus,
  protectionTitle,
  protectionStatus,
  activateLabel,
  learnMoreLabel,
}: {
  spendLabel: string;
  spendStatus: string;
  protectionTitle: string;
  protectionStatus: string;
  activateLabel: string;
  learnMoreLabel: string;
}) {
  const [spendOn, setSpendOn] = useState(true);
  const [protectOn, setProtectOn] = useState(false);

  return (
    <div className="relative overflow-hidden rounded-[1.75rem] sm:rounded-[2rem] md:rounded-[2.5rem]">
      <div className="hero-warm-gradient relative min-h-[280px] sm:min-h-[340px] md:min-h-[400px] lg:min-h-[440px]">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
          viewBox="0 0 900 440"
          fill="none"
          aria-hidden
        >
          <path
            className="marketing-line-draw"
            d="M40 320 C 160 280, 220 120, 340 180 S 520 360, 640 240 S 780 80, 860 140"
            stroke="hsl(16 100% 55%)"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M120 80 L180 20 M200 100 L260 40 M280 120 L340 60"
            stroke="hsl(16 100% 58% / 0.55)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M80 200 L140 140 M160 220 L220 160"
            stroke="hsl(16 100% 58% / 0.35)"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>

        <div className="absolute inset-x-4 bottom-4 top-auto flex flex-col gap-3 sm:inset-auto sm:right-6 sm:top-1/2 sm:w-[min(100%,320px)] sm:-translate-y-1/2 md:right-10 md:w-[340px]">
          <div
            className={cn(
              "marketing-float rounded-2xl border border-white/50 bg-white/85 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-black/70",
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative flex size-12 items-center justify-center">
                <svg className="size-12 -rotate-90" viewBox="0 0 48 48" aria-hidden>
                  <circle cx="24" cy="24" r="18" fill="none" stroke="hsl(16 40% 90%)" strokeWidth="4" className="dark:stroke-white/10" />
                  <circle
                    cx="24"
                    cy="24"
                    r="18"
                    fill="none"
                    stroke="hsl(16 100% 58%)"
                    strokeWidth="4"
                    strokeDasharray={`${62.2 * 1.13} 113`}
                    strokeLinecap="round"
                  />
                </svg>
                <span className="absolute text-[10px] font-bold text-foreground">62%</span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold tracking-tight text-foreground">{spendLabel}</p>
                <p className="text-xs text-muted-foreground">{spendStatus}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={spendOn}
                aria-label={spendStatus}
                onClick={() => setSpendOn((v) => !v)}
                className={cn(
                  "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                  spendOn ? "bg-primary" : "bg-muted",
                )}
              >
                <span
                  className={cn(
                    "absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                    spendOn ? "left-5" : "left-0.5",
                  )}
                />
              </button>
            </div>
          </div>

          <div
            className={cn(
              "marketing-float-delayed rounded-2xl border border-white/50 bg-white/85 p-4 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.25)] backdrop-blur-xl dark:border-white/10 dark:bg-black/70",
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-secondary text-foreground dark:bg-white/10">
                <UserRound className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Shield className="size-3.5 text-primary" />
                  <p className="text-sm font-semibold tracking-tight text-foreground">{protectionTitle}</p>
                </div>
                <p className="mt-0.5 text-xs text-muted-foreground">{protectionStatus}</p>
                <div className="mt-3 flex items-center justify-between gap-2">
                  <button
                    type="button"
                    role="switch"
                    aria-checked={protectOn}
                    aria-label={activateLabel}
                    onClick={() => setProtectOn((v) => !v)}
                    className={cn(
                      "relative h-7 w-12 shrink-0 rounded-full transition-colors",
                      protectOn ? "bg-primary" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform",
                        protectOn ? "left-5" : "left-0.5",
                      )}
                    />
                  </button>
                  <span className="text-xs text-muted-foreground">{activateLabel}</span>
                  <a
                    href="#features"
                    className="ml-auto inline-flex items-center gap-1 text-xs font-medium text-foreground transition hover:text-primary"
                  >
                    {learnMoreLabel}
                    <ArrowUpRight className="size-3.5" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
