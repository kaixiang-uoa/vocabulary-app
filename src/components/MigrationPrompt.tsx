import React, { useState, useEffect, useCallback } from "react";
import { MigrationResult } from "../services/migrationService";
import { useMigration } from "../hooks/useMigration";
import { useAuthContext } from "../contexts/AuthContext";
import { useTranslation } from "react-i18next";
import {
  BookOpenIcon,
  CloudArrowUpIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

export const MigrationPrompt: React.FC = () => {
  const { state } = useAuthContext();
  const { t } = useTranslation();
  const migration = useMigration();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);
  const [migrationResult, setMigrationResult] =
    useState<MigrationResult | null>(null);
  const [localDataSummary, setLocalDataSummary] = useState({
    units: 0,
    words: 0,
  });

  const checkMigrationStatus = useCallback(async () => {
    if (!state.user) return;

    try {
      const hasLocalData = await migration.hasLocalData();
      const hasFirebaseData = await migration.hasFirebaseData(state.user.uid);

      if (hasLocalData && !hasFirebaseData) {
        const summary = await migration.getLocalDataSummary();
        setLocalDataSummary(summary);
        setShowPrompt(true);
      }
    } catch (error) {
      // ignore
    }
  }, [state.user, migration]);

  useEffect(() => {
    if (state.user) {
      checkMigrationStatus();
    }
  }, [checkMigrationStatus, state.user]);

  const handleMigrate = async () => {
    if (!state.user) return;

    setIsMigrating(true);
    setMigrationResult(null);

    try {
      const result = await migration.migrateToFirebase(state.user.uid);
      setMigrationResult(result);

      if (result.success) {
        // Hide prompt after successful migration
        setTimeout(() => {
          setShowPrompt(false);
        }, 3000);
      }
    } catch (error) {
      setMigrationResult({
        success: false,
        message: "Migration failed unexpectedly",
        migratedUnits: 0,
        migratedWords: 0,
      });
    } finally {
      setIsMigrating(false);
    }
  };

  const handleSkip = () => {
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 relative">
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        {/* Migration prompt content */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CloudArrowUpIcon className="w-8 h-8 text-blue-600" />
          </div>

          <h3 className="text-xl font-bold text-gray-800 mb-2">
            {t("migration_title", "Migrate Your Data")}
          </h3>

          <p className="text-gray-600 mb-4">
            {t(
              "migration_description",
              "We found local data that can be migrated to the cloud for better synchronization across devices.",
            )}
          </p>

          {/* Data summary */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4 text-blue-500" />
                <span>
                  {localDataSummary.units} {t("units", "units")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpenIcon className="w-4 h-4 text-green-500" />
                <span>
                  {localDataSummary.words} {t("words", "words")}
                </span>
              </div>
            </div>
          </div>

          {/* Migration result */}
          {migrationResult && (
            <div
              className={`mb-4 p-3 rounded-lg ${
                migrationResult.success
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              <div className="flex items-center gap-2">
                {migrationResult.success ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                ) : (
                  <ExclamationTriangleIcon className="w-5 h-5" />
                )}
                <span className="text-sm">{migrationResult.message}</span>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleMigrate}
              disabled={isMigrating}
              className={`flex-1 py-3 px-4 rounded-lg transition-colors ${
                isMigrating
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isMigrating ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  {t("migrating", "Migrating...")}
                </div>
              ) : (
                t("migrate_now", "Migrate Now")
              )}
            </button>

            <button
              onClick={handleSkip}
              disabled={isMigrating}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {t("skip", "Skip")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
