// Word import/export utilities
import { Word, ImportWordData } from '../types';

import { validateCSVLine, cleanWordText } from './wordValidation';
// Keep this file pure; no service or storage access here

/**
 * Export unit words to CSV
 */
export const exportWordsToCSV = (words: Word[]): string => {
  const csvContent = words
    .map(word => `${word.word},${word.meaning}`)
    .join('\n');
  return `word,meaning\n${csvContent}`;
};

/**
 * Import words from CSV
 */
export const parseWordsFromCSV = (csvContent: string): ImportWordData[] => {
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

  return wordsArray;
};

// NOTE: Previously this module performed writes to storage (batch add/import).
// Those responsibilities are now handled by WordContext/useWordOperations.
// Keep only pure helpers here.
