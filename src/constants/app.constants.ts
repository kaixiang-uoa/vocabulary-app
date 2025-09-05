// Application base constants
export const APP_NAME = 'Vocabulary App';
export const APP_VERSION = '1.0.0';

// Storage keys
export const STORAGE_KEYS = {
  VOCABULARY_DATA: 'vocabulary_data',
  USER_SETTINGS: 'user_settings',
  REVIEW_PROGRESS: 'review_progress',
} as const;

// UI constants
export const UI_CONSTANTS = {
  MAX_WORD_LENGTH: 100,
  MAX_MEANING_LENGTH: 500,
  MAX_UNIT_NAME_LENGTH: 50,
  MIN_WORD_LENGTH: 1,
  MIN_MEANING_LENGTH: 1,
  MIN_UNIT_NAME_LENGTH: 1,
} as const;

// Animation durations
export const ANIMATION_DURATIONS = {
  FAST: 150,
  NORMAL: 300,
  SLOW: 500,
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
