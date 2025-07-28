// Word import/export utilities
import { v4 as uuidv4 } from 'uuid';
import { Word, Unit, ImportWordData } from '../types';
import { getAllData, saveAllData } from './wordUtils';
import { validateCSVLine, cleanWordText, validateImportData, validateUnitImportData } from './wordValidation';
import { getUnitWords } from './wordFiltering';

/**
 * Export unit words to CSV
 */
export const exportUnitWordsToCSV = (unitId: string): string => {
  const words = getUnitWords(unitId);
  const csvContent = words.map(word => `${word.word},${word.meaning}`).join('\n');
  return `word,meaning\n${csvContent}`;
};

/**
 * Import words from CSV
 */
export const importWordsFromCSV = (unitId: string, csvContent: string): boolean => {
  const lines = csvContent.trim().split('\n');
  const wordsArray: ImportWordData[] = [];
  
  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    if (validateCSVLine(line)) {
      const parts = line.split(',');
      const word = cleanWordText(parts[0]);
      const meaning = cleanWordText(parts[1]);
      
      if (word && meaning) {
        wordsArray.push({ word, meaning });
      }
    }
  }
  
  return addWordsInBatch(unitId, wordsArray);
};

/**
 * Add words to specified unit in batch
 */
export const addWordsInBatch = (unitId: string, wordsArray: ImportWordData[]): boolean => {
  const data = getAllData();
  const unitIndex = data.units.findIndex(u => u.id === unitId);
  if (unitIndex === -1) return false;
  
  const newWords: Word[] = wordsArray.map(item => ({
    id: uuidv4(),
    word: item.word.trim(),
    meaning: item.meaning.trim(),
    unitId,
    mastered: false,
    createTime: Date.now(),
    reviewTimes: 0,
    lastReviewTime: null
  }));
  
  data.units[unitIndex].words = [...data.units[unitIndex].words, ...newWords];
  return saveAllData(data);
};

/**
 * Import complete data structure (units and words)
 */
export const importCompleteData = (importData: any): boolean => {
  try {
    if (!validateImportData(importData)) {
      return false;
    }
    
    const data = getAllData();
    
    importData.units.forEach((importUnit: any) => {
      if (importUnit.name && Array.isArray(importUnit.words)) {
        // Create new unit (ignore the imported id, generate new UUID)
        const newUnit: Unit = {
          id: uuidv4(),
          name: importUnit.name.trim(),
          createTime: Date.now(),
          words: []
        };
        
        // Add words to the unit
        importUnit.words.forEach((importWord: any) => {
          if (importWord.word && importWord.meaning) {
            const newWord: Word = {
              id: uuidv4(),
              word: importWord.word.trim(),
              meaning: importWord.meaning.trim(),
              unitId: newUnit.id,
              mastered: false,
              createTime: Date.now(),
              reviewTimes: 0,
              lastReviewTime: null
            };
            newUnit.words.push(newWord);
          }
        });
        
        data.units.push(newUnit);
      }
    });
    
    return saveAllData(data);
  } catch (error) {
    console.error('Failed to import complete data:', error);
    return false;
  }
};

/**
 * Import unit data from CSV (unit,word,meaning format)
 */
export const importUnitData = (unitData: any[]): boolean => {
  try {
    if (!validateUnitImportData(unitData)) {
      return false;
    }
    
    const data = getAllData();
    const unitMap = new Map<string, string>(); // unit name -> unit id
    
    unitData.forEach((item: any) => {
      if (item.unit && item.word && item.meaning) {
        let unitId = unitMap.get(item.unit);
        
        // Create unit if it doesn't exist
        if (!unitId) {
          const newUnit: Unit = {
            id: uuidv4(),
            name: item.unit.trim(),
            createTime: Date.now(),
            words: []
          };
          data.units.push(newUnit);
          unitId = newUnit.id;
          unitMap.set(item.unit, unitId);
        }
        
        // Add word to the unit
        const newWord: Word = {
          id: uuidv4(),
          word: item.word.trim(),
          meaning: item.meaning.trim(),
          unitId: unitId,
          mastered: false,
          createTime: Date.now(),
          reviewTimes: 0,
          lastReviewTime: null
        };
        
        const unitIndex = data.units.findIndex(u => u.id === unitId);
        if (unitIndex !== -1) {
          data.units[unitIndex].words.push(newWord);
        }
      }
    });
    
    return saveAllData(data);
  } catch (error) {
    console.error('Failed to import unit data:', error);
    return false;
  }
}; 