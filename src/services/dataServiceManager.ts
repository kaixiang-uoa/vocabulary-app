import { FirebaseDataService } from "./firebaseDataService";
import { StorageData, Unit, Word } from "../types";

// Interface for data service
export interface DataService {
  getAllData(): Promise<StorageData>;
  saveAllData(data: StorageData): Promise<boolean>;
  createUnit(unitName: string): Promise<string>;
  addWord(unitId: string, word: string, meaning: string): Promise<boolean>;
  updateWord(
    unitId: string,
    wordId: string,
    updatedWord: Partial<Word>,
  ): Promise<boolean>;
  updateUnit(unitId: string, updatedUnit: Partial<Unit>): Promise<boolean>;
  toggleWordMastered(unitId: string, wordId: string): Promise<boolean>;
  setWordMasteredStatus(
    unitId: string,
    wordId: string,
    mastered: boolean,
  ): Promise<boolean>;
  deleteItems({
    type,
    ids,
    unitId,
  }: {
    type: "word" | "unit";
    ids: string[];
    unitId?: string;
  }): Promise<boolean>;
  getMasteredWords(): Promise<Word[]>;
  getUnmasteredWords(): Promise<Word[]>;
}

// Local storage service implementation
class LocalStorageService implements DataService {
  private readonly STORAGE_KEY = "vocabulary-app-data";

  private getData(): StorageData {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : { units: [] };
    } catch (error) {
      console.error("Failed to get data from localStorage:", error);
      return { units: [] };
    }
  }

  private saveData(data: StorageData): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error("Failed to save data to localStorage:", error);
      return false;
    }
  }

  async getAllData(): Promise<StorageData> {
    return this.getData();
  }

  async saveAllData(data: StorageData): Promise<boolean> {
    return this.saveData(data);
  }

  async createUnit(unitName: string): Promise<string> {
    const data = this.getData();
    const newUnit: Unit = {
      id: crypto.randomUUID(),
      name: unitName.trim(),
      createTime: Date.now(),
      words: [],
    };

    data.units.push(newUnit);
    this.saveData(data);

    return newUnit.id;
  }

  async addWord(
    unitId: string,
    word: string,
    meaning: string,
  ): Promise<boolean> {
    const trimmedWord = word.trim();
    const trimmedMeaning = meaning.trim();

    if (!trimmedWord || !trimmedMeaning) {
      return false;
    }

    const data = this.getData();
    const unitIndex = data.units.findIndex((u) => u.id === unitId);

    if (unitIndex === -1) return false;

    const newWord: Word = {
      id: crypto.randomUUID(),
      word: trimmedWord,
      meaning: trimmedMeaning,
      unitId,
      mastered: false,
      createTime: Date.now(),
      reviewTimes: 0,
      lastReviewTime: null,
    };

    data.units[unitIndex].words.push(newWord);
    return this.saveData(data);
  }

  async updateWord(
    unitId: string,
    wordId: string,
    updatedWord: Partial<Word>,
  ): Promise<boolean> {
    const data = this.getData();
    const unitIndex = data.units.findIndex((u) => u.id === unitId);

    if (unitIndex === -1) return false;

    const wordIndex = data.units[unitIndex].words.findIndex(
      (w) => w.id === wordId,
    );

    if (wordIndex === -1) return false;

    data.units[unitIndex].words[wordIndex] = {
      ...data.units[unitIndex].words[wordIndex],
      ...updatedWord,
    };

    return this.saveData(data);
  }

  async updateUnit(
    unitId: string,
    updatedUnit: Partial<Unit>,
  ): Promise<boolean> {
    const data = this.getData();
    const unitIndex = data.units.findIndex((u) => u.id === unitId);

    if (unitIndex === -1) return false;

    data.units[unitIndex] = {
      ...data.units[unitIndex],
      ...updatedUnit,
    };

    return this.saveData(data);
  }

  async toggleWordMastered(unitId: string, wordId: string): Promise<boolean> {
    const data = this.getData();
    const unitIndex = data.units.findIndex((u) => u.id === unitId);

    if (unitIndex === -1) return false;

    const wordIndex = data.units[unitIndex].words.findIndex(
      (w) => w.id === wordId,
    );

    if (wordIndex === -1) return false;

    data.units[unitIndex].words[wordIndex].mastered =
      !data.units[unitIndex].words[wordIndex].mastered;
    data.units[unitIndex].words[wordIndex].reviewTimes += 1;
    data.units[unitIndex].words[wordIndex].lastReviewTime = Date.now();

    return this.saveData(data);
  }

  async setWordMasteredStatus(
    unitId: string,
    wordId: string,
    mastered: boolean,
  ): Promise<boolean> {
    const data = this.getData();
    const unitIndex = data.units.findIndex((u) => u.id === unitId);

    if (unitIndex === -1) return false;

    const wordIndex = data.units[unitIndex].words.findIndex(
      (w) => w.id === wordId,
    );

    if (wordIndex === -1) return false;

    data.units[unitIndex].words[wordIndex].mastered = mastered;
    data.units[unitIndex].words[wordIndex].reviewTimes += 1;
    data.units[unitIndex].words[wordIndex].lastReviewTime = Date.now();

    return this.saveData(data);
  }

  async deleteItems({
    type,
    ids,
    unitId,
  }: {
    type: "word" | "unit";
    ids: string[];
    unitId?: string;
  }): Promise<boolean> {
    const data = this.getData();

    if (type === "word" && unitId) {
      const unitIndex = data.units.findIndex((u) => u.id === unitId);
      if (unitIndex === -1) return false;

      data.units[unitIndex].words = data.units[unitIndex].words.filter(
        (word) => !ids.includes(word.id),
      );
    } else if (type === "unit") {
      data.units = data.units.filter((unit) => !ids.includes(unit.id));
    }

    return this.saveData(data);
  }

  async getMasteredWords(): Promise<Word[]> {
    const data = this.getData();
    return data.units.flatMap((unit) =>
      unit.words.filter((word) => word.mastered),
    );
  }

  async getUnmasteredWords(): Promise<Word[]> {
    const data = this.getData();
    return data.units.flatMap((unit) =>
      unit.words.filter((word) => !word.mastered),
    );
  }
}

// Data service manager
export class DataServiceManager {
  private static instance: DataServiceManager;
  private currentService: DataService | null = null;
  private userId: string | null = null;

  private constructor() {}

  static getInstance(): DataServiceManager {
    if (!DataServiceManager.instance) {
      DataServiceManager.instance = new DataServiceManager();
    }
    return DataServiceManager.instance;
  }

  // Initialize the data service based on user authentication
  initialize(userId: string | null): void {
    this.userId = userId;

    if (userId) {
      // User is logged in, use Firebase
      this.currentService = new FirebaseDataService(userId);
      
    } else {
      // User is not logged in, use localStorage
      this.currentService = new LocalStorageService();
      
    }
  }

  // Get the current data service
  getService(): DataService {
    if (!this.currentService) {
      // Fallback to localStorage if no service is initialized
      this.currentService = new LocalStorageService();
    }
    return this.currentService;
  }

  // Check if using Firebase
  isUsingFirebase(): boolean {
    return this.currentService instanceof FirebaseDataService;
  }

  // Get current user ID
  getCurrentUserId(): string | null {
    return this.userId;
  }
}

// Convenience functions for easy access
export const getDataService = (): DataService => {
  return DataServiceManager.getInstance().getService();
};

export const initializeDataService = (userId: string | null): void => {
  DataServiceManager.getInstance().initialize(userId);
};

export const isUsingFirebase = (): boolean => {
  return DataServiceManager.getInstance().isUsingFirebase();
};
