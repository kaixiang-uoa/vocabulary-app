// Review related constants
export const REVIEW_CONSTANTS = {
  // Review intervals (in days)
  INTERVALS: {
    IMMEDIATE: 0,
    ONE_DAY: 1,
    THREE_DAYS: 3,
    ONE_WEEK: 7,
    TWO_WEEKS: 14,
    ONE_MONTH: 30,
  } as const,

  // Review thresholds
  THRESHOLDS: {
    MASTERY_REQUIRED_REVIEWS: 3,
    MIN_REVIEW_INTERVAL_HOURS: 1,
    MAX_REVIEW_INTERVAL_DAYS: 365,
  } as const,

  // Review modes
  MODES: {
    NORMAL: 'normal',
    SPELLING: 'spelling',
    LISTENING: 'listening',
  } as const,

  // Auto-play settings
  AUTO_PLAY: {
    DEFAULT_DELAY: 3000,
    MIN_DELAY: 1000,
    MAX_DELAY: 10000,
  } as const,
} as const;

// Review status
export const REVIEW_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  PAUSED: 'paused',
} as const;

// Review result types
export const REVIEW_RESULT = {
  CORRECT: 'correct',
  INCORRECT: 'incorrect',
  SKIPPED: 'skipped',
} as const;
