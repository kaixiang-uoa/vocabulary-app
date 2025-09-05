import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';

import { db } from '../config/firebase';

import { getAllData } from './wordService';

export interface MigrationResult {
  success: boolean;
  message: string;
  migratedUnits: number;
  migratedWords: number;
}

export class MigrationService {
  // Check if user has local data to migrate
  static async hasLocalData(): Promise<boolean> {
    try {
      const localData = await getAllData();
      const totalWords = localData.units.reduce(
        (sum, unit) => sum + unit.words.length,
        0
      );
      return localData.units.length > 0 || totalWords > 0;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error checking local data:', error);
      return false;
    }
  }

  // Get local data summary
  static async getLocalDataSummary() {
    try {
      const localData = await getAllData();
      const totalWords = localData.units.reduce(
        (sum, unit) => sum + unit.words.length,
        0
      );
      return {
        units: localData.units.length,
        words: totalWords,
        totalWords: totalWords,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error getting local data summary:', error);
      return { units: 0, words: 0, totalWords: 0 };
    }
  }

  // Check if user already has Firebase data
  static async hasFirebaseData(userId: string): Promise<boolean> {
    try {
      const unitsRef = collection(db, `users/${userId}/units`);
      const snapshot = await getDocs(unitsRef);
      return !snapshot.empty;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error checking Firebase data:', error);
      return false;
    }
  }

  // Migrate data from localStorage to Firebase
  static async migrateToFirebase(userId: string): Promise<MigrationResult> {
    try {
      // Get local data
      const localData = await getAllData();
      const totalWords = localData.units.reduce(
        (sum, unit) => sum + unit.words.length,
        0
      );

      if (localData.units.length === 0 && totalWords === 0) {
        return {
          success: false,
          message: 'No local data to migrate',
          migratedUnits: 0,
          migratedWords: 0,
        };
      }

      // Use batch write for atomic operation
      const batch = writeBatch(db);
      let migratedUnits = 0;
      let migratedWords = 0;

      // Migrate units
      for (const unit of localData.units) {
        const unitRef = doc(collection(db, `users/${userId}/units`));

        // Prepare unit data (remove id as Firestore will generate new one)
        const { id, ...unitData } = unit;
        const firebaseUnitData = {
          ...unitData,
          createTime: unit.createTime || Date.now(),
          words: [], // Will be populated separately
        };

        batch.set(unitRef, firebaseUnitData);
        migratedUnits++;

        // Migrate words for this unit
        const unitWords = unit.words || [];

        for (const word of unitWords) {
          const wordRef = doc(
            collection(db, `users/${userId}/units/${unitRef.id}/words`)
          );

          // Prepare word data
          const { id: wordId, unitId, ...wordData } = word;
          const firebaseWordData = {
            ...wordData,
            createTime: word.createTime || Date.now(),
            reviewTimes: word.reviewTimes || 0,
            lastReviewTime: word.lastReviewTime || null,
          };

          batch.set(wordRef, firebaseWordData);
          migratedWords++;
        }
      }

      // Commit the batch
      await batch.commit();

      return {
        success: true,
        message: `Successfully migrated ${migratedUnits} units and ${migratedWords} words`,
        migratedUnits,
        migratedWords,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Migration failed:', error);

      return {
        success: false,
        message: `Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        migratedUnits: 0,
        migratedWords: 0,
      };
    }
  }

  // Export Firebase data to localStorage (backup)
  static async exportToLocalStorage(userId: string): Promise<MigrationResult> {
    try {
      // eslint-disable-next-line no-console
      console.log('Starting Firebase data export for user:', userId);

      const unitsRef = collection(db, `users/${userId}/units`);
      const unitsSnapshot = await getDocs(unitsRef);

      const exportedData = {
        units: [],
        words: [],
      };

      let exportedUnits = 0;
      let exportedWords = 0;

      // Export units and their words
      for (const unitDoc of unitsSnapshot.docs) {
        const unitData = unitDoc.data();
        const unit = {
          id: unitDoc.id,
          ...unitData,
        };
        exportedData.units.push(unit);
        exportedUnits++;

        // Export words for this unit
        const wordsRef = collection(
          db,
          `users/${userId}/units/${unitDoc.id}/words`
        );
        const wordsSnapshot = await getDocs(wordsRef);

        for (const wordDoc of wordsSnapshot.docs) {
          const wordData = wordDoc.data();
          const word = {
            id: wordDoc.id,
            unitId: unitDoc.id,
            ...wordData,
          };
          exportedData.words.push(word);
          exportedWords++;
        }
      }

      // Save to localStorage
      localStorage.setItem(
        'vocabulary-app-backup',
        JSON.stringify(exportedData)
      );

      // eslint-disable-next-line no-console
      console.log(
        `Export completed: ${exportedUnits} units, ${exportedWords} words`
      );

      return {
        success: true,
        message: `Successfully exported ${exportedUnits} units and ${exportedWords} words to localStorage`,
        migratedUnits: exportedUnits,
        migratedWords: exportedWords,
      };
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Export failed:', error);
      return {
        success: false,
        message: `Export failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        migratedUnits: 0,
        migratedWords: 0,
      };
    }
  }
}
