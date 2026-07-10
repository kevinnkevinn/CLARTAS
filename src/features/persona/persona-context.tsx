"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { PERSONA_MARKETPLACE, type MarketplaceId } from "@/lib/marketplace/constants";

const STORAGE_KEY = "clartas-persona";

export interface PersonaState {
  personaId: string;
  marketplaceId: MarketplaceId;
}

const DEFAULT: PersonaState = { personaId: "shopee", marketplaceId: "shopee" };

const PersonaContext = createContext<{
  persona: PersonaState;
  setPersona: (id: string) => void;
} | null>(null);

export function PersonaProvider({ children }: { children: ReactNode }) {
  const [persona, setPersonaState] = useState<PersonaState>(DEFAULT);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as PersonaState;
        setPersonaState(parsed);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const setPersona = useCallback((personaId: string) => {
    const marketplaceId = PERSONA_MARKETPLACE[personaId] ?? "general";
    const next = { personaId, marketplaceId };
    setPersonaState(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }, []);

  return (
    <PersonaContext.Provider value={{ persona, setPersona }}>{children}</PersonaContext.Provider>
  );
}

export function usePersona() {
  const ctx = useContext(PersonaContext);
  if (!ctx) throw new Error("usePersona must be used within PersonaProvider");
  return ctx;
}

export function readPersonaMarketplace(): MarketplaceId {
  if (typeof window === "undefined") return "general";
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return (JSON.parse(stored) as PersonaState).marketplaceId ?? "general";
  } catch {
    /* ignore */
  }
  return "general";
}
