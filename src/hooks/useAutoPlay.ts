import { useState, useCallback } from "react";
import { UseAutoPlayOptions, UseAutoPlayReturn } from "../types";

const STORAGE_KEY = "spelling_auto_play_settings";

export const useAutoPlay = (
  options: UseAutoPlayOptions = {},
): UseAutoPlayReturn => {
  const {
    defaultEnabled = false,
    defaultDelay = 2, // 2 seconds
    minDelay = 0,
    maxDelay = 10, // 10 seconds
  } = options;

  // Load settings from localStorage
  const loadSettings = (): { enabled: boolean; delay: number } => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const settings = JSON.parse(stored);
        return {
          enabled: settings.enabled ?? defaultEnabled,
          delay: settings.delay ?? defaultDelay,
        };
      }
    } catch (error) {
      console.error("Failed to load auto play settings:", error);
    }
    return { enabled: defaultEnabled, delay: defaultDelay };
  };

  const [autoPlay, setAutoPlayState] = useState(() => loadSettings().enabled);
  const [pronunciationDelay, setPronunciationDelayState] = useState(
    () => loadSettings().delay,
  );

  // Save settings to localStorage
  const saveSettings = useCallback((enabled: boolean, delay: number) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ enabled, delay }));
    } catch (error) {
      console.error("Failed to save auto play settings:", error);
    }
  }, []);

  const setAutoPlay = useCallback(
    (enabled: boolean) => {
      setAutoPlayState(enabled);
      saveSettings(enabled, pronunciationDelay);
    },
    [saveSettings, pronunciationDelay],
  );

  const setPronunciationDelay = useCallback(
    (delay: number) => {
      const clampedDelay = Math.max(minDelay, Math.min(maxDelay, delay));
      const roundedDelay = Math.round(clampedDelay); // Round to integer
      setPronunciationDelayState(roundedDelay);
      saveSettings(autoPlay, roundedDelay);
    },
    [minDelay, maxDelay, saveSettings, autoPlay],
  );

  const toggleAutoPlay = useCallback(() => {
    setAutoPlayState((prev) => {
      const newValue = !prev;
      saveSettings(newValue, pronunciationDelay);
      return newValue;
    });
  }, [saveSettings, pronunciationDelay]);

  return {
    autoPlay,
    pronunciationDelay,
    setAutoPlay,
    setPronunciationDelay,
    toggleAutoPlay,
  };
};
