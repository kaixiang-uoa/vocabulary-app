// Word validation utilities
import { v4 as uuidv4 } from 'uuid';

import { Word, Unit, ImportWordData } from '../types';

/**
 * Validate word data structure
 */
export const validateWord = (word: Partial<Word>): boolean => {
  return !!(word.word && word.meaning && word.unitId);
};

/**
 * Validate word data (word and meaning only)
 */
export const validateWordData = (data: {
  word: string;
  meaning: string;
}): boolean => {
  if (!data || typeof data !== 'object') return false;

  const { word, meaning } = data;

  // Check if word and meaning are valid strings
  if (typeof word !== 'string' || typeof meaning !== 'string') return false;

  // Check length limits
  if (word.trim().length === 0 || word.length > 100) return false;
  if (meaning.trim().length === 0 || meaning.length > 500) return false;

  return true;
};

/**
 * Validate unit name
 */
export const validateUnitName = (name: string): boolean => {
  if (typeof name !== 'string') return false;

  const trimmed = name.trim();

  // Check length limits
  if (trimmed.length === 0 || trimmed.length > 100) return false;

  // Check for invalid characters
  const invalidChars = /[<>"']/;
  if (invalidChars.test(trimmed)) return false;

  return true;
};

/**
 * Format time in seconds to human readable format
 */
export const formatTime = (seconds: number): string => {
  if (!Number.isFinite(seconds) || seconds < 0) return '0s';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
};

/**
 * Generate unique ID
 */
export const generateId = (): string => {
  return uuidv4();
};

/**
 * Validate unit data structure
 */
export const validateUnit = (unit: Partial<Unit>): boolean => {
  return !!unit.name;
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
