// Hook-related type definitions
import { Unit, Word } from "./index";

export interface UseReviewDataOptions {
  unitId: string | undefined;
  reviewMode: "all" | "unmastered" | "mastered";
  reviewOrder: "sequential" | "random";
  refreshTrigger?: number;
}

export interface UseReviewDataReturn {
  unit: Unit | null;
  words: Word[];
  isLoading: boolean;
  error: string | null;
}

export interface UseReviewNavigationOptions {
  words: Word[];
}

export interface UseReviewNavigationReturn {
  // Current state
  currentWord: Word | null;
  currentIndex: number;
  isFirst: boolean;
  isLast: boolean;
  progress: number;

  // Navigation
  nextWord: () => void;
  prevWord: () => void;
  restart: () => void;
  goToWord: (index: number) => void;

  // Progress tracking
  completedWords: Set<string>;
  failedWords: Set<string>;
  markCompleted: (wordId: string) => void;
  markFailed: (wordId: string) => void;
}

export interface UseReviewAudioOptions {
  autoPlay: boolean;
  pronunciationDelay: number;
}

export interface UseReviewAudioReturn {
  playInitial: () => void;
  playError: () => void;
  playSuccess: () => void;
  playManual: () => void;
  resetInitialization: () => void;
}

export interface UseAutoPlayOptions {
  defaultEnabled?: boolean;
  defaultDelay?: number;
}

export interface UseAutoPlayReturn {
  autoPlay: boolean;
  pronunciationDelay: number;
  setAutoPlay: (enabled: boolean) => void;
  setPronunciationDelay: (delay: number) => void;
}
