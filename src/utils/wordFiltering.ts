// Word filtering utilities
import { Word } from '../types';
import { getAllData } from './wordUtils';

/**
 * Get all unmastered words
 */
export const getUnmasteredWords = (): Word[] => {
  const data = getAllData();
  const unmasteredWords: Word[] = [];
  
  data.units.forEach(unit => {
    unit.words.forEach(word => {
      if (!word.mastered) {
        unmasteredWords.push(word);
      }
    });
  });
  
  return unmasteredWords;
};

/**
 * Get all mastered words
 */
export const getMasteredWords = (): Word[] => {
  const data = getAllData();
  const masteredWords: Word[] = [];
  
  data.units.forEach(unit => {
    unit.words.forEach(word => {
      if (word.mastered) {
        masteredWords.push(word);
      }
    });
  });
  
  return masteredWords;
};

/**
 * Get words by unit ID
 */
export const getUnitWords = (unitId: string): Word[] => {
  const data = getAllData();
  const unit = data.units.find(u => u.id === unitId);
  return unit ? unit.words : [];
};

/**
 * Get words by review status
 */
export const getWordsByReviewStatus = (mastered: boolean): Word[] => {
  const data = getAllData();
  const filteredWords: Word[] = [];
  
  data.units.forEach(unit => {
    unit.words.forEach(word => {
      if (word.mastered === mastered) {
        filteredWords.push(word);
      }
    });
  });
  
  return filteredWords;
};

/**
 * Get words that need review (unmastered or recently reviewed)
 */
export const getWordsNeedingReview = (): Word[] => {
  const data = getAllData();
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  
  const wordsNeedingReview: Word[] = [];
  
  data.units.forEach(unit => {
    unit.words.forEach(word => {
      // Include unmastered words or words reviewed more than 24 hours ago
      if (!word.mastered || 
          (word.lastReviewTime && (now - word.lastReviewTime) > oneDay)) {
        wordsNeedingReview.push(word);
      }
    });
  });
  
  return wordsNeedingReview;
}; 