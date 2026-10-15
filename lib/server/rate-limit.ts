// In-memory fixed-window counters. Good enough for a single server process; a multi-instance
// deployment would need a shared store (e.g. Redis) because each process keeps its own counts.

interface Window {
  count: number
  resetAt: number
}

const globalForLimits = globalThis as unknown as { mrittikaRateLimits?: Map<string, Window> }
const windows = (globalForLimits.mrittikaRateLimits ??= new Map<string, Window>())

/** Seconds until the key may try again, or 0 if it is under the limit. Does not count an attempt. */
export function retryAfter(key: string, limit: number): number {
  const w = windows.get(key)
  if (!w || w.resetAt <= Date.now()) return 0
  return w.count >= limit ? Math.ceil((w.resetAt - Date.now()) / 1000) : 0
}

export function recordAttempt(key: string, windowMs: number): void {
  const now = Date.now()
  const w = windows.get(key)
  if (!w || w.resetAt <= now) windows.set(key, { count: 1, resetAt: now + windowMs })
  else w.count += 1
}

export function clearAttempts(key: string): void {
  windows.delete(key)
}

export function clientIp(request: Request): string {
  return request.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown'
}
