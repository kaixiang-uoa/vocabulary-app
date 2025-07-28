// Main types definition

// Word data structure
export interface Word {
  id: string;
  word: string;
  meaning: string;
  unitId: string;
  mastered: boolean;
  createTime: number;
  reviewTimes: number;
  lastReviewTime: number | null;
  errorCount?: number; // Error count, for error book
  nextReviewDate?: number; // Next review time, for spaced repetition
  reviewLevel?: number; // Review level, for spaced repetition
}

// Unit data structure
export interface Unit {
  id: string;
  name: string;
  createTime: number;
  words: Word[];
}

// Storage data structure
export interface StorageData {
  units: Unit[];
}

// Component props types
export interface WordCardProps {
  word: Word & { difficulty?: string };
  isSelected?: boolean;
  onSelect?: (wordId: string) => void;
  onMasteredToggle?: (wordId: string) => void;
  onEdit?: (wordId: string, values: { word: string; meaning: string }) => void;
}

export interface SpellingReviewCardProps {
  word: Word;
  onMasteredToggle: () => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentIndex: number; // Current word index for restart detection
  failedWords: Set<string>;
  setFailedWords: (wordId: string) => void;
  onCompleted?: (id: string) => void;
  autoPlay?: boolean; // Auto play pronunciation when word changes
  pronunciationDelay?: number; // Delay before auto playing (in milliseconds)
}

export interface ReviewWordCardProps {
  word: Word;
  isFlipped: boolean;
  onFlip: () => void;
  onMasteredToggle?: (wordId: string) => void;
  flipMode: 'en2zh' | 'zh2en';
}

export interface UnitCardProps {
  unit: Unit;
  isSelected?: boolean;
  onSelect?: (unitId: string) => void;
  onEdit?: (unitId: string, values: { name: string }) => void;
}

export interface UnitListProps {
  units: Unit[];
  onUnitSelect: (unit: Unit) => void;
  onUnitEdit: (unit: Unit) => void;
  onUnitDelete: (unitId: string) => void;
  onAddUnit: (name: string) => void;
}

export interface AddWordFormProps {
  unitId: string;
  onWordAdded?: () => void;
}

export interface EditModalProps {
  visible: boolean;
  fields?: Field[];
  title?: string;
  onOk?: (values: Record<string, string>) => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
}

export interface ImportModalProps {
  visible: boolean;
  onOk: (parsed: ImportData) => void;
  onCancel: () => void;
  title: string;
  accept?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  placeholder?: string;
  validate?: (content: string) => string | null; // Return error message or null
}

export interface LanguageSwitcherProps {
  style?: React.CSSProperties;
  className?: string;
}

// Form types
export interface FormValues {
  [key: string]: any;
}

export interface Field {
  name: string;
  label: string;
  value?: string;
  rules?: any[];
  placeholder?: string;
}

// Utility types
export interface DifficultyColors {
  [key: string]: {
    bg: string;
    color: string;
    border: string;
  };
}

export interface InputHistoryItem {
  input: string;
  timestamp?: number;
  correct?: boolean;
}

// API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Import data format
export interface ImportWordData {
  word: string;
  meaning: string;
}

// Unit import data format
export interface ImportUnitData {
  unit: string;
  word: string;
  meaning: string;
}

// Complete data structure for import
export interface ImportCompleteData {
  units: {
    id?: string | number;
    name: string;
    words: {
      word: string;
      meaning: string;
    }[];
  }[];
}

// Union type for all import formats
export type ImportData = ImportWordData[] | ImportUnitData[] | ImportCompleteData;

// Learning stats type
export interface LearningStats {
  totalWords: number;
  masteredWords: number;
  unmasteredWords: number;
  todayReviewed: number;
  todayNewWords: number;
  accuracy: number;
}

// Hook types
export interface UseAutoPlayOptions {
  defaultEnabled?: boolean;
  defaultDelay?: number;
  minDelay?: number;
  maxDelay?: number;
}

export interface UseAutoPlayReturn {
  autoPlay: boolean;
  pronunciationDelay: number;
  setAutoPlay: (enabled: boolean) => void;
  setPronunciationDelay: (delay: number) => void;
  toggleAutoPlay: () => void;
}

// Simple audio play function type
export interface AudioPlayFunction {
  (word: string): void;
}

// New review data hook types
export interface UseReviewDataProps {
  unitId: string;
  reviewMode?: 'all' | 'unmastered' | 'mastered';
  reviewOrder?: 'sequential' | 'random';
}

export interface UseReviewDataReturn {
  data: {
    unit: Unit | null;
    words: Word[];
  };
  loading: boolean;
  error: string | null;
}

// Simple pronunciation options
export interface PronunciationOptions {
  type?: number; // 0: American, 1: British, 2: Auto
}

// Utility types
export interface SpellingValidationResult {
  isValid: boolean;
  isComplete: boolean;
  isCorrect: boolean;
  errorPosition?: number;
} 