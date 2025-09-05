// Word data operation service
import { v4 as uuidv4 } from 'uuid';

import { STORAGE_KEY, initialData } from '../data/initialData';
import { StorageData, Unit, Word } from '../types';
import { getData, saveData } from '../utils/storage';

import { getDataService } from './dataServiceManager';

// Get all word data
export const getAllData = async (): Promise<StorageData> => {
  try {
    const dataService = getDataService();
    return await dataService.getAllData();
  } catch (error) {
    // Fallback to localStorage
    const data: StorageData = getData(STORAGE_KEY) || initialData;
    let changed = false;
    // Ensure every word has a unique id
    if (data.units) {
      data.units.forEach(unit => {
        if (Array.isArray(unit.words)) {
          unit.words.forEach(word => {
            if (!word.id) {
              word.id = uuidv4();
              changed = true;
            }
          });
        }
      });
    }
    if (changed) {
      saveData(STORAGE_KEY, data);
    }
    return data;
  }
};

// Save all word data
export const saveAllData = async (data: StorageData): Promise<boolean> => {
  try {
    const dataService = getDataService();
    return await dataService.saveAllData(data);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error saving all data:', error);
    // Fallback to localStorage
    return saveData(STORAGE_KEY, data);
  }
};

// Add word to specified unit
export const addWord = async (
  unitId: string,
  word: string,
  meaning: string
): Promise<boolean> => {
  try {
    const dataService = getDataService();
    return await dataService.addWord(unitId, word, meaning);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error adding word:', error);
    // Fallback to localStorage
    const trimmedWord = word.trim();
    const trimmedMeaning = meaning.trim();

    if (!trimmedWord || !trimmedMeaning) {
      return false;
    }

    const data = getData(STORAGE_KEY) || initialData;
    const unitIndex = data.units.findIndex(u => u.id === unitId);

    if (unitIndex === -1) return false;

    const newWord: Word = {
      id: uuidv4(),
      word: trimmedWord,
      meaning: trimmedMeaning,
      unitId,
      mastered: false,
      createTime: Date.now(),
      reviewTimes: 0,
      lastReviewTime: null,
    };

    data.units[unitIndex].words.push(newWord);
    return saveData(STORAGE_KEY, data);
  }
};

// Update word
export const updateWord = async (
  unitId: string,
  wordId: string,
  updatedWord: Partial<Word>
): Promise<boolean> => {
  try {
    const dataService = getDataService();
    return await dataService.updateWord(unitId, wordId, updatedWord);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating word:', error);
    // Fallback to localStorage
    const data = getData(STORAGE_KEY) || initialData;
    const unitIndex = data.units.findIndex(u => u.id === unitId);

    if (unitIndex === -1) return false;

    const wordIndex = data.units[unitIndex].words.findIndex(
      w => w.id === wordId
    );

    if (wordIndex === -1) return false;

    data.units[unitIndex].words[wordIndex] = {
      ...data.units[unitIndex].words[wordIndex],
      ...updatedWord,
    };

    return saveData(STORAGE_KEY, data);
  }
};

// Update unit
export const updateUnit = async (
  unitId: string,
  updatedUnit: Partial<Unit>
): Promise<boolean> => {
  try {
    const dataService = getDataService();
    return await dataService.updateUnit(unitId, updatedUnit);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating unit:', error);
    // Fallback to localStorage
    const data = getData(STORAGE_KEY) || initialData;
    const unitIndex = data.units.findIndex(u => u.id === unitId);

    if (unitIndex === -1) return false;

    data.units[unitIndex] = {
      ...data.units[unitIndex],
      ...updatedUnit,
    };

    return saveData(STORAGE_KEY, data);
  }
};

// Toggle word mastered status
export const toggleWordMastered = async (
  unitId: string,
  wordId: string
): Promise<boolean> => {
  try {
    const dataService = getDataService();
    return await dataService.toggleWordMastered(unitId, wordId);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error toggling word mastered status:', error);
    // Fallback to localStorage
    const data = getData(STORAGE_KEY) || initialData;
    const unitIndex = data.units.findIndex(u => u.id === unitId);

    if (unitIndex === -1) return false;

    const wordIndex = data.units[unitIndex].words.findIndex(
      w => w.id === wordId
    );

    if (wordIndex === -1) return false;

    data.units[unitIndex].words[wordIndex].mastered =
      !data.units[unitIndex].words[wordIndex].mastered;
    data.units[unitIndex].words[wordIndex].reviewTimes += 1;
    data.units[unitIndex].words[wordIndex].lastReviewTime = Date.now();

    return saveData(STORAGE_KEY, data);
  }
};

// Set word mastered status for spelling review
export const setWordMasteredStatus = async (
  unitId: string,
  wordId: string,
  mastered: boolean
): Promise<boolean> => {
  try {
    const dataService = getDataService();
    return await dataService.setWordMasteredStatus(unitId, wordId, mastered);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error setting word mastered status:', error);
    // Fallback to localStorage
    const data = getData(STORAGE_KEY) || initialData;
    const unitIndex = data.units.findIndex(u => u.id === unitId);

    if (unitIndex === -1) return false;

    const wordIndex = data.units[unitIndex].words.findIndex(
      w => w.id === wordId
    );

    if (wordIndex === -1) return false;

    data.units[unitIndex].words[wordIndex].mastered = mastered;
    data.units[unitIndex].words[wordIndex].reviewTimes += 1;
    data.units[unitIndex].words[wordIndex].lastReviewTime = Date.now();

    return saveData(STORAGE_KEY, data);
  }
};

// Create new unit
export const createUnit = async (unitName: string): Promise<string> => {
  try {
    const dataService = getDataService();
    return await dataService.createUnit(unitName);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error creating unit:', error);
    // Fallback to localStorage
    const data = getData(STORAGE_KEY) || initialData;
    const newUnit: Unit = {
      id: uuidv4(),
      name: unitName.trim(),
      createTime: Date.now(),
      words: [],
    };

    data.units.push(newUnit);
    saveData(STORAGE_KEY, data);

    return newUnit.id;
  }
};

// Delete items (words or units)
export const deleteItems = async ({
  type,
  ids,
  unitId,
}: {
  type: 'word' | 'unit';
  ids: string[];
  unitId?: string;
}): Promise<boolean> => {
  try {
    const dataService = getDataService();
    return await dataService.deleteItems({ type, ids, unitId });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting items:', error);
    // Fallback to localStorage
    const data = getData(STORAGE_KEY) || initialData;

    if (type === 'word' && unitId) {
      const unitIndex = data.units.findIndex(u => u.id === unitId);
      if (unitIndex === -1) return false;

      data.units[unitIndex].words = data.units[unitIndex].words.filter(
        word => !ids.includes(word.id)
      );
    } else if (type === 'unit') {
      data.units = data.units.filter(unit => !ids.includes(unit.id));
    }

    return saveData(STORAGE_KEY, data);
  }
};
