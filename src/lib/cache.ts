/**
 * TTL cache with optional Upstash Redis. Falls back to in-memory for local dev.
 */

const memory = new Map<string, { value: string; expiresAt: number }>();

function memoryGet(key: string): string | null {
  const entry = memory.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    memory.delete(key);
    return null;
  }
  return entry.value;
}

function memorySet(key: string, value: string, ttlSeconds: number): void {
  memory.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

async function redisFetch(
  method: "GET" | "SET",
  key: string,
  value?: string,
  ttlSeconds?: number,
): Promise<string | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return method === "GET" ? null : null;

  if (method === "GET") {
    const res = await fetch(`${url}/get/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { result?: string | null };
    return data.result ?? null;
  }

  const res = await fetch(`${url}/set/${encodeURIComponent(key)}/${encodeURIComponent(value!)}?EX=${ttlSeconds}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok ? "OK" : null;
}

export async function cacheGet(key: string): Promise<string | null> {
  const fromRedis = await redisFetch("GET", key);
  if (fromRedis !== null) return fromRedis;
  return memoryGet(key);
}

export async function cacheSet(key: string, value: string, ttlSeconds: number): Promise<void> {
  memorySet(key, value, ttlSeconds);
  await redisFetch("SET", key, value, ttlSeconds);
}

export async function cacheDelete(key: string): Promise<void> {
  memory.delete(key);
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return;
  await fetch(`${url}/del/${encodeURIComponent(key)}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const raw = await cacheGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await cacheSet(key, JSON.stringify(value), ttlSeconds);
}
