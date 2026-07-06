"use client";

import type { SupabaseClient } from "@supabase/supabase-js";
import { getAppPlatform, getOAuthRedirectUrl, isCapacitorNative } from "./platform";

type AuthResult = { error?: string };

async function signInWithGoogleNative(
  supabase: SupabaseClient,
  locale: string,
): Promise<AuthResult> {
  try {
    const { GoogleAuth } = await import("@codetrix-studio/capacitor-google-auth");
    await GoogleAuth.initialize({
      clientId: process.env.NEXT_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? "",
      scopes: ["profile", "email"],
      grantOfflineAccess: false,
    });
    const result = await GoogleAuth.signIn();
    const idToken = result.authentication?.idToken;
    if (!idToken) return { error: "Google sign-in did not return an ID token." };
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "google",
      token: idToken,
    });
    if (error) return { error: error.message };
    window.location.href = `/${locale}/dashboard`;
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Google sign-in failed." };
  }
}

async function signInWithAppleNative(
  supabase: SupabaseClient,
  locale: string,
): Promise<AuthResult> {
  try {
    const { SignInWithApple } = await import("@capacitor-community/apple-sign-in");
    const result = await SignInWithApple.authorize({
      clientId: "com.clartas.app",
      redirectURI: getOAuthRedirectUrl(locale),
      scopes: "email name",
    });
    const idToken = result.response?.identityToken;
    if (!idToken) return { error: "Apple sign-in did not return an identity token." };
    const { error } = await supabase.auth.signInWithIdToken({
      provider: "apple",
      token: idToken,
    });
    if (error) return { error: error.message };
    window.location.href = `/${locale}/dashboard`;
    return {};
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Apple sign-in failed." };
  }
}

async function signInWithOAuthWeb(
  supabase: SupabaseClient,
  provider: "google" | "apple",
  locale: string,
): Promise<AuthResult> {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin;
  const redirectTo = `${appUrl}/auth/callback?next=/${locale}/dashboard`;
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      ...(provider === "apple" ? { scopes: "name email" } : {}),
    },
  });
  if (error) return { error: error.message };
  if (data.url) window.location.href = data.url;
  return {};
}

export async function signInWithGoogle(
  supabase: SupabaseClient,
  locale: string,
): Promise<AuthResult> {
  if (isCapacitorNative()) {
    return signInWithGoogleNative(supabase, locale);
  }
  return signInWithOAuthWeb(supabase, "google", locale);
}

export async function signInWithApple(
  supabase: SupabaseClient,
  locale: string,
): Promise<AuthResult> {
  const platform = getAppPlatform();
  if (platform === "ios" || (platform === "web" && !isCapacitorNative())) {
    if (platform === "ios" && isCapacitorNative()) {
      return signInWithAppleNative(supabase, locale);
    }
    return signInWithOAuthWeb(supabase, "apple", locale);
  }
  return signInWithOAuthWeb(supabase, "apple", locale);
}

export function isAppleSignInAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const platform = getAppPlatform();
  if (platform === "ios") return true;
  if (platform === "web") {
    const ua = navigator.userAgent;
    return /iPhone|iPad|iPod|Macintosh/.test(ua);
  }
  return true;
}
