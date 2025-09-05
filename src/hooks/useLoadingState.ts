import { useState, useCallback, useEffect } from 'react';

export interface LoadingState {
  isLoading: boolean;
  isInitialLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  hasData: boolean;
}

export interface UseLoadingStateOptions {
  // Initial loading delay (ms) before showing skeleton
  skeletonDelay?: number;

  // Whether to show skeleton on initial load
  showSkeleton?: boolean;

  // Whether to show skeleton on refresh
  showSkeletonOnRefresh?: boolean;

  // Error retry options
  retryOnError?: boolean;
  maxRetries?: number;
  retryDelay?: number;
}

export interface UseLoadingStateReturn extends LoadingState {
  // State setters
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setHasData: (hasData: boolean) => void;

  // Action helpers
  startLoading: () => void;
  startRefreshing: () => void;
  finishLoading: () => void;
  setData: (data: any) => void;

  // Skeleton state
  showSkeleton: boolean;

  // Retry functionality
  retry: () => void;
  retryCount: number;
}

export const useLoadingState = (
  initialData: any = null,
  options: UseLoadingStateOptions = {}
): UseLoadingStateReturn => {
  const {
    skeletonDelay = 300,
    showSkeleton: initialShowSkeleton = true,
    showSkeletonOnRefresh = false,
    maxRetries = 3,
    retryDelay = 1000,
  } = options;

  // Core state
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasData, setHasData] = useState(!!initialData);
  const [retryCount, setRetryCount] = useState(0);

  // Skeleton state
  const [showSkeleton, setShowSkeleton] = useState(initialShowSkeleton);
  const [skeletonTimer, setSkeletonTimer] = useState<NodeJS.Timeout | null>(
    null
  );

  // Clear skeleton timer on unmount
  useEffect(() => {
    return () => {
      if (skeletonTimer) {
        clearTimeout(skeletonTimer);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove skeletonTimer dependency to prevent infinite loop

  // Start skeleton timer
  const startSkeletonTimer = useCallback(() => {
    if (skeletonTimer) {
      clearTimeout(skeletonTimer);
    }

    const timer = setTimeout(() => {
      setShowSkeleton(true);
    }, skeletonDelay);

    setSkeletonTimer(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skeletonDelay]); // Remove skeletonTimer dependency to prevent infinite loop

  // Stop skeleton timer
  const stopSkeletonTimer = useCallback(() => {
    if (skeletonTimer) {
      clearTimeout(skeletonTimer);
      setSkeletonTimer(null);
    }
    setShowSkeleton(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Remove skeletonTimer dependency to prevent infinite loop

  // Start loading
  const startLoading = useCallback(() => {
    setIsLoading(true);
    setError(null);

    if (isInitialLoading) {
      startSkeletonTimer();
    } else if (showSkeletonOnRefresh) {
      setIsRefreshing(true);
    }
  }, [isInitialLoading, showSkeletonOnRefresh, startSkeletonTimer]);

  // Start refreshing
  const startRefreshing = useCallback(() => {
    setIsRefreshing(true);
    setError(null);

    if (showSkeletonOnRefresh) {
      startSkeletonTimer();
    }
  }, [showSkeletonOnRefresh, startSkeletonTimer]);

  // Finish loading
  const finishLoading = useCallback(() => {
    setIsLoading(false);
    setIsInitialLoading(false);
    setIsRefreshing(false);
    stopSkeletonTimer();
  }, [stopSkeletonTimer]);

  // Set data
  const setData = useCallback(
    (data: any) => {
      setHasData(!!data);
      finishLoading();
    },
    [finishLoading]
  );

  // Retry functionality
  const retry = useCallback(() => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(null);
      startLoading();

      // Auto-retry after delay
      setTimeout(() => {
        // This would typically trigger a re-fetch
        // The actual implementation depends on the data fetching logic
      }, retryDelay);
    }
  }, [retryCount, maxRetries, retryDelay, startLoading]);

  // Reset retry count when successful
  useEffect(() => {
    if (hasData && !isLoading && !error) {
      setRetryCount(0);
    }
  }, [hasData, isLoading, error]);

  return {
    // State
    isLoading,
    isInitialLoading,
    isRefreshing,
    error,
    hasData,
    showSkeleton,
    retryCount,

    // Setters
    setLoading: setIsLoading,
    setError,
    setHasData,

    // Actions
    startLoading,
    startRefreshing,
    finishLoading,
    setData,
    retry,
  };
};

// Specialized hooks for common use cases
export const useInitialLoading = (options?: UseLoadingStateOptions) => {
  return useLoadingState(null, {
    showSkeleton: true,
    skeletonDelay: 500,
    ...options,
  });
};

export const useRefreshLoading = (options?: UseLoadingStateOptions) => {
  return useLoadingState(null, {
    showSkeleton: false,
    showSkeletonOnRefresh: true,
    ...options,
  });
};

export const useProgressiveLoading = (options?: UseLoadingStateOptions) => {
  return useLoadingState(null, {
    showSkeleton: true,
    skeletonDelay: 200,
    showSkeletonOnRefresh: true,
    ...options,
  });
};
