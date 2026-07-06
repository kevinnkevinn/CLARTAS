import { cacheGet, cacheSet } from "@/lib/cache";

const buckets = new Map<string, { count: number; resetAt: number }>();

async function redisIncr(key: string, windowMs: number): Promise<{ count: number; ok: boolean } | null> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const windowSec = Math.ceil(windowMs / 1000);
  const res = await fetch(`${url}/pipeline`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      ["INCR", key],
      ["EXPIRE", key, windowSec, "NX"],
    ]),
  });
  if (!res.ok) return null;
  const data = (await res.json()) as { result?: [number, unknown][] };
  const count = data.result?.[0]?.[1];
  return typeof count === "number" ? { count, ok: true } : null;
}

/** Distributed rate limit with in-memory fallback. */
export async function checkRateLimit(
  key: string,
  limit = 30,
  windowMs = 60_000,
): Promise<{ ok: boolean; remaining: number }> {
  const redisKey = `rl:${key}`;
  const redis = await redisIncr(redisKey, windowMs);
  if (redis) {
    const remaining = Math.max(0, limit - redis.count);
    return { ok: redis.count <= limit, remaining };
  }

  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now > entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1 };
  }

  if (entry.count >= limit) {
    return { ok: false, remaining: 0 };
  }

  entry.count += 1;
  return { ok: true, remaining: limit - entry.count };
}

/** Cached read helper for hot paths (credits, workspace name). */
export async function cachedValue<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const hit = await cacheGet(key);
  if (hit) {
    try {
      return JSON.parse(hit) as T;
    } catch {
      /* refetch */
    }
  }
  const value = await fetcher();
  await cacheSet(key, JSON.stringify(value), ttlSeconds);
  return value;
}
