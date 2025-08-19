import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  query,
  where,
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { StorageData, Unit, Word } from "../types";

export class FirebaseDataService {
  private userId: string;

  constructor(userId: string) {
    this.userId = userId;
  }

  // Get user's units collection reference
  private getUnitsCollection() {
    return collection(db, `users/${this.userId}/units`);
  }

  // Get words collection reference for a unit
  private getWordsCollection(unitId: string) {
    return collection(db, `users/${this.userId}/units/${unitId}/words`);
  }

  // Get all data (units and their words)
  async getAllData(): Promise<StorageData> {
    try {
      const unitsSnapshot = await getDocs(this.getUnitsCollection());
      const units: Unit[] = [];

      for (const unitDoc of unitsSnapshot.docs) {
        const unitData = unitDoc.data();
        const wordsSnapshot = await getDocs(
          this.getWordsCollection(unitDoc.id),
        );
        const words: Word[] = [];

        wordsSnapshot.forEach((wordDoc) => {
          const wordData = wordDoc.data();

          // Safely handle createTime conversion
          let createTime = Date.now();
          if (wordData.createTime) {
            if (typeof wordData.createTime.toMillis === "function") {
              createTime = wordData.createTime.toMillis();
            } else if (wordData.createTime.seconds) {
              createTime = wordData.createTime.seconds * 1000;
            } else if (typeof wordData.createTime === "number") {
              createTime = wordData.createTime;
            }
          }

          // Safely handle lastReviewTime conversion
          let lastReviewTime = null;
          if (wordData.lastReviewTime) {
            if (typeof wordData.lastReviewTime.toMillis === "function") {
              lastReviewTime = wordData.lastReviewTime.toMillis();
            } else if (wordData.lastReviewTime.seconds) {
              lastReviewTime = wordData.lastReviewTime.seconds * 1000;
            } else if (typeof wordData.lastReviewTime === "number") {
              lastReviewTime = wordData.lastReviewTime;
            }
          }

          words.push({
            id: wordDoc.id,
            unitId: unitDoc.id,
            word: wordData.word,
            meaning: wordData.meaning,
            mastered: wordData.mastered || false,
            createTime,
            reviewTimes: wordData.reviewTimes || 0,
            lastReviewTime,
          });
        });

        // Safely handle unit createTime conversion
        let unitCreateTime = Date.now();
        if (unitData.createTime) {
          if (typeof unitData.createTime.toMillis === "function") {
            unitCreateTime = unitData.createTime.toMillis();
          } else if (unitData.createTime.seconds) {
            unitCreateTime = unitData.createTime.seconds * 1000;
          } else if (typeof unitData.createTime === "number") {
            unitCreateTime = unitData.createTime;
          }
        }

        units.push({
          id: unitDoc.id,
          name: unitData.name,
          createTime: unitCreateTime,
          words,
        });
      }

      return { units };
    } catch (error) {
      console.error("Error getting all data:", error);
      throw new Error("Failed to load data from Firebase");
    }
  }

  // Save all data (used for migration)
  async saveAllData(data: StorageData): Promise<boolean> {
    try {
      const batch = writeBatch(db);

      // Clear existing data
      const existingUnits = await getDocs(this.getUnitsCollection());
      existingUnits.docs.forEach((unitDoc) => {
        batch.delete(unitDoc.ref);
      });

      // Add new data
      for (const unit of data.units) {
        const unitRef = doc(this.getUnitsCollection());
        const { id, words, ...unitData } = unit;

        batch.set(unitRef, {
          ...unitData,
          createTime: serverTimestamp(),
        });

        // Add words for this unit
        for (const word of words) {
          const wordRef = doc(this.getWordsCollection(unitRef.id));
          const { id: wordId, unitId, ...wordData } = word;

          batch.set(wordRef, {
            ...wordData,
            createTime: serverTimestamp(),
          });
        }
      }

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error saving all data:", error);
      throw new Error("Failed to save data to Firebase");
    }
  }

  // Create a new unit
  async createUnit(unitName: string): Promise<string> {
    try {
      const unitData = {
        name: unitName.trim(),
        createTime: serverTimestamp(),
      };

      const docRef = await addDoc(this.getUnitsCollection(), unitData);
      return docRef.id;
    } catch (error) {
      console.error("Error creating unit:", error);
      throw new Error("Failed to create unit");
    }
  }

  // Add a word to a unit
  async addWord(
    unitId: string,
    word: string,
    meaning: string,
  ): Promise<boolean> {
    try {
      const trimmedWord = word.trim();
      const trimmedMeaning = meaning.trim();

      if (!trimmedWord || !trimmedMeaning) {
        return false;
      }

      const wordData = {
        word: trimmedWord,
        meaning: trimmedMeaning,
        mastered: false,
        createTime: serverTimestamp(),
        reviewTimes: 0,
        lastReviewTime: null,
      };

      await addDoc(this.getWordsCollection(unitId), wordData);
      return true;
    } catch (error) {
      console.error("Error adding word:", error);
      throw new Error("Failed to add word");
    }
  }

  // Update a word
  async updateWord(
    unitId: string,
    wordId: string,
    updatedWord: Partial<Word>,
  ): Promise<boolean> {
    try {
      const wordRef = doc(this.getWordsCollection(unitId), wordId);
      const updateData: any = {};

      // Only update provided fields
      if (updatedWord.word !== undefined) updateData.word = updatedWord.word;
      if (updatedWord.meaning !== undefined)
        updateData.meaning = updatedWord.meaning;
      if (updatedWord.mastered !== undefined)
        updateData.mastered = updatedWord.mastered;
      if (updatedWord.reviewTimes !== undefined)
        updateData.reviewTimes = updatedWord.reviewTimes;
      if (updatedWord.lastReviewTime !== undefined) {
        updateData.lastReviewTime = updatedWord.lastReviewTime
          ? new Date(updatedWord.lastReviewTime)
          : null;
      }

      await updateDoc(wordRef, updateData);
      return true;
    } catch (error) {
      console.error("Error updating word:", error);
      throw new Error("Failed to update word");
    }
  }

  // Update a unit
  async updateUnit(
    unitId: string,
    updatedUnit: Partial<Unit>,
  ): Promise<boolean> {
    try {
      const unitRef = doc(this.getUnitsCollection(), unitId);
      const updateData: any = {};

      if (updatedUnit.name !== undefined) updateData.name = updatedUnit.name;

      await updateDoc(unitRef, updateData);
      return true;
    } catch (error) {
      console.error("Error updating unit:", error);
      throw new Error("Failed to update unit");
    }
  }

  // Toggle word mastered status
  async toggleWordMastered(unitId: string, wordId: string): Promise<boolean> {
    try {
      const wordRef = doc(this.getWordsCollection(unitId), wordId);

      // Get current word data
      const wordDoc = await getDocs(
        query(this.getWordsCollection(unitId), where("__name__", "==", wordId)),
      );
      if (wordDoc.empty) return false;

      const currentData = wordDoc.docs[0].data();
      const newMastered = !currentData.mastered;

      await updateDoc(wordRef, {
        mastered: newMastered,
        reviewTimes: (currentData.reviewTimes || 0) + 1,
        lastReviewTime: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Error toggling word mastered status:", error);
      throw new Error("Failed to update word status");
    }
  }

  // Set word mastered status
  async setWordMasteredStatus(
    unitId: string,
    wordId: string,
    mastered: boolean,
  ): Promise<boolean> {
    try {
      const wordRef = doc(this.getWordsCollection(unitId), wordId);

      // Get current word data
      const wordDoc = await getDocs(
        query(this.getWordsCollection(unitId), where("__name__", "==", wordId)),
      );
      if (wordDoc.empty) return false;

      const currentData = wordDoc.docs[0].data();

      await updateDoc(wordRef, {
        mastered,
        reviewTimes: (currentData.reviewTimes || 0) + 1,
        lastReviewTime: serverTimestamp(),
      });

      return true;
    } catch (error) {
      console.error("Error setting word mastered status:", error);
      throw new Error("Failed to update word status");
    }
  }

  // Delete items (words or units)
  async deleteItems({
    type,
    ids,
    unitId,
  }: {
    type: "word" | "unit";
    ids: string[];
    unitId?: string;
  }): Promise<boolean> {
    try {
      const batch = writeBatch(db);

      if (type === "word" && unitId) {
        // Delete words
        for (const wordId of ids) {
          const wordRef = doc(this.getWordsCollection(unitId), wordId);
          batch.delete(wordRef);
        }
      } else if (type === "unit") {
        // Delete units and their words
        for (const unitId of ids) {
          // Delete all words in the unit
          const wordsSnapshot = await getDocs(this.getWordsCollection(unitId));
          wordsSnapshot.docs.forEach((wordDoc) => {
            batch.delete(wordDoc.ref);
          });

          // Delete the unit
          const unitRef = doc(this.getUnitsCollection(), unitId);
          batch.delete(unitRef);
        }
      }

      await batch.commit();
      return true;
    } catch (error) {
      console.error("Error deleting items:", error);
      throw new Error("Failed to delete items");
    }
  }

  // Get mastered words
  async getMasteredWords(): Promise<Word[]> {
    try {
      const allData = await this.getAllData();
      return allData.units.flatMap((unit) =>
        unit.words.filter((word) => word.mastered),
      );
    } catch (error) {
      console.error("Error getting mastered words:", error);
      return [];
    }
  }

  // Get unmastered words
  async getUnmasteredWords(): Promise<Word[]> {
    try {
      const allData = await this.getAllData();
      return allData.units.flatMap((unit) =>
        unit.words.filter((word) => !word.mastered),
      );
    } catch (error) {
      console.error("Error getting unmastered words:", error);
      return [];
    }
  }
}
