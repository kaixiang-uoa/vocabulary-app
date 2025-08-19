// Cache hook for React components
import { useCallback, useMemo } from "react";
import { globalCacheManager, CACHE_KEYS } from "../utils/cacheManager";

interface UseCacheOptions {
  ttl?: number;
  key: string;
}

interface UseCacheReturn<T> {
  get: () => T | null;
  set: (data: T) => void;
  has: () => boolean;
  delete: () => boolean;
  clear: () => void;
}

/**
 * Hook for managing cache in React components
 */
export const useCache = <T>(options: UseCacheOptions): UseCacheReturn<T> => {
  const { key, ttl } = options;

  const get = useCallback((): T | null => {
    return globalCacheManager.get<T>(key);
  }, [key]);

  const set = useCallback(
    (data: T): void => {
      globalCacheManager.set<T>(key, data, ttl);
    },
    [key, ttl],
  );

  const has = useCallback((): boolean => {
    return globalCacheManager.has(key);
  }, [key]);

  const deleteCache = useCallback((): boolean => {
    return globalCacheManager.delete(key);
  }, [key]);

  const clear = useCallback((): void => {
    globalCacheManager.clear();
  }, []);

  return useMemo(
    () => ({
      get,
      set,
      has,
      delete: deleteCache,
      clear,
    }),
    [get, set, has, deleteCache, clear],
  );
};

/**
 * Hook for caching async data with automatic loading state
 */
export const useAsyncCache = <T>(
  key: string,
  fetcher: () => Promise<T>,
  options: { ttl?: number } = {},
) => {
  const { ttl } = options;
  const cache = useCache<T>({ key, ttl });

  const getData = useCallback(async (): Promise<T> => {
    // Check cache first
    const cached = cache.get();
    if (cached) {
      return cached;
    }

    // Fetch from source if not cached
    const data = await fetcher();
    cache.set(data);
    return data;
  }, [cache, fetcher]);

  const invalidate = useCallback(() => {
    cache.delete();
  }, [cache]);

  return {
    getData,
    invalidate,
    hasCached: cache.has,
    getCached: cache.get,
  };
};

/**
 * Predefined cache hooks for common data types
 */
export const useUnitsCache = () => useCache({ key: CACHE_KEYS.UNITS });
export const useUnitCache = (unitId: string) =>
  useCache({ key: CACHE_KEYS.UNIT(unitId) });
export const useWordsCache = (unitId: string) =>
  useCache({ key: CACHE_KEYS.WORDS(unitId) });
export const useStatisticsCache = () =>
  useCache({ key: CACHE_KEYS.STATISTICS });
