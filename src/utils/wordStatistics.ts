// Word statistics utilities
import { Word, Unit, LearningStats } from '../types';
import { getAllData } from './wordUtils';

/**
 * Calculate learning statistics
 */
export const calculateLearningStats = (): LearningStats => {
  const data = getAllData();
  const now = Date.now();
  const today = new Date(now).setHours(0, 0, 0, 0);
  
  let totalWords = 0;
  let masteredWords = 0;
  let unmasteredWords = 0;
  let todayReviewed = 0;
  let todayNewWords = 0;
  
  data.units.forEach(unit => {
    unit.words.forEach(word => {
      totalWords++;
      
      if (word.mastered) {
        masteredWords++;
      } else {
        unmasteredWords++;
      }
      
      // Count words reviewed today
      if (word.lastReviewTime && word.lastReviewTime >= today) {
        todayReviewed++;
      }
      
      // Count new words created today
      if (word.createTime >= today) {
        todayNewWords++;
      }
    });
  });
  
  const accuracy = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;
  
  return {
    totalWords,
    masteredWords,
    unmasteredWords,
    todayReviewed,
    todayNewWords,
    accuracy: Math.round(accuracy * 100) / 100 // Round to 2 decimal places
  };
};

/**
 * Get unit statistics
 */
export const getUnitStats = (unitId: string) => {
  const data = getAllData();
  const unit = data.units.find(u => u.id === unitId);
  
  if (!unit) {
    return {
      totalWords: 0,
      masteredWords: 0,
      unmasteredWords: 0,
      accuracy: 0
    };
  }
  
  const totalWords = unit.words.length;
  const masteredWords = unit.words.filter(word => word.mastered).length;
  const unmasteredWords = totalWords - masteredWords;
  const accuracy = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;
  
  return {
    totalWords,
    masteredWords,
    unmasteredWords,
    accuracy: Math.round(accuracy * 100) / 100
  };
};

/**
 * Get review statistics for a word
 */
export const getWordReviewStats = (word: Word) => {
  const now = Date.now();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;
  
  const daysSinceLastReview = word.lastReviewTime 
    ? Math.floor((now - word.lastReviewTime) / oneDay)
    : null;
    
  const daysSinceCreation = Math.floor((now - word.createTime) / oneDay);
  
  return {
    reviewTimes: word.reviewTimes,
    daysSinceLastReview,
    daysSinceCreation,
    isRecentlyReviewed: word.lastReviewTime && (now - word.lastReviewTime) < oneDay,
    needsReview: !word.mastered || (word.lastReviewTime && (now - word.lastReviewTime) > oneWeek)
  };
};

/**
 * Get overall progress statistics
 */
export const getOverallProgress = () => {
  const stats = calculateLearningStats();
  const data = getAllData();
  
  const totalUnits = data.units.length;
  const completedUnits = data.units.filter(unit => {
    const unitStats = getUnitStats(unit.id);
    return unitStats.totalWords > 0 && unitStats.accuracy === 100;
  }).length;
  
  return {
    ...stats,
    totalUnits,
    completedUnits,
    unitProgress: totalUnits > 0 ? (completedUnits / totalUnits) * 100 : 0
  };
}; 