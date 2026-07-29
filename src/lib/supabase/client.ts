"use client";

import { createBrowserClient } from "@supabase/ssr";
import { env, isSupabaseConfigured } from "@/lib/env";

/**
 * Browser Supabase client (uses the public anon key only).
 * Safe to import in client components. Returns null when not configured so the
 * UI can render in a graceful "demo" state without crashing.
 */
export function createClient() {
  if (!isSupabaseConfigured) return null;

  try {
    const hasValidUrl = /^https?:\/\//i.test(env.supabaseUrl);
    const hasKey = Boolean(env.supabaseAnonKey && env.supabaseAnonKey.startsWith("ey"));

    if (!hasValidUrl || !hasKey) {
      return null;
    }

    return createBrowserClient(env.supabaseUrl, env.supabaseAnonKey);
  } catch {
    return null;
  }
}
