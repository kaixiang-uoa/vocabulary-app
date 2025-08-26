import { useCallback } from "react";
import { MigrationService, MigrationResult } from "../services/migrationService";

export const useMigration = () => {
  const hasLocalData = useCallback(async (): Promise<boolean> => {
    return MigrationService.hasLocalData();
  }, []);

  const hasFirebaseData = useCallback(async (uid: string): Promise<boolean> => {
    return MigrationService.hasFirebaseData(uid);
  }, []);

  const getLocalDataSummary = useCallback(async (): Promise<{
    units: number;
    words: number;
  }> => {
    return MigrationService.getLocalDataSummary();
  }, []);

  const migrateToFirebase = useCallback(async (
    uid: string,
  ): Promise<MigrationResult> => {
    return MigrationService.migrateToFirebase(uid);
  }, []);

  return {
    hasLocalData,
    hasFirebaseData,
    getLocalDataSummary,
    migrateToFirebase,
  };
};


