/**
 * Minimal in-memory, per-IP rate limiter for the public API routes.
 *
 * Good enough for local development and a small single-instance deployment.
 * On serverless platforms (Vercel) each instance keeps its own counters, so
 * this is a soft limit only – for real production traffic move the counters
 * to a shared store such as Vercel KV, Upstash Redis, or a Postgres table.
 * Only this file would need to change; the route handlers stay as they are.
 */
import type { NextRequest } from "next/server";

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 5000;

function clientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || "local";
}

/**
 * Returns true if the request is within the limit, false if it should be
 * rejected with 429. `name` separates counters per endpoint.
 */
export function rateLimit(
  req: NextRequest,
  name: string,
  limit: number,
  windowMs: number
): boolean {
  const now = Date.now();

  // Opportunistic cleanup so the map cannot grow without bound.
  if (buckets.size > MAX_BUCKETS) {
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }

  const key = `${name}:${clientIp(req)}`;
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  bucket.count += 1;
  return bucket.count <= limit;
}

export const RATE_LIMITED_MESSAGE =
  "Zu viele Anfragen. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
