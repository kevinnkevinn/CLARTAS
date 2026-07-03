/**
 * Deteksi platform: native Capacitor (Android/iOS) vs web/PWA (Chrome).
 */
export type AppPlatform = "android" | "ios" | "web";

export function isCapacitorNative(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as Window & { Capacitor?: { isNativePlatform?: () => boolean } })
    .Capacitor;
  return Boolean(cap?.isNativePlatform?.());
}

export function getAppPlatform(): AppPlatform {
  if (typeof window === "undefined") return "web";
  if (!isCapacitorNative()) return "web";
  const platform = (
    window as Window & { Capacitor?: { getPlatform?: () => string } }
  ).Capacitor?.getPlatform?.();
  if (platform === "ios") return "ios";
  if (platform === "android") return "android";
  return "web";
}

export function getOAuthRedirectUrl(locale: string, path = "/dashboard"): string {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "";
  if (isCapacitorNative()) {
    return `com.clartas.app://auth/callback?next=/${locale}${path}`;
  }
  const base = appUrl || (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/${locale}${path}`;
}

export function getAppStoreUrl(): string | null {
  return process.env.NEXT_PUBLIC_IOS_APP_STORE_URL ?? null;
}

export function getPlayStoreUrl(): string | null {
  return process.env.NEXT_PUBLIC_ANDROID_PLAY_STORE_URL ?? null;
}
