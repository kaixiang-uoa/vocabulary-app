// Spelling review utility functions
import { SpellingValidationResult } from '../types';

/**
 * Validate spelling input against target word
 */
export const validateSpellingInput = (
  input: string,
  targetWord: string
): SpellingValidationResult => {
  const normalizedInput = input.toLowerCase();
  const normalizedTarget = targetWord.toLowerCase();
  
  // Check if input is complete
  const isComplete = normalizedInput.length === normalizedTarget.length;
  
  // Check if input is correct
  const isCorrect = normalizedInput === normalizedTarget;
  
  // Find error position if any
  let errorPosition: number | undefined;
  for (let i = 0; i < Math.min(normalizedInput.length, normalizedTarget.length); i++) {
    if (normalizedInput[i] !== normalizedTarget[i]) {
      errorPosition = i;
      break;
    }
  }
  
  // Input is valid if it's a prefix of the target word or matches completely
  const isValid = isCorrect || normalizedTarget.startsWith(normalizedInput);
  
  return {
    isValid,
    isComplete,
    isCorrect,
    errorPosition
  };
};

/**
 * Check if input is a valid letter
 */
export const isValidLetter = (char: string): boolean => {
  return /^[a-zA-Z]$/.test(char);
};

/**
 * Format input history for display
 */
export const formatInputHistory = (history: Array<{ input: string; correct: boolean }>) => {
  return history.map((item, index) => ({
    ...item,
    id: index,
    timestamp: Date.now()
  }));
};

/**
 * Calculate error rate based on input history
 */
export const calculateErrorRate = (history: Array<{ input: string; correct: boolean }>): number => {
  if (history.length === 0) return 0;
  
  const errorCount = history.filter(item => !item.correct).length;
  return (errorCount / history.length) * 100;
}; 