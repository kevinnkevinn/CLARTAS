"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Paddle?: {
      Environment?: { set: (env: string) => void };
      Setup: (opts: { token: string }) => void;
      Checkout: { open: (opts: Record<string, unknown>) => void };
    };
  }
}

interface CheckoutButtonProps {
  priceId?: string;
  userId: string;
  email: string;
  label: string;
  variant?: "default" | "outline";
}

const PADDLE_JS = "https://cdn.paddle.com/paddle/v2/paddle.js";

/**
 * Loads Paddle.js on demand and opens an overlay checkout. Falls back to a
 * disabled state with guidance when the client token / price id is missing.
 */
export function CheckoutButton({
  priceId,
  userId,
  email,
  label,
  variant = "default",
}: CheckoutButtonProps) {
  const t = useTranslations("common");
  const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  const paddleEnv = process.env.NEXT_PUBLIC_PADDLE_ENV ?? "sandbox";
  const [ready, setReady] = useState(false);

  const configured = Boolean(token && priceId);

  useEffect(() => {
    if (!configured) return;
    if (window.Paddle) {
      setReady(true);
      return;
    }
    const script = document.createElement("script");
    script.src = PADDLE_JS;
    script.onload = () => {
      if (window.Paddle && token) {
        if (paddleEnv === "sandbox") window.Paddle.Environment?.set("sandbox");
        window.Paddle.Setup({ token });
        setReady(true);
      }
    };
    document.body.appendChild(script);
  }, [configured, token, paddleEnv]);

  const openCheckout = useCallback(() => {
    if (!window.Paddle || !priceId) return;
    window.Paddle.Checkout.open({
      items: [{ priceId, quantity: 1 }],
      customer: { email },
      customData: { user_id: userId },
    });
  }, [priceId, email, userId]);

  if (!configured) {
    return (
      <Button variant="outline" disabled className="w-full" title="Configure Paddle to enable checkout">
        {t("comingSoon")}
      </Button>
    );
  }

  return (
    <Button variant={variant} className="w-full" disabled={!ready} onClick={openCheckout}>
      {label}
    </Button>
  );
}
