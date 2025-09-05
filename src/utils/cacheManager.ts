// Cache entry interface
interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

// Cache manager for intelligent data caching
export class CacheManager {
  private cache = new Map<string, CacheEntry>();
  private maxSize: number;
  private defaultTTL: number;

  constructor(maxSize: number = 100, defaultTTL: number = 300000) {
    this.maxSize = maxSize;
    this.defaultTTL = defaultTTL; // 5 minutes default
  }

  /**
   * Get data from cache
   */
  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    if (entry && !this.isExpired(entry)) {
      return entry.data as T;
    }

    // Remove expired entry
    if (entry) {
      this.cache.delete(key);
    }

    return null;
  }

  /**
   * Set data in cache
   */
  set<T>(key: string, data: T, ttl?: number): void {
    // Evict oldest entries if cache is full
    if (this.cache.size >= this.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl: ttl !== undefined ? ttl : this.defaultTTL,
    });
  }

  /**
   * Check if key exists and is not expired
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    return entry !== undefined && !this.isExpired(entry);
  }

  /**
   * Remove specific key from cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Get cache statistics
   */
  getStats(): { size: number; maxSize: number; hitRate: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxSize,
      hitRate: 0, // TODO: Implement hit rate tracking
    };
  }

  /**
   * Check if cache entry is expired
   */
  private isExpired(entry: CacheEntry): boolean {
    // If TTL is 0, entry expires immediately
    if (entry.ttl === 0) return true;
    return Date.now() - entry.timestamp > entry.ttl;
  }

  /**
   * Evict oldest entries from cache
   */
  private evictOldest(): void {
    const entries = Array.from(this.cache.entries());
    const sortedEntries = entries.sort(
      (a, b) => a[1].timestamp - b[1].timestamp
    );

    // Remove 20% of oldest entries
    const toRemove = Math.ceil(this.maxSize * 0.2);
    for (let i = 0; i < toRemove && i < sortedEntries.length; i++) {
      this.cache.delete(sortedEntries[i][0]);
    }
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const keysToDelete: string[] = [];

    for (const [key, entry] of Array.from(this.cache.entries())) {
      if (this.isExpired(entry)) {
        keysToDelete.push(key);
      }
    }

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

// Singleton instance for global use
export const globalCacheManager = new CacheManager();

// Cache keys constants
export const CACHE_KEYS = {
  UNITS: 'units',
  UNIT: (id: string) => `unit:${id}`,
  WORDS: (unitId: string) => `words:${unitId}`,
  STATISTICS: 'statistics',
  USER_DATA: 'user_data',
} as const;
