export interface PolledJobResult {
  jobId: string;
  status: string;
  output?: Record<string, unknown>;
  error?: string;
  mock?: boolean;
}

/** Poll async AI job until succeeded, failed, or timeout. */
export async function pollAIJob(
  pollUrl: string,
  opts: { maxAttempts?: number; intervalMs?: number } = {},
): Promise<PolledJobResult> {
  const maxAttempts = opts.maxAttempts ?? 90;
  const intervalMs = opts.intervalMs ?? 1500;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const res = await fetch(pollUrl, { cache: "no-store" });
    const data = (await res.json()) as PolledJobResult;
    if (!res.ok) throw new Error(data.error ?? "poll_failed");
    if (data.status === "succeeded") return data;
    if (data.status === "failed") throw new Error(data.error ?? "processing_failed");
    await new Promise((r) => setTimeout(r, intervalMs));
  }
  throw new Error("job_timeout");
}
