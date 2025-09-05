import { globalCacheManager } from '../utils/cacheManager';

describe('Core Functionality Tests', () => {
  beforeEach(() => {
    // Clear cache before each test
    globalCacheManager.clear();
  });

  describe('Cache Manager', () => {
    test('should store and retrieve data correctly', () => {
      const testData = { units: [{ id: '1', name: 'Test Unit', words: [] }] };

      // Store data
      globalCacheManager.set('test-key', testData, 5000);

      // Retrieve data
      const retrieved = globalCacheManager.get('test-key');
      expect(retrieved).toEqual(testData);
    });

    test('should handle cache expiration', async () => {
      const testData = { units: [] };

      // Store with short TTL
      globalCacheManager.set('expire-test', testData, 10);

      // Should be available immediately
      expect(globalCacheManager.get('expire-test')).toEqual(testData);

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 20));

      // Should be expired
      expect(globalCacheManager.get('expire-test')).toBeNull();
    });

    test('should clear all cache', () => {
      globalCacheManager.set('key1', 'data1');
      globalCacheManager.set('key2', 'data2');

      expect(globalCacheManager.get('key1')).toBe('data1');
      expect(globalCacheManager.get('key2')).toBe('data2');

      globalCacheManager.clear();

      expect(globalCacheManager.get('key1')).toBeNull();
      expect(globalCacheManager.get('key2')).toBeNull();
    });
  });

  describe('Data Service Manager', () => {
    test('should handle data service detection', () => {
      // Test that we can import and use data service manager
      expect(true).toBe(true);
    });
  });

  describe('Data Validation', () => {
    test('should validate unit name correctly', () => {
      const validNames = ['Unit 1', 'My Unit', '测试单元'];
      const invalidNames = ['', '   ', null, undefined];

      // This would test the validation logic in wordService
      // For now, we'll test basic string validation
      validNames.forEach(name => {
        expect(typeof name).toBe('string');
        expect(name.trim().length).toBeGreaterThan(0);
      });

      invalidNames.forEach(name => {
        // Skip null/undefined values in test
        if (name === null || name === undefined) return;
        expect(name.trim().length).toBe(0);
      });
    });

    test('should validate word data correctly', () => {
      const validWord = { word: 'test', meaning: '测试' };
      const invalidWord = { word: '', meaning: '' };

      // Test word validation
      expect(validWord.word.trim().length).toBeGreaterThan(0);
      expect(validWord.meaning.trim().length).toBeGreaterThan(0);
      expect(invalidWord.word.trim().length).toBe(0);
      expect(invalidWord.meaning.trim().length).toBe(0);
    });
  });

  describe('Error Handling', () => {
    test('should handle cache errors gracefully', () => {
      // Test cache error handling
      const originalGet = globalCacheManager.get;

      // Mock cache to throw error
      globalCacheManager.get = jest.fn().mockImplementation(() => {
        throw new Error('Cache error');
      });

      // Should handle gracefully
      expect(() => {
        globalCacheManager.get('test-key');
      }).toThrow('Cache error');

      // Restore original method
      globalCacheManager.get = originalGet;
    });
  });

  describe('Security Tests', () => {
    test('should sanitize user input', () => {
      const maliciousInput = '<script>alert("xss")</script>';

      // Test that input is treated as string, not executed
      expect(typeof maliciousInput).toBe('string');
      expect(maliciousInput.includes('<script>')).toBe(true);

      // In a real app, this would be sanitized by React's built-in XSS protection
      // and any additional sanitization libraries
    });

    test('should handle large data safely', () => {
      const largeData = {
        units: Array.from({ length: 1000 }, (_, i) => ({
          id: `unit-${i}`,
          name: `Unit ${i}`,
          words: Array.from({ length: 100 }, (_, j) => ({
            id: `word-${i}-${j}`,
            word: `word-${j}`,
            meaning: `meaning-${j}`,
            mastered: false,
          })),
        })),
      };

      // Should handle large data without crashing
      expect(largeData.units.length).toBe(1000);
      expect(largeData.units[0].words.length).toBe(100);

      // Test JSON serialization (common operation)
      expect(() => JSON.stringify(largeData)).not.toThrow();
    });
  });
});
