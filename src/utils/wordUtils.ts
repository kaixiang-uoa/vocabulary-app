// Core word data operation tools
import { v4 as uuidv4 } from 'uuid';
import { saveData, getData } from './storage';
import { STORAGE_KEY, initialData } from '../data/initialData';
import { StorageData, Word, Unit } from '../types';

// get all word data
export const getAllData = (): StorageData => {
  let data: StorageData = getData(STORAGE_KEY) || initialData;
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
};

// save all word data
export const saveAllData = (data: StorageData): boolean => {
  return saveData(STORAGE_KEY, data);
};

// add word to specified unit
export const addWord = (unitId: string, word: string, meaning: string): boolean => {
  // Validate input
  const trimmedWord = word.trim();
  const trimmedMeaning = meaning.trim();
  
  if (!trimmedWord || !trimmedMeaning) {
    return false;
  }
  
  const data = getAllData();
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
    lastReviewTime: null
  };
  
  data.units[unitIndex].words.push(newWord);
  return saveAllData(data);
};

// update word
export const updateWord = (unitId: string, wordId: string, updatedWord: Partial<Word>): boolean => {
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) return false;
  
  const wordIndex = data.units[unitIndex].words.findIndex(w => w.id === wordId);
  
  if (wordIndex === -1) return false;
  
  data.units[unitIndex].words[wordIndex] = {
    ...data.units[unitIndex].words[wordIndex],
    ...updatedWord
  };
  
  return saveAllData(data);
};

// update unit
export const updateUnit = (unitId: string, updatedUnit: Partial<Unit>): boolean => {
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) return false;
  
  data.units[unitIndex] = {
    ...data.units[unitIndex],
    ...updatedUnit
  };
  
  return saveAllData(data);
};

// toggle word mastered status
export const toggleWordMastered = (unitId: string, wordId: string): boolean => {
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) return false;
  
  const wordIndex = data.units[unitIndex].words.findIndex(w => w.id === wordId);
  
  if (wordIndex === -1) return false;
  
  data.units[unitIndex].words[wordIndex].mastered = !data.units[unitIndex].words[wordIndex].mastered;
  data.units[unitIndex].words[wordIndex].reviewTimes += 1;
  data.units[unitIndex].words[wordIndex].lastReviewTime = Date.now();
  
  return saveAllData(data);
};

// set word mastered status for spelling review
export const setWordMasteredStatus = (unitId: string, wordId: string, mastered: boolean): boolean => {
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  
  if (unitIndex === -1) return false;
  
  const wordIndex = data.units[unitIndex].words.findIndex(w => w.id === wordId);
  
  if (wordIndex === -1) return false;
  
  data.units[unitIndex].words[wordIndex].mastered = mastered;
  data.units[unitIndex].words[wordIndex].reviewTimes += 1;
  data.units[unitIndex].words[wordIndex].lastReviewTime = Date.now();
  
  return saveAllData(data);
};

// create new unit
export const createUnit = (unitName: string): string => {
  const data = getAllData();
  const newUnit: Unit = {
    id: uuidv4(),
    name: unitName.trim(),
    createTime: Date.now(),
    words: []
  };
  
  data.units.push(newUnit);
  saveAllData(data);
  
  return newUnit.id;
};

// delete items (words or units)
export const deleteItems = ({ type, ids, unitId }: { type: 'word' | 'unit', ids: string[], unitId?: string }): boolean => {
  const data = getAllData();
  
  if (type === 'word' && unitId) {
    const unitIndex = data.units.findIndex(u => u.id === unitId);
    if (unitIndex === -1) return false;
    
    data.units[unitIndex].words = data.units[unitIndex].words.filter(word => !ids.includes(word.id));
  } else if (type === 'unit') {
    data.units = data.units.filter(unit => !ids.includes(unit.id));
  }
  
  return saveAllData(data);
};