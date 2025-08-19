import {
  validateUnitName,
  validateWordData,
  formatTime,
  generateId,
} from "../utils/wordValidation";

describe("Utility Functions Tests", () => {
  describe("Data Validation", () => {
    describe("validateUnitName", () => {
      test("should validate valid unit names", () => {
        const validNames = [
          "Unit 1",
          "My Vocabulary",
          "测试单元",
          "Unit-1",
          "Unit_1",
          "Unit 1.0",
        ];

        validNames.forEach((name) => {
          expect(validateUnitName(name)).toBe(true);
        });
      });

      test("should reject invalid unit names", () => {
        const invalidNames = [
          "",
          "   ",
          null,
          undefined,
          "a".repeat(101), // Too long
          "Unit<>", // Invalid characters
          'Unit"', // Invalid characters
          "Unit'", // Invalid characters
        ];

        invalidNames.forEach((name) => {
          expect(validateUnitName(name as any)).toBe(false);
        });
      });

      test("should handle edge cases", () => {
        // Minimum valid name
        expect(validateUnitName("A")).toBe(true);

        // Maximum valid name (100 characters)
        expect(validateUnitName("a".repeat(100))).toBe(true);

        // Just over limit
        expect(validateUnitName("a".repeat(101))).toBe(false);
      });
    });

    describe("validateWordData", () => {
      test("should validate valid word data", () => {
        const validWords = [
          { word: "hello", meaning: "你好" },
          { word: "world", meaning: "世界" },
          { word: "test", meaning: "测试" },
          { word: "a", meaning: "一个" }, // Minimum length
        ];

        validWords.forEach((wordData) => {
          expect(validateWordData(wordData)).toBe(true);
        });
      });

      test("should reject invalid word data", () => {
        const invalidWords = [
          { word: "", meaning: "test" },
          { word: "test", meaning: "" },
          { word: "", meaning: "" },
          { word: null, meaning: "test" },
          { word: "test", meaning: null },
          { word: "a".repeat(101), meaning: "test" }, // Too long
          { word: "test", meaning: "a".repeat(501) }, // Too long
        ];

        invalidWords.forEach((wordData) => {
          expect(validateWordData(wordData as any)).toBe(false);
        });
      });

      test("should handle edge cases", () => {
        // Minimum valid word
        expect(validateWordData({ word: "a", meaning: "b" })).toBe(true);

        // Maximum valid word (100 characters)
        expect(
          validateWordData({
            word: "a".repeat(100),
            meaning: "test",
          }),
        ).toBe(true);

        // Maximum valid meaning (500 characters)
        expect(
          validateWordData({
            word: "test",
            meaning: "a".repeat(500),
          }),
        ).toBe(true);
      });
    });
  });

  describe("Time Formatting", () => {
    describe("formatTime", () => {
      test("should format seconds correctly", () => {
        expect(formatTime(0)).toBe("0s");
        expect(formatTime(30)).toBe("30s");
        expect(formatTime(60)).toBe("1m");
        expect(formatTime(90)).toBe("1m 30s");
        expect(formatTime(3600)).toBe("1h");
        expect(formatTime(3661)).toBe("1h 1m 1s");
      });

      test("should handle edge cases", () => {
        expect(formatTime(-1)).toBe("0s");
        expect(formatTime(NaN)).toBe("0s");
        expect(formatTime(Infinity)).toBe("0s");
        expect(formatTime(null as any)).toBe("0s");
        expect(formatTime(undefined as any)).toBe("0s");
      });

      test("should format large values correctly", () => {
        expect(formatTime(86400)).toBe("24h"); // 1 day
        expect(formatTime(90000)).toBe("25h"); // 25 hours
        expect(formatTime(360000)).toBe("100h"); // 100 hours
      });
    });
  });

  describe("ID Generation", () => {
    describe("generateId", () => {
      test("should generate unique IDs", () => {
        const ids = new Set();
        const count = 1000;

        for (let i = 0; i < count; i++) {
          const id = generateId();
          expect(ids.has(id)).toBe(false);
          ids.add(id);
        }

        expect(ids.size).toBe(count);
      });

      test("should generate valid UUID format", () => {
        const id = generateId();
        const uuidRegex =
          /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        expect(id).toMatch(uuidRegex);
      });

      test("should generate different IDs for different calls", () => {
        const id1 = generateId();
        const id2 = generateId();
        expect(id1).not.toBe(id2);
      });
    });
  });

  describe("Data Processing", () => {
    test("should handle large datasets safely", () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => ({
        id: `word-${i}`,
        word: `word${i}`,
        meaning: `meaning${i}`,
        mastered: i % 2 === 0,
      }));

      // Test JSON serialization
      expect(() => JSON.stringify(largeDataset)).not.toThrow();

      // Test array operations
      expect(largeDataset.length).toBe(10000);
      expect(largeDataset[0].word).toBe("word0");
      expect(largeDataset[9999].word).toBe("word9999");
    });

    test("should handle special characters in data", () => {
      const specialData = [
        { word: "café", meaning: "咖啡厅" },
        { word: "naïve", meaning: "天真的" },
        { word: "résumé", meaning: "简历" },
        { word: "über", meaning: "超过" },
        { word: "🎉", meaning: "庆祝" },
        { word: "🌍", meaning: "世界" },
      ];

      specialData.forEach((item) => {
        expect(validateWordData(item)).toBe(true);
        expect(() => JSON.stringify(item)).not.toThrow();
      });
    });

    test("should handle unicode data correctly", () => {
      const unicodeData = {
        word: "🚀 rocket",
        meaning: "🚀 火箭",
        description: "A vehicle that can travel in space 🚀",
      };

      expect(validateWordData(unicodeData)).toBe(true);
      expect(unicodeData.word.includes("🚀")).toBe(true);
      expect(unicodeData.meaning.includes("🚀")).toBe(true);
    });
  });

  describe("Error Handling", () => {
    test("should handle malformed data gracefully", () => {
      const malformedData = [
        { word: 123, meaning: "test" },
        { word: "test", meaning: 456 },
        { word: [], meaning: "test" },
        { word: "test", meaning: {} },
        { word: () => {}, meaning: "test" },
        { word: "test", meaning: () => {} },
      ];

      malformedData.forEach((data) => {
        // Should not throw, but should return false for validation
        expect(() => validateWordData(data as any)).not.toThrow();
        expect(validateWordData(data as any)).toBe(false);
      });
    });

    test("should handle null and undefined gracefully", () => {
      const nullData = [
        null,
        undefined,
        { word: null, meaning: "test" },
        { word: "test", meaning: undefined },
        { word: null, meaning: null },
      ];

      nullData.forEach((data) => {
        expect(() => validateWordData(data as any)).not.toThrow();
        expect(validateWordData(data as any)).toBe(false);
      });
    });
  });

  describe("Performance Tests", () => {
    test("should handle rapid ID generation", () => {
      const startTime = Date.now();
      const ids = [];

      // Generate 10000 IDs rapidly
      for (let i = 0; i < 10000; i++) {
        ids.push(generateId());
      }

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(ids.length).toBe(10000);

      // All IDs should be unique
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(10000);
    });

    test("should handle rapid validation", () => {
      const testData = Array.from({ length: 1000 }, (_, i) => ({
        word: `word${i}`,
        meaning: `meaning${i}`,
      }));

      const startTime = Date.now();

      testData.forEach((data) => {
        validateWordData(data);
      });

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 100ms)
      expect(duration).toBeLessThan(100);
    });
  });
});
