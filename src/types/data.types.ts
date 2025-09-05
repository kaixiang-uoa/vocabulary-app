// 统一数据访问层接口定义
export interface DataAccessLayer {
  // 单元操作
  getUnit(id: string): Promise<Unit>;
  getAllUnits(): Promise<Unit[]>;
  saveUnit(unit: Unit): Promise<void>;
  deleteUnit(id: string): Promise<void>;

  // 词汇操作
  addWord(unitId: string, word: string, meaning: string): Promise<boolean>;
  updateWord(
    unitId: string,
    wordId: string,
    updatedWord: Partial<Word>
  ): Promise<boolean>;
  deleteWord(unitId: string, wordId: string): Promise<boolean>;

  // 词汇状态操作
  toggleWordMastered(unitId: string, wordId: string): Promise<boolean>;
  setWordMasteredStatus(
    unitId: string,
    wordId: string,
    mastered: boolean
  ): Promise<boolean>;

  // 批量操作
  deleteItems({
    type,
    ids,
    unitId,
  }: {
    type: 'word' | 'unit';
    ids: string[];
    unitId?: string;
  }): Promise<boolean>;

  // 数据导入导出
  exportUnitWordsToCSV(unitId: string): Promise<string>;
  importWordsFromCSV(unitId: string, csvContent: string): Promise<boolean>;
  addWordsInBatch(
    unitId: string,
    wordsArray: ImportWordData[]
  ): Promise<boolean>;

  // 统计功能
  getMasteredWords(): Promise<Word[]>;
  getUnmasteredWords(): Promise<Word[]>;
  getUnitWords(unitId: string): Promise<Word[]>;
}

// 数据模型
export interface Unit {
  id: string;
  name: string;
  words: Word[];
  createTime: number;
  updatedAt: number;
  syncStatus: 'synced' | 'pending' | 'conflict';
}

export interface Word {
  id: string;
  word: string;
  meaning: string;
  unitId: string;
  mastered: boolean;
  createTime: number;
  reviewTimes: number;
  lastReviewTime: number | null;
}

export type WordStatus = 'new' | 'learning' | 'mastered';

// 存储数据结构
export interface StorageData {
  units: Unit[];
}

// 同步命令接口
export interface SyncCommand {
  id: string;
  type:
    | 'CREATE_UNIT'
    | 'UPDATE_UNIT'
    | 'DELETE_UNIT'
    | 'UPDATE_WORD_STATUS'
    | 'ADD_WORD'
    | 'DELETE_WORD';
  payload: any;
  timestamp: number;
  priority: 'high' | 'normal' | 'low';
}

// 导入数据格式
export interface ImportWordData {
  word: string;
  meaning: string;
}

export interface ImportUnitData {
  unit: string;
  word: string;
  meaning: string;
}

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

export type ImportData =
  | ImportWordData[]
  | ImportUnitData[]
  | ImportCompleteData;

// 同步状态
export interface SyncStatus {
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  lastError: string | null;
}

// 学习统计
export interface LearningStats {
  totalWords: number;
  masteredWords: number;
  unmasteredWords: number;
  todayReviewed: number;
  todayNewWords: number;
  accuracy: number;
}

// 单元统计
export interface UnitStats {
  totalWords: number;
  masteredWords: number;
  unmasteredWords: number;
  accuracy: number;
}

// 迁移结果
export interface MigrationResult {
  success: boolean;
  message: string;
  migratedUnits: number;
  migratedWords: number;
}
