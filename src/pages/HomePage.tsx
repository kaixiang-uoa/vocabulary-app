import React from 'react';
import { Title, Row, Col, Card, Statistic } from '../components/ui';
import { BookOpenIcon, CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import UnitList from '../components/UnitList';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { getMasteredWords, getUnmasteredWords } from '../utils/wordFiltering';
import { useTranslation } from 'react-i18next';
import { getTailwindClass } from '../utils/styleMapping';



const HomePage: React.FC = () => {
  const { t } = useTranslation();
  const masteredWords = getMasteredWords();
  const unmasteredWords = getUnmasteredWords();
  
  // Calculate total words
  const totalWords = masteredWords.length + unmasteredWords.length;
  
  // Calculate mastery rate
  const masteryRate = totalWords > 0 ? Math.round((masteredWords.length / totalWords) * 100) : 0;
  
  // Get mastery rate class based on percentage
  const getMasteryRateClass = (rate: number): string => {
    if (rate > 80) return 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50';
    if (rate > 50) return 'border-blue-500 bg-gradient-to-br from-blue-50 to-purple-50';
    return 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50';
  };
  
  return (
    <div className={getTailwindClass('home-page')}>
      {/* Header with title, mode toggle and language switcher */}
      <div className={`${getTailwindClass('flex-between')} ${getTailwindClass('mb-24')}`}>
        <Title level={1} className={getTailwindClass('page-title')}>
          {t('title')}
        </Title>
        
        <div className={getTailwindClass('control-panel-right')}>
          <LanguageSwitcher className="flex items-center gap-2" />
        </div>
      </div>

      {/* Section 1: Statistics Cards */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
        <Row gutter={16}>
          <Col span={8}>
            <Card className={getTailwindClass('stats-card')}>
              <Statistic
                title={t('total_words')}
                value={totalWords}
                prefix={<BookOpenIcon />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className={`${getTailwindClass('stats-card')} ${getTailwindClass('stats-card.mastered')}`}>
              <Statistic
                title={t('mastered')}
                value={masteredWords.length}
                prefix={<CheckCircleIcon />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card className={`${getTailwindClass('stats-card')} ${getMasteryRateClass(masteryRate)}`}>
              <Statistic
                title={t('mastery_rate')}
                value={masteryRate}
                suffix="%"
                prefix={<ArrowPathIcon />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Section 2: Unit List Title */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mb-8">
        <div className="flex items-center justify-center">
          <div className="flex items-center gap-3">
            <BookOpenIcon className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-bold text-gray-900">{t('unit_list')}</span>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="flex items-center justify-center mb-8">
        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-300 to-transparent"></div>
      </div>

      {/* Section 3: Unit List Content */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <UnitList />
      </div>
    </div>
  );
};

export default HomePage; 