"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  detectLiteDevice,
  getLimits,
  LITE_STORAGE_KEY,
  readLitePreference,
  type PerformanceLimits,
} from "./config";

interface LiteModeContextValue {
  lite: boolean;
  limits: PerformanceLimits;
  setLite: (enabled: boolean) => void;
}

const LiteModeContext = createContext<LiteModeContextValue | null>(null);

export function LiteModeProvider({ children }: { children: React.ReactNode }) {
  const [lite, setLiteState] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const pref = readLitePreference();
    setLiteState(pref ?? detectLiteDevice());
    setReady(true);
  }, []);

  const setLite = useCallback((enabled: boolean) => {
    setLiteState(enabled);
    localStorage.setItem(LITE_STORAGE_KEY, String(enabled));
    document.documentElement.classList.toggle("lite-mode", enabled);
  }, []);

  useEffect(() => {
    if (!ready) return;
    document.documentElement.classList.toggle("lite-mode", lite);
  }, [lite, ready]);

  const limits = useMemo(() => getLimits(lite), [lite]);
  const value = useMemo(() => ({ lite, limits, setLite }), [lite, limits, setLite]);

  return <LiteModeContext.Provider value={value}>{children}</LiteModeContext.Provider>;
}

export function useLiteMode(): LiteModeContextValue {
  const ctx = useContext(LiteModeContext);
  if (!ctx) {
    return {
      lite: false,
      limits: getLimits(false),
      setLite: () => {},
    };
  }
  return ctx;
}
