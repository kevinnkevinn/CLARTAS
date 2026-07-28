import { cacheDelete, cacheGetJson, cacheSetJson } from "@/lib/cache";

const MAX_FAILED_SIGN_IN_ATTEMPTS = 5;
const ATTEMPT_TTL_SECONDS = 60 * 60 * 24;

type AttemptState = {
  count: number;
};

function getAttemptsKey(email: string) {
  return `auth:signin:attempts:${email.toLowerCase()}`;
}

export function getSignInAttemptsLimit() {
  return MAX_FAILED_SIGN_IN_ATTEMPTS;
}

export async function getFailedSignInAttempts(email: string) {
  const key = getAttemptsKey(email);
  const state = await cacheGetJson<AttemptState>(key);
  return typeof state?.count === "number" ? state.count : 0;
}

export async function registerFailedSignInAttempt(email: string) {
  const key = getAttemptsKey(email);
  const current = await getFailedSignInAttempts(email);
  const next = Math.min(current + 1, MAX_FAILED_SIGN_IN_ATTEMPTS);
  await cacheSetJson(key, { count: next }, ATTEMPT_TTL_SECONDS);
  return next;
}

export async function clearFailedSignInAttempts(email: string) {
  const key = getAttemptsKey(email);
  await cacheDelete(key);
}
