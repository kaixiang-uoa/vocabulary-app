import { globalCacheManager, CacheManager } from "../utils/cacheManager";

describe("Cache Manager Tests", () => {
  beforeEach(() => {
    // Clear cache before each test
    globalCacheManager.clear();
  });

  describe("Basic Operations", () => {
    test("should store and retrieve simple data", () => {
      const testData = { message: "Hello World" };

      globalCacheManager.set("simple-key", testData);
      const retrieved = globalCacheManager.get("simple-key");

      expect(retrieved).toEqual(testData);
    });

    test("should store and retrieve complex data", () => {
      const complexData = {
        units: [
          {
            id: "unit-1",
            name: "Test Unit",
            words: [
              { id: "word-1", word: "hello", meaning: "你好", mastered: false },
            ],
          },
        ],
      };

      globalCacheManager.set("complex-key", complexData);
      const retrieved = globalCacheManager.get("complex-key");

      expect(retrieved).toEqual(complexData);
      expect((retrieved as any).units[0].words[0].word).toBe("hello");
    });

    test("should return null for non-existent keys", () => {
      const result = globalCacheManager.get("non-existent");
      expect(result).toBeNull();
    });

    test("should check if key exists", () => {
      expect(globalCacheManager.has("test-key")).toBe(false);

      globalCacheManager.set("test-key", "test-value");
      expect(globalCacheManager.has("test-key")).toBe(true);
    });

    test("should delete specific keys", () => {
      globalCacheManager.set("key1", "value1");
      globalCacheManager.set("key2", "value2");

      expect(globalCacheManager.has("key1")).toBe(true);
      expect(globalCacheManager.has("key2")).toBe(true);

      globalCacheManager.delete("key1");

      expect(globalCacheManager.has("key1")).toBe(false);
      expect(globalCacheManager.has("key2")).toBe(true);
    });
  });

  describe("TTL (Time To Live)", () => {
    test("should respect TTL settings", async () => {
      const testData = { message: "TTL Test" };

      // Set with 50ms TTL
      globalCacheManager.set("ttl-test", testData, 50);

      // Should be available immediately
      expect(globalCacheManager.get("ttl-test")).toEqual(testData);

      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 60));

      // Should be expired
      expect(globalCacheManager.get("ttl-test")).toBeNull();
    });

    test("should use default TTL when not specified", async () => {
      const testData = { message: "Default TTL" };

      // Set without TTL (uses default 5 minutes)
      globalCacheManager.set("default-ttl", testData);

      // Should be available immediately
      expect(globalCacheManager.get("default-ttl")).toEqual(testData);

      // Should still be available after short wait (much less than 5 minutes)
      await new Promise((resolve) => setTimeout(resolve, 10));
      expect(globalCacheManager.get("default-ttl")).toEqual(testData);
    });

    test("should handle zero TTL (immediate expiration)", async () => {
      const testData = { message: "Zero TTL" };

      globalCacheManager.set("zero-ttl", testData, 0);

      // Should expire immediately
      expect(globalCacheManager.get("zero-ttl")).toBeNull();
    });
  });

  describe("Cache Eviction", () => {
    test("should evict items when cache is full", () => {
      const cache = new CacheManager(3); // Max 3 items

      // Add 4 items
      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");
      cache.set("key4", "value4");

      // Should have evicted some items (implementation dependent)
      expect(cache.size()).toBeLessThanOrEqual(3);
    });

    test("should handle cache size limits", () => {
      const cache = new CacheManager(2);

      cache.set("key1", "value1");
      cache.set("key2", "value2");
      cache.set("key3", "value3");

      expect(cache.size()).toBeLessThanOrEqual(2);
    });
  });

  describe("Cache Statistics", () => {
    test("should track cache statistics", () => {
      const cache = new CacheManager(10);

      // Initial stats
      const initialStats = cache.getStats();
      expect(initialStats.size).toBe(0);
      expect(initialStats.maxSize).toBe(10);
      expect(initialStats.hitRate).toBe(0);

      // Add items
      cache.set("key1", "value1");
      cache.set("key2", "value2");

      const statsAfterAdd = cache.getStats();
      expect(statsAfterAdd.size).toBe(2);
      expect(statsAfterAdd.maxSize).toBe(10);
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid data gracefully", () => {
      // Test with undefined
      expect(() => globalCacheManager.set("test", undefined)).not.toThrow();

      // Test with null
      expect(() => globalCacheManager.set("test", null)).not.toThrow();

      // Test with circular reference
      const circular: any = {};
      circular.self = circular;

      // Should handle circular reference gracefully
      expect(() => globalCacheManager.set("circular", circular)).not.toThrow();
    });

    test("should handle invalid keys", () => {
      // Test with empty key
      expect(() => globalCacheManager.set("", "value")).not.toThrow();

      // Test with null key
      expect(() => globalCacheManager.set(null as any, "value")).not.toThrow();

      // Test with undefined key
      expect(() =>
        globalCacheManager.set(undefined as any, "value"),
      ).not.toThrow();
    });

    test("should handle storage errors gracefully", () => {
      // Mock localStorage to throw error
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = jest.fn().mockImplementation(() => {
        throw new Error("Storage quota exceeded");
      });

      // Should not crash
      expect(() => globalCacheManager.set("test", "value")).not.toThrow();

      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });

  describe("Memory Management", () => {
    test("should not leak memory with large objects", () => {
      const largeObject = {
        data: "x".repeat(10000), // 10KB string
        timestamp: Date.now(),
      };

      // Add multiple large objects
      for (let i = 0; i < 10; i++) {
        globalCacheManager.set(`large-${i}`, largeObject);
      }

      // Should handle large objects without issues
      expect(globalCacheManager.getStats().size).toBe(10);

      // Clear cache
      globalCacheManager.clear();
      expect(globalCacheManager.getStats().size).toBe(0);
    });

    test("should cleanup expired items", async () => {
      // Add items with different TTLs
      globalCacheManager.set("expire-1", "value1", 10);
      globalCacheManager.set("expire-2", "value2", 20);
      globalCacheManager.set("persistent", "value3", 60000); // 1 minute

      expect(globalCacheManager.getStats().size).toBe(3);

      // Wait for first item to expire
      await new Promise((resolve) => setTimeout(resolve, 15));

      // Trigger cleanup by accessing cache
      globalCacheManager.get("persistent");

      // Should have cleaned up expired items
      expect(globalCacheManager.get("expire-1")).toBeNull();
      // Note: expire-2 might still be valid depending on timing
      expect(globalCacheManager.get("persistent")).toBe("value3");
    });
  });

  describe("Concurrent Access", () => {
    test("should handle concurrent set operations", async () => {
      const promises = [];

      // Simulate concurrent set operations
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise<void>((resolve) => {
            setTimeout(() => {
              globalCacheManager.set(`concurrent-${i}`, `value-${i}`);
              resolve();
            }, Math.random() * 10);
          }),
        );
      }

      await Promise.all(promises);

      // All items should be set correctly
      for (let i = 0; i < 10; i++) {
        expect(globalCacheManager.get(`concurrent-${i}`)).toBe(`value-${i}`);
      }
    });

    test("should handle concurrent get operations", async () => {
      // Set up test data
      globalCacheManager.set("concurrent-test", "test-value");

      const promises = [];

      // Simulate concurrent get operations
      for (let i = 0; i < 10; i++) {
        promises.push(
          new Promise<string | null>((resolve) => {
            setTimeout(() => {
              const result = globalCacheManager.get("concurrent-test") as
                | string
                | null;
              resolve(result);
            }, Math.random() * 10);
          }),
        );
      }

      const results = await Promise.all(promises);

      // All results should be the same
      results.forEach((result) => {
        expect(result).toBe("test-value");
      });
    });
  });
});
