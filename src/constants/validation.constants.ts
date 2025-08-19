// Validation related constants
export const VALIDATION_CONSTANTS = {
  // Word validation
  WORD: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 100,
    PATTERN: /^[a-zA-Z\s\-']+$/,
    ALLOWED_CHARS: "Letters, spaces, hyphens, and apostrophes only",
  } as const,

  // Meaning validation
  MEANING: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 500,
    PATTERN: /^[\u4e00-\u9fa5a-zA-Z\s\-',.!?;:()]+$/,
    ALLOWED_CHARS: "Chinese characters, letters, spaces, and basic punctuation",
  } as const,

  // Unit name validation
  UNIT_NAME: {
    MIN_LENGTH: 1,
    MAX_LENGTH: 50,
    PATTERN: /^[\u4e00-\u9fa5a-zA-Z0-9\s\-_]+$/,
    ALLOWED_CHARS:
      "Chinese characters, letters, numbers, spaces, hyphens, and underscores",
  } as const,

  // Error messages
  ERROR_MESSAGES: {
    WORD_EMPTY: "Word cannot be empty",
    WORD_TOO_LONG: "Word is too long (max 100 characters)",
    WORD_INVALID_CHARS: "Word contains invalid characters",
    MEANING_EMPTY: "Meaning cannot be empty",
    MEANING_TOO_LONG: "Meaning is too long (max 500 characters)",
    MEANING_INVALID_CHARS: "Meaning contains invalid characters",
    UNIT_NAME_EMPTY: "Unit name cannot be empty",
    UNIT_NAME_TOO_LONG: "Unit name is too long (max 50 characters)",
    UNIT_NAME_INVALID_CHARS: "Unit name contains invalid characters",
    WORD_DUPLICATE: "Word already exists in this unit",
    UNIT_NAME_DUPLICATE: "Unit name already exists",
  } as const,
} as const;

// Validation rules
export const VALIDATION_RULES = {
  // Required field validation
  REQUIRED: (value: string): boolean => {
    return value.trim().length > 0;
  },

  // Length validation
  LENGTH: (value: string, min: number, max: number): boolean => {
    const length = value.trim().length;
    return length >= min && length <= max;
  },

  // Pattern validation
  PATTERN: (value: string, pattern: RegExp): boolean => {
    return pattern.test(value.trim());
  },

  // Duplicate validation
  DUPLICATE: (value: string, existingValues: string[]): boolean => {
    const normalizedValue = value.trim().toLowerCase();
    return !existingValues.some(
      (existing) => existing.trim().toLowerCase() === normalizedValue,
    );
  },
} as const;
