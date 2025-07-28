// Word validation utilities
import { Word, Unit, ImportWordData } from '../types';

/**
 * Validate word data structure
 */
export const validateWord = (word: Partial<Word>): boolean => {
  return !!(word.word && word.meaning && word.unitId);
};

/**
 * Validate unit data structure
 */
export const validateUnit = (unit: Partial<Unit>): boolean => {
  return !!(unit.name);
};

/**
 * Validate import word data
 */
export const validateImportWordData = (data: ImportWordData): boolean => {
  return !!(data.word && data.meaning);
};

/**
 * Validate CSV line format
 */
export const validateCSVLine = (line: string): boolean => {
  const parts = line.split(',');
  return parts.length >= 2 && !!parts[0].trim() && !!parts[1].trim();
};

/**
 * Clean and validate word text
 */
export const cleanWordText = (text: string): string => {
  return text.trim().replace(/"/g, '');
};

/**
 * Validate complete import data structure
 */
export const validateImportData = (importData: any): boolean => {
  return !!(importData.units && Array.isArray(importData.units));
};

/**
 * Validate unit import data
 */
export const validateUnitImportData = (unitData: any[]): boolean => {
  return Array.isArray(unitData) && unitData.length > 0;
}; 