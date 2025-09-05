import { act, render, screen, waitFor } from '@testing-library/react';
import React from 'react';

import { AuthProvider } from '../contexts/AuthContext';
import { WordProvider, useWordContext } from '../contexts/WordContext';
import * as wordService from '../services/wordService';
import { StorageData, Unit } from '../types';
import { globalCacheManager } from '../utils/cacheManager';

// Firebase is already mocked in setupTests.ts

// Mock services
jest.mock('../services/wordService');
jest.mock('../services/dataServiceManager', () => ({
  isUsingFirebase: () => false,
}));

const mockedWordService = wordService as jest.Mocked<typeof wordService>;

// Test component to access WordContext
const TestComponent: React.FC<{
  onContextReady?: (context: any) => void;
}> = ({ onContextReady }) => {
  const context = useWordContext();

  React.useEffect(() => {
    if (onContextReady && context.data) {
      onContextReady(context);
    }
  }, [context, onContextReady]);

  return (
    <div>
      <div data-testid="loading">{context.loading ? 'loading' : 'idle'}</div>
      <div data-testid="error">{context.error || 'no-error'}</div>
      <div data-testid="units-count">{context.data?.units?.length || 0}</div>
    </div>
  );
};

const renderWithProviders = (
  component: React.ReactElement,
  onContextReady?: (context: any) => void
) => {
  return render(
    <AuthProvider>
      <WordProvider>
        <TestComponent onContextReady={onContextReady} />
        {component}
      </WordProvider>
    </AuthProvider>
  );
};

describe('WordContext Tests', () => {
  const mockData: StorageData = {
    units: [
      {
        id: 'unit-1',
        name: 'Test Unit',
        words: [
          {
            id: 'word-1',
            word: 'hello',
            meaning: 'greeting',
            unitId: 'unit-1',
            mastered: false,
            createTime: Date.now(),
            reviewTimes: 0,
            lastReviewTime: null,
          },
        ],
        createTime: Date.now(),
      },
    ],
  };

  beforeEach(() => {
    globalCacheManager.clear();
    jest.clearAllMocks();

    // Default successful service responses
    mockedWordService.getAllData.mockResolvedValue(mockData);
    mockedWordService.saveAllData.mockResolvedValue(true);
    mockedWordService.addWord.mockResolvedValue(true);
    mockedWordService.updateWord.mockResolvedValue(true);
    mockedWordService.toggleWordMastered.mockResolvedValue(true);
    mockedWordService.setWordMasteredStatus.mockResolvedValue(true);
    mockedWordService.createUnit.mockResolvedValue('new-unit-id');
  });

  describe('Initial Loading', () => {
    test('should load data on initialization', async () => {
      renderWithProviders(<div />);

      expect(screen.getByTestId('loading')).toHaveTextContent('loading');

      await waitFor(() => {
        expect(screen.getByTestId('loading')).toHaveTextContent('idle');
      });

      expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      expect(mockedWordService.getAllData).toHaveBeenCalledTimes(1);
    });

    test('should handle loading errors gracefully', async () => {
      mockedWordService.getAllData.mockRejectedValue(
        new Error('Network error')
      );

      renderWithProviders(<div />);

      await waitFor(() => {
        expect(screen.getByTestId('error')).not.toHaveTextContent('no-error');
      });

      expect(screen.getByTestId('loading')).toHaveTextContent('idle');
    });
  });

  describe('Optimistic Updates', () => {
    test('should perform optimistic update for addWordToUnit', async () => {
      let contextRef: any;

      renderWithProviders(<div />, context => {
        contextRef = context;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      });

      // Perform optimistic add
      await act(async () => {
        const result = await contextRef.addWordToUnit(
          'unit-1',
          'test',
          'testing'
        );
        expect(result).toBe(true);
      });

      // Check immediate UI update (optimistic)
      expect(contextRef.data.units[0].words).toHaveLength(2);
      expect(contextRef.data.units[0].words[1].word).toBe('test');
      expect(contextRef.data.units[0].words[1].meaning).toBe('testing');

      // Verify service was called with correct parameters
      expect(mockedWordService.addWord).toHaveBeenCalledWith(
        'unit-1',
        'test',
        'testing'
      );
    });

    test('should rollback on service failure', async () => {
      let contextRef: any;

      renderWithProviders(<div />, context => {
        contextRef = context;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      });

      // Mock service failure
      mockedWordService.addWord.mockResolvedValue(false);

      // Perform failed add
      await act(async () => {
        const result = await contextRef.addWordToUnit(
          'unit-1',
          'test',
          'testing'
        );
        expect(result).toBe(false);
      });

      // Check rollback - should still have original word count
      expect(contextRef.data.units[0].words).toHaveLength(1);
      expect(contextRef.data.units[0].words[0].word).toBe('hello');
    });

    test('should perform optimistic update for toggleWordMasteredStatus', async () => {
      let contextRef: any;

      renderWithProviders(<div />, context => {
        contextRef = context;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      });

      const originalMasteredStatus = contextRef.data.units[0].words[0].mastered;

      // Perform optimistic toggle
      await act(async () => {
        const result = await contextRef.toggleWordMasteredStatus(
          'unit-1',
          'word-1'
        );
        expect(result).toBe(true);
      });

      // Check immediate UI update (optimistic)
      expect(contextRef.data.units[0].words[0].mastered).toBe(
        !originalMasteredStatus
      );

      // Verify service was called
      expect(mockedWordService.toggleWordMastered).toHaveBeenCalledWith(
        'unit-1',
        'word-1'
      );
    });

    test('should rollback mastered status on service failure', async () => {
      let contextRef: any;

      renderWithProviders(<div />, context => {
        contextRef = context;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      });

      const originalMasteredStatus = contextRef.data.units[0].words[0].mastered;

      // Mock service failure
      mockedWordService.toggleWordMastered.mockResolvedValue(false);

      // Perform failed toggle
      await act(async () => {
        const result = await contextRef.toggleWordMasteredStatus(
          'unit-1',
          'word-1'
        );
        expect(result).toBe(false);
      });

      // Check rollback - should have original mastered status
      expect(contextRef.data.units[0].words[0].mastered).toBe(
        originalMasteredStatus
      );
    });
  });

  describe('Batch Import with Optimistic Updates', () => {
    test('should perform optimistic update for batchImportData', async () => {
      let contextRef: any;

      renderWithProviders(<div />, context => {
        contextRef = context;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      });

      const importData = {
        units: [
          {
            name: 'New Unit',
            words: [
              { word: 'new', meaning: 'fresh' },
              { word: 'import', meaning: 'bring in' },
            ],
          },
        ],
        words: [],
      };

      // Perform optimistic batch import
      await act(async () => {
        const result = await contextRef.batchImportData(importData);
        expect(result.success).toBe(true);
        expect(result.count).toBe(2);
      });

      // Check immediate UI update (optimistic)
      expect(contextRef.data.units).toHaveLength(2);
      expect(contextRef.data.units[1].name).toBe('New Unit');
      expect(contextRef.data.units[1].words).toHaveLength(2);

      // Verify service was called
      expect(mockedWordService.saveAllData).toHaveBeenCalled();
    });

    test('should rollback batch import on service failure', async () => {
      let contextRef: any;

      renderWithProviders(<div />, context => {
        contextRef = context;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      });

      // Mock service failure
      mockedWordService.saveAllData.mockResolvedValue(false);

      const importData = {
        units: [
          {
            name: 'New Unit',
            words: [{ word: 'new', meaning: 'fresh' }],
          },
        ],
        words: [],
      };

      // Perform failed batch import
      await act(async () => {
        const result = await contextRef.batchImportData(importData);
        expect(result.success).toBe(false);
        expect(result.count).toBe(0);
      });

      // Check rollback - should still have original unit count
      expect(contextRef.data.units).toHaveLength(1);
      expect(contextRef.data.units[0].name).toBe('Test Unit');
    });
  });

  describe('Cache Management', () => {
    test('should update cache on successful operations', async () => {
      let contextRef: any;

      renderWithProviders(<div />, context => {
        contextRef = context;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      });

      // Perform successful add
      await act(async () => {
        await contextRef.addWordToUnit('unit-1', 'test', 'testing');
      });

      // Check cache was updated with new data
      const cachedData = globalCacheManager.get('units');
      expect(cachedData).toBeTruthy();
      expect((cachedData as StorageData).units[0].words).toHaveLength(2);
    });

    test('should handle cache rollback on failure', async () => {
      let contextRef: any;

      renderWithProviders(<div />, context => {
        contextRef = context;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      });

      // Mock service failure
      mockedWordService.addWord.mockResolvedValue(false);

      // Perform failed add
      await act(async () => {
        await contextRef.addWordToUnit('unit-1', 'test', 'testing');
      });

      // Cache should be cleared/invalidated on failure
      const cachedData = globalCacheManager.get('units');
      // Either null (cleared) or contains original data (not the failed optimistic update)
      expect(cachedData).toBeNull();
    });
  });

  describe('Deep Copy Immutability', () => {
    test('should create new object references for React re-renders', async () => {
      let contextRef: any;
      let originalUnitsRef: Unit[];

      renderWithProviders(<div />, context => {
        if (!originalUnitsRef) {
          originalUnitsRef = context.data?.units;
        }
        contextRef = context;
      });

      // Wait for initial load
      await waitFor(() => {
        expect(screen.getByTestId('units-count')).toHaveTextContent('1');
      });

      const initialUnitsRef = contextRef.data.units;

      // Perform add operation
      await act(async () => {
        await contextRef.addWordToUnit('unit-1', 'test', 'testing');
      });

      // Check that new references were created (essential for React re-renders)
      expect(contextRef.data.units).not.toBe(initialUnitsRef);
      expect(contextRef.data.units[0]).not.toBe(initialUnitsRef[0]);
      expect(contextRef.data.units[0].words).not.toBe(initialUnitsRef[0].words);
    });
  });
});
