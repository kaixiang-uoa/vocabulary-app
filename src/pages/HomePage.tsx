import React from 'react';
import { Title } from '../components/ui';
import { BookOpenIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import UnitList from '../components/UnitList';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getMasteredWords, getUnmasteredWords } from '../utils/wordFiltering';
import { useTranslation } from 'react-i18next';


const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const masteredWords = getMasteredWords();
  const unmasteredWords = getUnmasteredWords();
  
  // Calculate total words
  const totalWords = masteredWords.length + unmasteredWords.length;
  
  // Calculate mastery rate
  const masteryRate = totalWords > 0 ? Math.round((masteredWords.length / totalWords) * 100) : 0;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8 bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20">


      {/* Header with title and language switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 lg:mb-12 gap-4">
        <Title level={1} className="text-3xl lg:text-4xl font-bold text-gray-900">
          {t('title')}
        </Title>
        
        <div className="flex items-center gap-2">
          <LanguageSwitcher className="flex items-center gap-2" />
        </div>
      </div>

      {/* Section 1: Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8 lg:mb-12">
        {/* Total Words Card */}
        <div className="bg-white/80 sm:bg-blue-100/80 md:bg-green-100/80 lg:bg-purple-100/80 xl:bg-orange-100/80 backdrop-blur-sm rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">{t('total_words')}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('mastered')}</p>
              <p className="text-3xl font-bold text-gray-900">{masteredWords.length}</p>
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
              <p className="text-sm font-medium text-gray-600">{t('mastery_rate')}</p>
              <p className="text-3xl font-bold text-gray-900">{masteryRate}%</p>
            </div>
            <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
              <ArrowPathIcon className="w-5 h-5 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Section 2: Unit List Title */}
      <div className="mb-8 lg:mb-12">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
            <BookOpenIcon className="w-6 h-6 text-blue-600" />
          </div>
          <h2 className="text-2xl lg:text-3xl font-bold text-gray-900">{t('unit_list')}</h2>
        </div>
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Section 3: Unit List Content */}
      <div className="bg-white/90 sm:bg-blue-50/90 md:bg-green-50/90 lg:bg-purple-50/90 xl:bg-orange-50/90 backdrop-blur-sm rounded-xl shadow-sm border border-gray-200">
        <UnitList />
      </div>
    </div>
  );
};

export default HomePage; 