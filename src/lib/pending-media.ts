const PENDING_MEDIA_KEYS = {
  image: "clartas-pending-image",
  video: "clartas-pending-video",
} as const;

const DB_NAME = "clartas-pending-media";
const STORE_NAME = "files";

export type PendingMediaKind = keyof typeof PENDING_MEDIA_KEYS;

interface PendingMediaEntry {
  kind: PendingMediaKind;
  url?: string;
  fileId?: string;
}

function isIndexedDbAvailable() {
  return typeof window !== "undefined" && "indexedDB" in window;
}

function openPendingMediaDb(): Promise<IDBDatabase | null> {
  if (!isIndexedDbAvailable()) return Promise.resolve(null);

  return new Promise((resolve) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function writePendingFile(fileId: string, file: Blob) {
  const db = await openPendingMediaDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(file, fileId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

async function readPendingFile(fileId: string) {
  const db = await openPendingMediaDb();
  if (!db) return null;

  return new Promise<Blob | null>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(fileId);
    request.onsuccess = () => resolve((request.result as Blob | undefined) ?? null);
    request.onerror = () => resolve(null);
  });
}

async function deletePendingFile(fileId: string) {
  const db = await openPendingMediaDb();
  if (!db) return;

  await new Promise<void>((resolve) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(fileId);
    tx.oncomplete = () => resolve();
    tx.onerror = () => resolve();
    tx.onabort = () => resolve();
  });
}

function readEntry(kind: PendingMediaKind) {
  if (typeof window === "undefined") return null;

  try {
    const raw = sessionStorage.getItem(PENDING_MEDIA_KEYS[kind]);
    if (!raw) return null;

    if (!raw.startsWith("{")) {
      return { kind, url: raw } satisfies PendingMediaEntry;
    }

    return JSON.parse(raw) as PendingMediaEntry;
  } catch {
    return null;
  }
}

function writeEntry(kind: PendingMediaKind, entry: PendingMediaEntry) {
  sessionStorage.setItem(PENDING_MEDIA_KEYS[kind], JSON.stringify(entry));
}

export async function savePendingMedia(url: string, kind: PendingMediaKind, file?: Blob | null) {
  if (typeof window === "undefined") return;

  const currentKey = PENDING_MEDIA_KEYS[kind];
  const otherKey = PENDING_MEDIA_KEYS[kind === "image" ? "video" : "image"];

  try {
    if ((url.startsWith("blob:") || url.startsWith("data:")) && file) {
      const fileId = `${kind}-${crypto.randomUUID()}`;
      await writePendingFile(fileId, file);
      writeEntry(kind, { kind, fileId });
    } else {
      writeEntry(kind, { kind, url });
    }

    sessionStorage.removeItem(otherKey);
  } catch {
    // Best-effort persistence only; navigation should still continue.
  }
}

export async function loadPendingMedia(kind: PendingMediaKind) {
  const entry = readEntry(kind);
  if (!entry) return null;

  if (entry.url) return entry.url;
  if (!entry.fileId) return null;

  const file = await readPendingFile(entry.fileId);
  if (!file) return null;
  return URL.createObjectURL(file);
}

export async function clearPendingMedia(kind: PendingMediaKind) {
  const entry = readEntry(kind);
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(PENDING_MEDIA_KEYS[kind]);
    if (entry?.fileId) {
      await deletePendingFile(entry.fileId);
    }
  } catch {
    // Best-effort cleanup only.
  }
}