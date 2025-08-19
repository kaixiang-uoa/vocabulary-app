// Spelling review utility functions
import { SpellingValidationResult } from "../types";

/**
 * Validate spelling input against target word
 * New logic: If first character is wrong, it's immediately invalid
 */
export const validateSpellingInput = (
  input: string,
  targetWord: string,
): SpellingValidationResult => {
  const normalizedInput = input.toLowerCase();
  const normalizedTarget = targetWord.toLowerCase();

  // Check if input is complete
  const isComplete = normalizedInput.length === normalizedTarget.length;

  // Check if input is correct
  const isCorrect = normalizedInput === normalizedTarget;

  // Find error position if any
  let errorPosition: number | undefined;
  for (
    let i = 0;
    i < Math.min(normalizedInput.length, normalizedTarget.length);
    i++
  ) {
    if (normalizedInput[i] !== normalizedTarget[i]) {
      errorPosition = i;
      break;
    }
  }

  // New validation logic:
  // 1. If first character is wrong, it's immediately invalid
  // 2. Otherwise, input is valid if it's a prefix of the target word or matches completely
  let isValid: boolean;

  if (normalizedInput.length > 0) {
    // Check if first character is correct
    if (normalizedInput[0] !== normalizedTarget[0]) {
      isValid = false;
    } else {
      // First character is correct, check if it's a valid prefix
      isValid = isCorrect || normalizedTarget.startsWith(normalizedInput);
    }
  } else {
    // Empty input is always valid
    isValid = true;
  }

  return {
    isValid,
    isComplete,
    isCorrect,
    errorPosition,
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
export const formatInputHistory = (
  history: Array<{ input: string; correct: boolean }>,
) => {
  return history.map((item, index) => ({
    ...item,
    id: index,
    timestamp: Date.now(),
  }));
};

/**
 * Calculate error rate based on input history
 */
export const calculateErrorRate = (
  history: Array<{ input: string; correct: boolean }>,
): number => {
  if (history.length === 0) return 0;

  const errorCount = history.filter((item) => !item.correct).length;
  return (errorCount / history.length) * 100;
};
