import { useMemo } from 'react';

import { useWordContext } from '../contexts/WordContext';
import { Unit, UseReviewDataProps, UseReviewDataReturn } from '../types';

export const useReviewData = ({
  unitId,
  reviewMode = 'all',
  reviewOrder = 'sequential',
  refreshTrigger = 0,
}: UseReviewDataProps): UseReviewDataReturn => {
  const { data, loading } = useWordContext();
  const unit: Unit | null = useMemo(() => {
    if (!data) return null;
    return data.units.find(u => u.id === unitId) || null;
  }, [data, unitId]);

  // Memoized filtered words for current mode and order - use real-time data
  const filteredWords = useMemo(() => {
    if (!unit) return [];

    // Use unit data directly since it's already fresh from the context
    let words = unit.words;

    // Filter by review mode
    if (reviewMode === 'unmastered') {
      words = words.filter(word => !word.mastered);
    } else if (reviewMode === 'mastered') {
      words = words.filter(word => word.mastered);
    }

    // Sort by review order
    if (reviewOrder === 'random') {
      words = [...words].sort(() => Math.random() - 0.5);
    }

    return words;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit?.id, reviewMode, reviewOrder, unitId]);

  return {
    data: {
      unit,
      words: filteredWords,
    },
    loading,
    error: null,
  };
};
