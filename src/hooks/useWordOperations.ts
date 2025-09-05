// Custom hook for word operations state management with caching
import { useCallback, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { isUsingFirebase } from '../services/dataServiceManager';
import {
  addWord,
  createUnit,
  deleteItems,
  getAllData,
  saveAllData,
  setWordMasteredStatus,
  toggleWordMastered,
  updateUnit,
  updateWord,
} from '../services/wordService';
import {
  ImportData,
  ImportUnitData,
  ImportWordData,
  StorageData,
  Unit,
  Word,
} from '../types';
import { CACHE_KEYS, globalCacheManager } from '../utils/cacheManager';
import {
  getOverallStats,
  getUnitStats,
  isWordDuplicate,
  validateUnitName,
  validateWord,
} from '../utils/wordHelpers';

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
    meaning: string
  ) => Promise<boolean>;
  updateWordInUnit: (
    unitId: string,
    wordId: string,
    updatedWord: Partial<Word>
  ) => Promise<boolean>;
  toggleWordMasteredStatus: (
    unitId: string,
    wordId: string
  ) => Promise<boolean>;
  setWordMasteredStatusDirect: (
    unitId: string,
    wordId: string,
    mastered: boolean
  ) => Promise<boolean>;

  // Unit operations
  createNewUnit: (unitName: string) => Promise<string | null>;
  updateUnitData: (
    unitId: string,
    updatedUnit: Partial<Unit>
  ) => Promise<boolean>;

  // Delete operations
  deleteWords: (unitId: string, wordIds: string[]) => Promise<boolean>;
  deleteUnits: (unitIds: string[]) => Promise<boolean>;

  // Batch operations
  batchImportData: (
    importData: ImportData
  ) => Promise<{ success: boolean; count: number }>;

  // Utility functions
  getUnitStatistics: (unitId: string) => any;
  getOverallStatistics: () => any;
  validateWordInput: (
    word: string,
    meaning: string
  ) => { isValid: boolean; error?: string };
  validateUnitNameInput: (name: string) => { isValid: boolean; error?: string };
  checkWordDuplicate: (unitId: string, newWord: string) => boolean;
}

export const useWordOperations = (): UseWordOperationsReturn => {
  const [data, setData] = useState<StorageData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataServiceType, setDataServiceType] = useState<
    'firebase' | 'localStorage'
  >(isUsingFirebase() ? 'firebase' : 'localStorage');

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
        ? 'firebase'
        : 'localStorage';
      if (currentServiceType !== dataServiceType) {
        setDataServiceType(currentServiceType);
        // Clear cache when switching data services
        globalCacheManager.clear();
        // eslint-disable-next-line no-console
        console.log('Data service changed, cache cleared');
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
      setError(err instanceof Error ? err.message : 'Failed to load data');
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
        setError(err instanceof Error ? err.message : 'Failed to save data');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [invalidateCache]
  );

  // Add word to unit
  const addWordToUnit = useCallback(
    async (unitId: string, word: string, meaning: string): Promise<boolean> => {
      if (!data) return false;

      // Store original data for rollback
      const originalData = data;

      // Optimistic update - update UI immediately
      const updatedData = {
        ...data,
        units: data.units.map(unit =>
          unit.id === unitId
            ? {
                ...unit,
                words: [
                  ...unit.words,
                  {
                    id: Date.now().toString(), // Temporary ID
                    unitId,
                    word,
                    meaning,
                    mastered: false,
                    createTime: Date.now(),
                    reviewTimes: 0,
                    lastReviewTime: null,
                  },
                ],
              }
            : unit
        ),
      };

      setData(updatedData);
      setError(null);

      try {
        const success = await addWord(unitId, word, meaning);
        if (success) {
          // Update cache with new data
          globalCacheManager.set(CACHE_KEYS.UNITS, updatedData);
        } else {
          // Rollback on failure
          setData(originalData);
          // Clear cache on failure to ensure fresh data on next load
          globalCacheManager.delete(CACHE_KEYS.UNITS);
          setError('Failed to add word');
        }
        return success;
      } catch (err) {
        // Rollback on error
        setData(originalData);
        // Clear cache on error to ensure fresh data on next load
        globalCacheManager.delete(CACHE_KEYS.UNITS);
        setError(err instanceof Error ? err.message : 'Failed to add word');
        return false;
      }
    },
    [data]
  );

  // Update word in unit
  const updateWordInUnit = useCallback(
    async (
      unitId: string,
      wordId: string,
      updatedWord: Partial<Word>
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
          const unit = updatedData.units.find(u => u.id === unitId);
          if (unit) {
            const word = unit.words.find(w => w.id === wordId);
            if (word) {
              Object.assign(word, updatedWord);
              setData(updatedData);
            }
          }
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update word');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache]
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
          const unit = updatedData.units.find(u => u.id === unitId);
          if (unit) {
            const word = unit.words.find(w => w.id === wordId);
            if (word) {
              word.mastered = !word.mastered;
              setData(updatedData);
            }
          }
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to toggle word status'
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache]
  );

  // Set word mastered status directly
  const setWordMasteredStatusDirect = useCallback(
    async (
      unitId: string,
      wordId: string,
      mastered: boolean
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
          const unit = updatedData.units.find(u => u.id === unitId);
          if (unit) {
            const word = unit.words.find(w => w.id === wordId);
            if (word) {
              word.mastered = mastered;
              setData(updatedData);
            }
          }
        }
        return success;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'Failed to set word status'
        );
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache]
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
        setError(err instanceof Error ? err.message : 'Failed to create unit');
        return null;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache]
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
          const unit = updatedData.units.find(u => u.id === unitId);
          if (unit) {
            Object.assign(unit, updatedUnit);
            setData(updatedData);
          }
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update unit');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache]
  );

  // Delete words
  const deleteWords = useCallback(
    async (unitId: string, wordIds: string[]): Promise<boolean> => {
      if (!data) return false;

      setLoading(true);
      setError(null);
      try {
        const success = await deleteItems({
          type: 'word',
          ids: wordIds,
          unitId,
        });
        if (success) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          const unit = updatedData.units.find(u => u.id === unitId);
          if (unit) {
            unit.words = unit.words.filter(word => !wordIds.includes(word.id));
            setData(updatedData);
          }
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete words');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache]
  );

  // Delete units
  const deleteUnits = useCallback(
    async (unitIds: string[]): Promise<boolean> => {
      if (!data) return false;

      setLoading(true);
      setError(null);
      try {
        const success = await deleteItems({ type: 'unit', ids: unitIds });
        if (success) {
          // Invalidate cache instead of reloading
          invalidateCache();
          // Update local state optimistically
          const updatedData = { ...data };
          updatedData.units = updatedData.units.filter(
            unit => !unitIds.includes(unit.id)
          );
          setData(updatedData);
        }
        return success;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete units');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [data, invalidateCache]
  );

  // Batch import data (optimized for performance)
  const batchImportData = useCallback(
    async (
      importData: ImportData
    ): Promise<{ success: boolean; count: number }> => {
      if (!data) return { success: false, count: 0 };

      setError(null);
      try {
        let importedCount = 0;
        // Create a new top-level object and a new units array to ensure reference changes
        const updatedData: StorageData = { ...data, units: [...data.units] };

        if (Array.isArray(importData)) {
          // Handle ImportUnitData[] or ImportWordData[]
          if (importData.length > 0 && 'unit' in importData[0]) {
            // ImportUnitData[] - multiple units with words
            const unitMap = new Map<string, string>();

            for (const item of importData as ImportUnitData[]) {
              const { unit, word, meaning } = item;
              if (!unitMap.has(unit)) {
                // Create unit in local state
                const newUnitId = uuidv4();
                const newUnit: Unit = {
                  id: newUnitId,
                  name: unit.trim(),
                  createTime: Date.now(),
                  words: [],
                };
                updatedData.units.push(newUnit);
                unitMap.set(unit, newUnitId);
              }

              const unitId = unitMap.get(unit);
              if (unitId) {
                const newWord: Word = {
                  id: uuidv4(),
                  word: word.trim(),
                  meaning: meaning.trim(),
                  unitId,
                  mastered: false,
                  createTime: Date.now(),
                  reviewTimes: 0,
                  lastReviewTime: null,
                };
                const unit = updatedData.units.find(u => u.id === unitId);
                if (unit) {
                  // Ensure words array reference changes as well
                  unit.words = [...unit.words, newWord];
                  importedCount++;
                }
              }
            }
          } else {
            // ImportWordData[] - words for a single unit
            const newUnitId = uuidv4();
            const newUnit: Unit = {
              id: newUnitId,
              name: 'Imported Unit',
              createTime: Date.now(),
              words: [],
            };
            updatedData.units.push(newUnit);

            for (const item of importData as ImportWordData[]) {
              const newWord: Word = {
                id: uuidv4(),
                word: item.word.trim(),
                meaning: item.meaning.trim(),
                unitId: newUnitId,
                mastered: false,
                createTime: Date.now(),
                reviewTimes: 0,
                lastReviewTime: null,
              };
              newUnit.words = [...newUnit.words, newWord];
              importedCount++;
            }
          }
        } else if (importData && importData.units) {
          // ImportCompleteData - complete structure
          for (const unitData of importData.units) {
            const newUnitId = uuidv4();
            const newUnit: Unit = {
              id: newUnitId,
              name: unitData.name.trim(),
              createTime: Date.now(),
              words: [],
            };
            updatedData.units.push(newUnit);

            for (const wordData of unitData.words || []) {
              const newWord: Word = {
                id: uuidv4(),
                word: wordData.word.trim(),
                meaning: wordData.meaning.trim(),
                unitId: newUnitId,
                mastered: false,
                createTime: Date.now(),
                reviewTimes: 0,
                lastReviewTime: null,
              };
              newUnit.words = [...newUnit.words, newWord];
              importedCount++;
            }
          }
        }

        // Optimistic update: update UI immediately
        const previousData = data;
        setData(updatedData);

        // Update cache with new data to prevent overwrite
        globalCacheManager.set(CACHE_KEYS.UNITS, updatedData, 300000);

        // Persist all data once (async, don't block UI)
        const success = await saveAllData(updatedData);
        if (success) {
          return { success: true, count: importedCount };
        }

        // Rollback on failure
        setData(previousData);
        globalCacheManager.delete(CACHE_KEYS.UNITS);
        return { success: false, count: 0 };
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to import data');
        return { success: false, count: 0 };
      }
    },
    [data]
  );

  // Get unit statistics
  const getUnitStatistics = useCallback(
    (unitId: string) => {
      if (!data) return null;
      const unit = data.units.find(u => u.id === unitId);
      return unit ? getUnitStats(unit) : null;
    },
    [data]
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
      const unit = data.units.find(u => u.id === unitId);
      if (!unit) return false;
      return isWordDuplicate(unit.words, newWord);
    },
    [data]
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

    // Batch operations
    batchImportData,

    // Utility functions
    getUnitStatistics,
    getOverallStatistics,
    validateWordInput,
    validateUnitNameInput,
    checkWordDuplicate,
  };
};
