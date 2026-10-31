interface CacheEntry<T> {
  data: T;
  createdAt: number;
  expiresAt: number;
  staleUntil: number;
}

export class InMemoryCache {
  private cache = new Map<string, CacheEntry<unknown>>();

  /**
   * Set value with fresh TTL and stale grace period (default 10 mins after fresh TTL)
   */
  set<T>(key: string, data: T, ttlSeconds = 60, staleGraceSeconds = 600): void {
    const now = Date.now();
    this.cache.set(key, {
      data,
      createdAt: now,
      expiresAt: now + ttlSeconds * 1000,
      staleUntil: now + (ttlSeconds + staleGraceSeconds) * 1000,
    });
  }

  get<T>(key: string): { data: T; isStale: boolean; updatedAt: string } | null {
    const entry = this.cache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.staleUntil) {
      this.cache.delete(key);
      return null;
    }

    const isStale = now > entry.expiresAt;
    return {
      data: entry.data,
      isStale,
      updatedAt: new Date(entry.createdAt).toISOString(),
    };
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const globalCache = new InMemoryCache();
