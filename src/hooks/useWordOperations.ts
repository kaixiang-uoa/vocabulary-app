// Custom hook for word operations state management with caching
import { useState, useCallback } from "react";
import { StorageData, Word, Unit } from "../types";
import {
  getAllData,
  saveAllData,
  addWord,
  updateWord,
  updateUnit,
  toggleWordMastered,
  setWordMasteredStatus,
  createUnit,
  deleteItems,
} from "../services/wordService";
import { isUsingFirebase } from "../services/dataServiceManager";
import {
  validateWord,
  validateUnitName,
  isWordDuplicate,
  getUnitStats,
  getOverallStats,
} from "../utils/wordHelpers";
import { globalCacheManager, CACHE_KEYS } from "../utils/cacheManager";

interface UseWordOperationsReturn {
  // Data state
  data: StorageData | null;
  loading: boolean;
  error: string | null;

  // Data operations
  loadData: () => Promise<void>;
  saveData: (data: StorageData) => Promise<boolean>;

  // Word operations
  addWordToUnit: (
    unitId: string,
    word: string,
    meaning: string,
  ) => Promise<boolean>;
  updateWordInUnit: (
    unitId: string,
    wordId: string,
    updatedWord: Partial<Word>,
  ) => Promise<boolean>;
  toggleWordMasteredStatus: (
    unitId: string,
    wordId: string,
  ) => Promise<boolean>;
  setWordMasteredStatusDirect: (
    unitId: string,
    wordId: string,
    mastered: boolean,
  ) => Promise<boolean>;

  // Unit operations
  createNewUnit: (unitName: string) => Promise<string | null>;
  updateUnitData: (
    unitId: string,
    updatedUnit: Partial<Unit>,
  ) => Promise<boolean>;

  // Delete operations
  deleteWords: (unitId: string, wordIds: string[]) => Promise<boolean>;
  deleteUnits: (unitIds: string[]) => Promise<boolean>;

  // Utility functions
  getUnitStatistics: (unitId: string) => any;
  getOverallStatistics: () => any;
  validateWordInput: (
    word: string,
    meaning: string,
  ) => { isValid: boolean; error?: string };
  validateUnitNameInput: (name: string) => { isValid: boolean; error?: string };
  checkWordDuplicate: (unitId: string, newWord: string) => boolean;
}

export const useWordOperations = (): UseWordOperationsReturn => {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataServiceType, setDataServiceType] = useState<
    "firebase" | "localStorage"
  >(isUsingFirebase() ? "firebase" : "localStorage");

  // Cache invalidation helper
  const invalidateCache = useCallback(() => {
    globalCacheManager.delete(CACHE_KEYS.UNITS);
    globalCacheManager.delete(CACHE_KEYS.STATISTICS);
  }, []);

  // Load all data with caching
  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Check if data service type has changed
      const currentServiceType = isUsingFirebase()
        ? "firebase"
        : "localStorage";
      if (currentServiceType !== dataServiceType) {
        setDataServiceType(currentServiceType);
        // Clear cache when switching data services
        globalCacheManager.clear();
        console.log("Data service changed, cache cleared");
      }

      // Check cache first
      const cachedData = globalCacheManager.get<StorageData>(CACHE_KEYS.UNITS);
      if (cachedData) {
        setData(cachedData);
        setLoading(false);
        return;
      }

      // Fetch from service if not cached
      const result = await getAllData();

      // Cache the result
      globalCacheManager.set(CACHE_KEYS.UNITS, result, 300000); // 5 minutes TTL

      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
      // Reset data on error (e.g., when not authenticated)
      setData({ units: [] });
    } finally {
      setLoading(false);
    }
  }, [dataServiceType]);

  // Save all data
  const saveData = useCallback(
    async (newData: StorageData): Promise<boolean> => {
      setLoading(true);
      setError(null);
      try {
        const success = await saveAllData(newData);
        if (success) {
          setData(newData);
          // Invalidate cache after successful save
          invalidateCache();
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save data");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [invalidateCache],
  );

  // Add word to unit
  const addWordToUnit = useCallback(
    async (unitId: string, word: string, meaning: string): Promise<boolean> => {
      if (!data) return false;

      setLoading(true);
      setError(null);
      try {
        const success = await addWord(unitId, word, meaning);
        if (success) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          const unit = updatedData.units.find((u) => u.id === unitId);
          if (unit) {
            unit.words.push({
              id: Date.now().toString(), // Temporary ID
              unitId,
              word,
              meaning,
              mastered: false,
              createTime: Date.now(),
              reviewTimes: 0,
              lastReviewTime: null,
            });
            setData(updatedData);
          }
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to add word");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache],
  );

  // Update word in unit
  const updateWordInUnit = useCallback(
    async (
      unitId: string,
      wordId: string,
      updatedWord: Partial<Word>,
    ): Promise<boolean> => {
      if (!data) return false;

      setLoading(true);
      setError(null);
      try {
        const success = await updateWord(unitId, wordId, updatedWord);
        if (success) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          const unit = updatedData.units.find((u) => u.id === unitId);
          if (unit) {
            const word = unit.words.find((w) => w.id === wordId);
            if (word) {
              Object.assign(word, updatedWord);
              setData(updatedData);
            }
          }
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update word");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache],
  );

  // Toggle word mastered status
  const toggleWordMasteredStatus = useCallback(
    async (unitId: string, wordId: string): Promise<boolean> => {
      if (!data) return false;

      setLoading(true);
      setError(null);
      try {
        const success = await toggleWordMastered(unitId, wordId);
        if (success) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          const unit = updatedData.units.find((u) => u.id === unitId);
          if (unit) {
            const word = unit.words.find((w) => w.id === wordId);
            if (word) {
              word.mastered = !word.mastered;
              setData(updatedData);
            }
          }
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to toggle word status",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache],
  );

  // Set word mastered status directly
  const setWordMasteredStatusDirect = useCallback(
    async (
      unitId: string,
      wordId: string,
      mastered: boolean,
    ): Promise<boolean> => {
      if (!data) return false;

      setLoading(true);
      setError(null);
      try {
        const success = await setWordMasteredStatus(unitId, wordId, mastered);
        if (success) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          const unit = updatedData.units.find((u) => u.id === unitId);
          if (unit) {
            const word = unit.words.find((w) => w.id === wordId);
            if (word) {
              word.mastered = mastered;
              setData(updatedData);
            }
          }
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to set word status",
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache],
  );

  // Create new unit
  const createNewUnit = useCallback(
    async (unitName: string): Promise<string | null> => {
      if (!data) return null;

      setLoading(true);
      setError(null);
      try {
        const unitId = await createUnit(unitName);
        if (unitId) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          updatedData.units.push({
            id: unitId,
            name: unitName,
            createTime: Date.now(),
            words: [],
          });
          setData(updatedData);
        }
        return unitId;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create unit");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache],
  );

  // Update unit data
  const updateUnitData = useCallback(
    async (unitId: string, updatedUnit: Partial<Unit>): Promise<boolean> => {
      if (!data) return false;

      setLoading(true);
      setError(null);
      try {
        const success = await updateUnit(unitId, updatedUnit);
        if (success) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          const unit = updatedData.units.find((u) => u.id === unitId);
          if (unit) {
            Object.assign(unit, updatedUnit);
            setData(updatedData);
          }
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update unit");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache],
  );

  // Delete words
  const deleteWords = useCallback(
    async (unitId: string, wordIds: string[]): Promise<boolean> => {
      if (!data) return false;

      setLoading(true);
      setError(null);
      try {
        const success = await deleteItems({
          type: "word",
          ids: wordIds,
          unitId,
        });
        if (success) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          const unit = updatedData.units.find((u) => u.id === unitId);
          if (unit) {
            unit.words = unit.words.filter(
              (word) => !wordIds.includes(word.id),
            );
            setData(updatedData);
          }
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete words");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache],
  );

  // Delete units
  const deleteUnits = useCallback(
    async (unitIds: string[]): Promise<boolean> => {
      if (!data) return false;

      setLoading(true);
      setError(null);
      try {
        const success = await deleteItems({ type: "unit", ids: unitIds });
        if (success) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          updatedData.units = updatedData.units.filter(
            (unit) => !unitIds.includes(unit.id),
          );
          setData(updatedData);
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete units");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache],
  );

  // Get unit statistics
  const getUnitStatistics = useCallback(
    (unitId: string) => {
      if (!data) return null;
      const unit = data.units.find((u) => u.id === unitId);
      return unit ? getUnitStats(unit) : null;
    },
    [data],
  );

  // Get overall statistics
  const getOverallStatistics = useCallback(() => {
    if (!data) return null;
    return getOverallStats(data);
  }, [data]);

  // Validate word input
  const validateWordInput = useCallback((word: string, meaning: string) => {
    return validateWord(word, meaning);
  }, []);

  // Validate unit name input
  const validateUnitNameInput = useCallback((name: string) => {
    return validateUnitName(name);
  }, []);

  // Check if word is duplicate in unit
  const checkWordDuplicate = useCallback(
    (unitId: string, newWord: string): boolean => {
      if (!data) return false;
      const unit = data.units.find((u) => u.id === unitId);
      if (!unit) return false;
      return isWordDuplicate(unit.words, newWord);
    },
    [data],
  );

  return {
    // Data state
    data,
    loading,
    error,

    // Data operations
    loadData,
    saveData,

    // Word operations
    addWordToUnit,
    updateWordInUnit,
    toggleWordMasteredStatus,
    setWordMasteredStatusDirect,

    // Unit operations
    createNewUnit,
    updateUnitData,

    // Delete operations
    deleteWords,
    deleteUnits,

    // Utility functions
    getUnitStatistics,
    getOverallStatistics,
    validateWordInput,
    validateUnitNameInput,
    checkWordDuplicate,
  };
};
