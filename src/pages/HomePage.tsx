import {
  ArrowPathIcon,
  BookOpenIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import LanguageSwitcher from '../components/LanguageSwitcher';
import { GridSkeleton, StatCardSkeleton } from '../components/ui';
import UnitList from '../components/UnitList';
import { useAuthContext } from '../contexts/AuthContext';
import { useWordContext } from '../contexts/WordContext';
import { useInitialLoading } from '../hooks';
import { Word } from '../types';
import { getTailwindClass } from '../utils/styleMapping';

const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const { state, showLoginModal } = useAuthContext();
  const { data: unitsData, loading: unitsLoading } = useWordContext();

  // State for words data
  const [masteredWords, setMasteredWords] = useState<Word[]>([]);
  const [unmasteredWords, setUnmasteredWords] = useState<Word[]>([]);

  // Smart loading state
  const loadingState = useInitialLoading({
    skeletonDelay: 300,
    showSkeleton: true,
  });

  // Calculate words data from units data
  useEffect(() => {
    if (unitsData && !unitsLoading) {
      try {
        const mastered: Word[] = [];
        const unmastered: Word[] = [];

        unitsData.units.forEach(unit => {
          unit.words.forEach(word => {
            if (word.mastered) {
              mastered.push(word);
            } else {
              unmastered.push(word);
            }
          });
        });

        setMasteredWords(mastered);
        setUnmasteredWords(unmastered);
        loadingState.setData({ mastered, unmastered });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('Error processing words data:', error);
        setMasteredWords([]);
        setUnmasteredWords([]);
        loadingState.setError(
          error instanceof Error ? error.message : 'Failed to process data'
        );
      }
    } else if (!state.loading && !unitsLoading && !unitsData) {
      // Handle case when no data is available
      setMasteredWords([]);
      setUnmasteredWords([]);
      loadingState.setData({ mastered: [], unmastered: [] });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitsData, unitsLoading, state.loading]); // 移除loadingState依赖

  // 刷新入口集中在 WordContext，此处无需再监听

  // Calculate total words
  const totalWords = masteredWords.length + unmasteredWords.length;

  // Calculate mastery rate
  const masteryRate =
    totalWords > 0 ? Math.round((masteredWords.length / totalWords) * 100) : 0;

  return (
    <div className={getTailwindClass('unit-detail-page')}>
      {/* Language switcher only */}
      <div className="flex justify-end mb-6">
        <LanguageSwitcher className="flex items-center gap-2" />
      </div>

      {/* Loading state with skeleton */}
      {state.user &&
        unitsLoading &&
        (!unitsData || unitsData.units.length === 0) && (
          <div className="space-y-8">
            {/* Statistics Cards Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
              {Array.from({ length: 3 }).map((_, index) => (
                <StatCardSkeleton key={index} />
              ))}
            </div>

            {/* Unit List Skeleton */}
            <div className="bg-white/90 rounded-xl shadow-sm border border-gray-200">
              <GridSkeleton items={6} columns={3} />
            </div>
          </div>
        )}

      {/* Login prompt for unauthenticated users */}
      {!state.user && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6 mb-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <BookOpenIcon className="w-8 h-8 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              Start Your Vocabulary Learning Journey
            </h3>
            <p className="text-gray-600 mb-4">
              Login to create your first learning unit and start building your
              vocabulary
            </p>
            <button
              onClick={showLoginModal}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Login to Get Started
            </button>
          </div>
        </div>
      )}

      {/* Section 1: Statistics Cards */}
      {state.user && !!unitsData && unitsData.units.length >= 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
          {/* Total Words Card */}
          <div className="bg-white/80 sm:bg-blue-100/80 md:bg-green-100/80 lg:bg-purple-100/80 xl:bg-orange-100/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('total_words')}
                </p>
                <p className="text-3xl font-bold text-gray-900">{totalWords}</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <BookOpenIcon className="w-5 h-5 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Mastered Words Card */}
          <div className="bg-white/80 sm:bg-green-100/80 md:bg-blue-100/80 lg:bg-orange-100/80 xl:bg-purple-100/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('mastered')}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {masteredWords.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <CheckCircleIcon className="w-5 h-5 text-green-500" />
              </div>
            </div>
          </div>

          {/* Mastery Rate Card */}
          <div className="bg-white/80 sm:bg-purple-100/80 md:bg-orange-100/80 lg:bg-green-100/80 xl:bg-blue-100/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  {t('mastery_rate')}
                </p>
                <p className="text-3xl font-bold text-gray-900">
                  {masteryRate}%
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <ArrowPathIcon className="w-5 h-5 text-purple-500" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Divider */}
      {state.user && (
        <div className="flex items-center justify-center mb-8">
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
      )}

      {/* Section 2: Unit List Title */}
      {state.user && !!unitsData && unitsData.units.length >= 0 && (
        <div className="mb-8 lg:mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">
              {t('unit_list')}
            </h2>
          </div>
          <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
        </div>
      )}

      {/* Section 3: Unit List Content */}
      {state.user && !!unitsData && unitsData.units.length >= 0 && (
        <div className="bg-white/90 sm:bg-blue-50/90 md:bg-green-50/90 lg:bg-purple-50/90 xl:bg-orange-50/90 rounded-xl shadow-sm border border-gray-200">
          <UnitList />
        </div>
      )}
    </div>
  );
};

export default HomePage;
