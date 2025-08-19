import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { getAllData } from "../services/wordService";
import { Unit, UseReviewDataProps, UseReviewDataReturn } from "../types";

export const useReviewData = ({
  unitId,
  reviewMode = "all",
  reviewOrder = "sequential",
  refreshTrigger = 0,
}: UseReviewDataProps): UseReviewDataReturn => {
  const [unit, setUnit] = useState<Unit | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref for tracking loading state and preventing duplicate requests
  const loadingPromise = useRef<Promise<any> | null>(null);
  const lastLoadedUnitId = useRef<string>("");
  const lastLoadTime = useRef<number>(0);
  const isInitialized = useRef(false);
  const cachedUnit = useRef<Unit | null>(null);

  // Load unit data with improved debouncing and promise management
  const loadData = useCallback(async (targetUnitId: string) => {
    const now = Date.now();

    // Debounce check: skip requests within 100ms for the same unit
    if (
      lastLoadedUnitId.current === targetUnitId &&
      now - lastLoadTime.current < 100
    ) {
      console.log(
        "useReviewData: Skipping duplicate request for unitId:",
        targetUnitId,
      );
      return;
    }

    // If there's already a loading promise for the same unit, wait for it
    if (loadingPromise.current && lastLoadedUnitId.current === targetUnitId) {
      console.log(
        "useReviewData: Waiting for existing load promise for unitId:",
        targetUnitId,
      );
      return loadingPromise.current;
    }

    console.log(
      "useReviewData: Loading data for unitId:",
      targetUnitId,
      "timestamp:",
      now,
    );

    lastLoadedUnitId.current = targetUnitId;
    lastLoadTime.current = now;
    setIsLoading(true);
    setError(null);

    // Create loading promise
    const loadPromise = (async () => {
      try {
        const allData = await getAllData();
        const currentUnit = allData.units.find((u) => u.id === targetUnitId);

        if (!currentUnit) {
          throw new Error("Unit not found");
        }

        // Always update unit when refreshTrigger changes to ensure real-time data
        cachedUnit.current = currentUnit;
        setUnit(currentUnit);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to load unit data";
        setError(errorMessage);
        setUnit(null);
        throw err;
      } finally {
        setIsLoading(false);
        loadingPromise.current = null;
      }
    })();

    loadingPromise.current = loadPromise;
    return loadPromise;
  }, []);

  // Load data when unitId changes or refreshTrigger changes
  useEffect(() => {
    if (!unitId) {
      setUnit(null);
      setIsLoading(false);
      setError(null);
      return;
    }

    // Initialize on first load
    if (!isInitialized.current) {
      isInitialized.current = true;
    }

    loadData(unitId).catch(console.error);
  }, [unitId, loadData, refreshTrigger]);

  // Memoized filtered words for current mode and order - use real-time data
  const filteredWords = useMemo(() => {
    if (!unit) return [];

    console.log(
      "useReviewData: Filtering words for mode:",
      reviewMode,
      "order:",
      reviewOrder,
    );

    // Use unit data directly since it's already fresh from the hook
    let words = unit.words;

    // Filter by review mode
    if (reviewMode === "unmastered") {
      words = words.filter((word) => !word.mastered);
    } else if (reviewMode === "mastered") {
      words = words.filter((word) => word.mastered);
    }

    // Sort by review order
    if (reviewOrder === "random") {
      words = [...words].sort(() => Math.random() - 0.5);
    }

    console.log("useReviewData: Filtered words count:", words.length);
    return words;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unit?.id, reviewMode, reviewOrder, unitId, refreshTrigger]); // Add refreshTrigger to ensure real-time updates

  return {
    data: {
      unit,
      words: filteredWords,
    },
    loading: isLoading,
    error,
  };
};
