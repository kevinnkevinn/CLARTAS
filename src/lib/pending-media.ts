const PENDING_MEDIA_KEYS = {
  image: "clartas-pending-image",
  video: "clartas-pending-video",
} as const;

export type PendingMediaKind = keyof typeof PENDING_MEDIA_KEYS;

export function savePendingMedia(url: string, kind: PendingMediaKind) {
  if (typeof window === "undefined") return;

  const currentKey = PENDING_MEDIA_KEYS[kind];
  const otherKey = PENDING_MEDIA_KEYS[kind === "image" ? "video" : "image"];

  try {
    // Data URLs can easily exceed sessionStorage quota.
    if (url.startsWith("data:")) {
      sessionStorage.removeItem(currentKey);
      sessionStorage.removeItem(otherKey);
      return;
    }

    sessionStorage.setItem(currentKey, url);
    sessionStorage.removeItem(otherKey);
  } catch {
    // Best-effort persistence only; navigation should still continue.
  }
}

export function loadPendingMedia(kind: PendingMediaKind) {
  if (typeof window === "undefined") return null;

  try {
    return sessionStorage.getItem(PENDING_MEDIA_KEYS[kind]);
  } catch {
    return null;
  }
}