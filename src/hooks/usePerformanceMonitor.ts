// Performance monitoring hook
import { useEffect, useRef, useCallback } from "react";

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage?: number;
  fps: number;
  timestamp: number;
}

interface UsePerformanceMonitorOptions {
  enabled?: boolean;
  threshold?: number; // Warning threshold in milliseconds
  onPerformanceIssue?: (metrics: PerformanceMetrics) => void;
}

interface UsePerformanceMonitorReturn {
  startMeasure: () => void;
  endMeasure: (componentName?: string) => void;
  getMetrics: () => PerformanceMetrics[];
  clearMetrics: () => void;
  isPerformanceGood: () => boolean;
}

export function usePerformanceMonitor(
  options: UsePerformanceMonitorOptions = {},
): UsePerformanceMonitorReturn {
  const { enabled = true, threshold = 16, onPerformanceIssue } = options;
  const metricsRef = useRef<PerformanceMetrics[]>([]);
  const startTimeRef = useRef<number>(0);
  const frameCountRef = useRef<number>(0);
  const lastFrameTimeRef = useRef<number>(0);

  // Measure render time
  const startMeasure = useCallback(() => {
    if (!enabled) return;
    startTimeRef.current = performance.now();
  }, [enabled]);

  const endMeasure = useCallback(
    (componentName?: string) => {
      if (!enabled || startTimeRef.current === 0) return;

      const endTime = performance.now();
      const renderTime = endTime - startTimeRef.current;

      // Calculate FPS
      const currentTime = performance.now();
      frameCountRef.current++;

      if (currentTime - lastFrameTimeRef.current >= 1000) {
        const fps = Math.round(
          (frameCountRef.current * 1000) /
            (currentTime - lastFrameTimeRef.current),
        );
        frameCountRef.current = 0;
        lastFrameTimeRef.current = currentTime;

        // Get memory usage if available
        let memoryUsage: number | undefined;
        if ("memory" in performance) {
          const memory = (performance as any).memory;
          memoryUsage = memory.usedJSHeapSize / 1024 / 1024; // MB
        }

        const metric: PerformanceMetrics = {
          renderTime,
          memoryUsage,
          fps,
          timestamp: currentTime,
        };

        metricsRef.current.push(metric);

        // Check for performance issues
        if (renderTime > threshold) {
          console.warn(
            `Performance issue detected in ${componentName || "component"}:`,
            {
              renderTime: `${renderTime.toFixed(2)}ms`,
              threshold: `${threshold}ms`,
              fps,
              memoryUsage: memoryUsage ? `${memoryUsage.toFixed(2)}MB` : "N/A",
            },
          );

          onPerformanceIssue?.(metric);
        }

        // Keep only last 100 metrics
        if (metricsRef.current.length > 100) {
          metricsRef.current = metricsRef.current.slice(-100);
        }
      }

      startTimeRef.current = 0;
    },
    [enabled, threshold, onPerformanceIssue],
  );

  // Get all metrics
  const getMetrics = useCallback(() => {
    return [...metricsRef.current];
  }, []);

  // Clear metrics
  const clearMetrics = useCallback(() => {
    metricsRef.current = [];
  }, []);

  // Check if performance is good
  const isPerformanceGood = useCallback(() => {
    if (metricsRef.current.length === 0) return true;

    const recentMetrics = metricsRef.current.slice(-10);
    const avgRenderTime =
      recentMetrics.reduce((sum, m) => sum + m.renderTime, 0) /
      recentMetrics.length;
    const avgFps =
      recentMetrics.reduce((sum, m) => sum + m.fps, 0) / recentMetrics.length;

    return avgRenderTime < threshold && avgFps > 30;
  }, [threshold]);

  // Auto-measure on mount and unmount
  useEffect(() => {
    if (!enabled) return;

    startMeasure();

    return () => {
      endMeasure("Component");
    };
  }, [enabled, startMeasure, endMeasure]);

  return {
    startMeasure,
    endMeasure,
    getMetrics,
    clearMetrics,
    isPerformanceGood,
  };
}

// Hook for monitoring specific operations
export function useOperationMonitor(
  operationName: string,
  options: UsePerformanceMonitorOptions = {},
) {
  const { startMeasure, endMeasure, getMetrics } =
    usePerformanceMonitor(options);

  const monitorOperation = useCallback(
    async <T>(operation: () => Promise<T> | T): Promise<T> => {
      startMeasure();
      try {
        const result = await operation();
        return result;
      } finally {
        endMeasure(operationName);
      }
    },
    [startMeasure, endMeasure, operationName],
  );

  return {
    monitorOperation,
    getMetrics,
  };
}

// Hook for monitoring render performance
export function useRenderMonitor(
  componentName: string,
  options: UsePerformanceMonitorOptions = {},
) {
  const { startMeasure, endMeasure, isPerformanceGood } =
    usePerformanceMonitor(options);

  useEffect(() => {
    startMeasure();

    return () => {
      endMeasure(componentName);
    };
  }, [componentName, startMeasure, endMeasure]);

  return {
    isPerformanceGood,
  };
}
