/**
 * Tiny in-memory fixed-window rate limiter. Zero dependencies — good enough
 * for a single-instance app. Keys are pruned lazily on access; the map stays
 * bounded in practice (one owner, a handful of IPs).
 */
export function createRateLimiter(windowMs: number, max: number) {
  const hits = new Map<string, number[]>();
  return {
    check(key: string): { allowed: boolean; retryAfterSecs: number } {
      const now = Date.now();
      const cutoff = now - windowMs;
      const arr = (hits.get(key) ?? []).filter((t) => t > cutoff);
      if (arr.length >= max) {
        hits.set(key, arr);
        return {
          allowed: false,
          retryAfterSecs: Math.ceil((arr[0] + windowMs - now) / 1000),
        };
      }
      arr.push(now);
      hits.set(key, arr);
      return { allowed: true, retryAfterSecs: 0 };
    },
  };
}
