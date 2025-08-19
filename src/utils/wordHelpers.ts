// Pure utility functions for word operations
import { Word, Unit, StorageData } from "../types";

// Filter words by mastered status
export const filterWordsByMastered = (
  words: Word[],
  mastered: boolean,
): Word[] => {
  return words.filter((word) => word.mastered === mastered);
};

// Get words for review (not mastered)
export const getWordsForReview = (words: Word[]): Word[] => {
  return filterWordsByMastered(words, false);
};

// Get mastered words
export const getMasteredWords = (words: Word[]): Word[] => {
  return filterWordsByMastered(words, true);
};

// Calculate mastery percentage
export const calculateMasteryPercentage = (words: Word[]): number => {
  if (words.length === 0) return 0;
  const masteredCount = words.filter((word) => word.mastered).length;
  return Math.round((masteredCount / words.length) * 100);
};

// Sort words by review times (ascending)
export const sortWordsByReviewTimes = (words: Word[]): Word[] => {
  return [...words].sort((a, b) => a.reviewTimes - b.reviewTimes);
};

// Sort words by last review time (oldest first)
export const sortWordsByLastReviewTime = (words: Word[]): Word[] => {
  return [...words].sort((a, b) => {
    if (!a.lastReviewTime && !b.lastReviewTime) return 0;
    if (!a.lastReviewTime) return -1;
    if (!b.lastReviewTime) return 1;
    return a.lastReviewTime - b.lastReviewTime;
  });
};

// Sort words by creation time (newest first)
export const sortWordsByCreateTime = (words: Word[]): Word[] => {
  return [...words].sort((a, b) => b.createTime - a.createTime);
};

// Get words that need review (not reviewed recently)
export const getWordsNeedingReview = (
  words: Word[],
  daysThreshold: number = 7,
): Word[] => {
  const now = Date.now();
  const thresholdMs = daysThreshold * 24 * 60 * 60 * 1000;

  return words.filter((word) => {
    if (!word.lastReviewTime) return true;
    return now - word.lastReviewTime > thresholdMs;
  });
};

// Validate word data
export const validateWord = (
  word: string,
  meaning: string,
): { isValid: boolean; error?: string } => {
  const trimmedWord = word.trim();
  const trimmedMeaning = meaning.trim();

  if (!trimmedWord) {
    return { isValid: false, error: "Word cannot be empty" };
  }

  if (!trimmedMeaning) {
    return { isValid: false, error: "Meaning cannot be empty" };
  }

  if (trimmedWord.length > 100) {
    return { isValid: false, error: "Word is too long (max 100 characters)" };
  }

  if (trimmedMeaning.length > 500) {
    return {
      isValid: false,
      error: "Meaning is too long (max 500 characters)",
    };
  }

  return { isValid: true };
};

// Validate unit name
export const validateUnitName = (
  name: string,
): { isValid: boolean; error?: string } => {
  const trimmedName = name.trim();

  if (!trimmedName) {
    return { isValid: false, error: "Unit name cannot be empty" };
  }

  if (trimmedName.length > 50) {
    return {
      isValid: false,
      error: "Unit name is too long (max 50 characters)",
    };
  }

  return { isValid: true };
};

// Check if word already exists in unit
export const isWordDuplicate = (words: Word[], newWord: string): boolean => {
  const normalizedNewWord = newWord.trim().toLowerCase();
  return words.some(
    (word) => word.word.trim().toLowerCase() === normalizedNewWord,
  );
};

// Get unit statistics
export const getUnitStats = (unit: Unit) => {
  const totalWords = unit.words.length;
  const masteredWords = getMasteredWords(unit.words).length;
  const masteryPercentage = calculateMasteryPercentage(unit.words);
  const needsReview = getWordsNeedingReview(unit.words).length;

  return {
    totalWords,
    masteredWords,
    masteryPercentage,
    needsReview,
    unmasteredWords: totalWords - masteredWords,
  };
};

// Get overall statistics from all units
export const getOverallStats = (data: StorageData) => {
  const allWords = data.units.flatMap((unit) => unit.words);
  const totalWords = allWords.length;
  const masteredWords = getMasteredWords(allWords).length;
  const masteryPercentage = calculateMasteryPercentage(allWords);
  const needsReview = getWordsNeedingReview(allWords).length;

  return {
    totalUnits: data.units.length,
    totalWords,
    masteredWords,
    masteryPercentage,
    needsReview,
    unmasteredWords: totalWords - masteredWords,
  };
};

// Format time duration for display
export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d`;
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${seconds}s`;
};

// Get time since last review
export const getTimeSinceLastReview = (word: Word): string => {
  if (!word.lastReviewTime) return "Never reviewed";

  const now = Date.now();
  const timeDiff = now - word.lastReviewTime;

  return formatDuration(timeDiff);
};
