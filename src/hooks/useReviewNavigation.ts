import { useState, useMemo } from 'react';
import { Word } from '../types';

interface UseReviewNavigationOptions {
  words: Word[];
}

export const useReviewNavigation = ({ words }: UseReviewNavigationOptions) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [completedWords, setCompletedWords] = useState<Set<string>>(new Set());
  const [failedWords, setFailedWords] = useState<Set<string>>(new Set());

  // Current word
  const currentWord = useMemo(() => {
    // Reset currentIndex if it's out of bounds
    if (currentIndex >= words.length && words.length > 0) {
      setCurrentIndex(0);
      return words[0] || null;
    }
    return words[currentIndex] || null;
  }, [words, currentIndex]);

  // Navigation state
  const isFirst = currentIndex === 0;
  const isLast = currentIndex === words.length - 1;
  const progress = words.length > 0 ? Math.round(((currentIndex + 1) / words.length) * 100) : 0;

  // Navigation functions
  const nextWord = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevWord = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const restart = () => {
    setCurrentIndex(0);
    setCompletedWords(new Set());
    setFailedWords(new Set());
  };

  const goToWord = (index: number) => {
    if (index >= 0 && index < words.length) {
      setCurrentIndex(index);
    }
  };

  // Progress tracking
  const markCompleted = (wordId: string) => {
    setCompletedWords(prev => new Set(prev).add(wordId));
  };

  const markFailed = (wordId: string) => {
    setFailedWords(prev => new Set(prev).add(wordId));
  };



  return {
    // Current state
    currentWord,
    currentIndex,
    isFirst,
    isLast,
    progress,
    
    // Navigation
    nextWord,
    prevWord,
    restart,
    goToWord,
    
    // Progress tracking
    completedWords,
    failedWords,
    markCompleted,
    markFailed
  };
}; 