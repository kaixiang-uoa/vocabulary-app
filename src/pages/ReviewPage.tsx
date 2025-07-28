import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import { Button, Progress, Text, Title, RadioGroup, RadioButton, Empty, message } from '../components/ui';
import { ArrowLeftIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import ReviewWordCard from '../components/ReviewWordCard';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { toggleWordMastered, getAllData } from '../utils/wordUtils';
import { getUnitWords } from '../utils/wordFiltering';
import { useTranslation } from 'react-i18next';
import { Word, Unit } from '../types';
import { getTailwindClass } from '../utils/styleMapping';



type ReviewMode = 'all' | 'unmastered' | 'mastered';
type ReviewOrder = 'sequential' | 'random';

const ReviewPage: React.FC = () => {
  const { t } = useTranslation();
  const { unitId } = useParams<{ unitId: string }>();
  const [words, setWords] = useState<Word[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState<ReviewMode>('all');
  const [reviewOrder, setReviewOrder] = useState<ReviewOrder>('sequential');
  const [unit, setUnit] = useState<Unit | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flipMode, setFlipMode] = useState<'en2zh' | 'zh2en'>('en2zh');
  
  // Prevent duplicate data loading in Strict Mode (unused in current implementation)
  // const isInitialized = useRef(false);
  
  // Load data when unitId, reviewMode, or reviewOrder changes
  useEffect(() => {
    if (!unitId) return;
    
    // Use AbortController to prevent duplicate execution in Strict Mode
    const abortController = new AbortController();
    let isExecuted = false;
    
    const loadData = () => {
      if (isExecuted || abortController.signal.aborted) return;
      isExecuted = true;
      
      console.log('ReviewPage: Loading data for unitId:', unitId, 'reviewMode:', reviewMode, 'reviewOrder:', reviewOrder);
      
      const allData = getAllData();
      const currentUnit = allData.units.find(u => u.id === unitId);
      setUnit(currentUnit ? JSON.parse(JSON.stringify(currentUnit)) : null);
      
      let wordsList = getUnitWords(unitId).map(w => ({ ...w }));
      
      if (reviewMode === 'unmastered') {
        wordsList = wordsList.filter(word => !word.mastered);
      } else if (reviewMode === 'mastered') {
        wordsList = wordsList.filter(word => word.mastered);
      }
      
      if (reviewOrder === 'random') {
        wordsList = [...wordsList].sort(() => Math.random() - 0.5);
      }
      
      setWords(wordsList);
      setCurrentIndex(0);
      setIsFlipped(false);
      
      console.log('ReviewPage: Data loaded, words count:', wordsList.length);
    };
    
    // Execute immediately
    loadData();
    
    // Cleanup function
    return () => {
      abortController.abort();
    };
  }, [unitId, reviewMode, reviewOrder]);
  
  // Toggle mastered state
  const handleMasteredToggle = (wordId: string) => {
    if (!unitId) return;
    
    if (toggleWordMastered(unitId, wordId)) {
      // Record current word id
      const prevWordId = wordId;
      
      // Reload data and find the index of this id
      const allData = getAllData();
      let wordsList = allData.units.find(u => u.id === unitId)?.words.map(w => ({ ...w })) || [];
      
      if (reviewMode === 'unmastered') {
        wordsList = wordsList.filter(word => !word.mastered);
      } else if (reviewMode === 'mastered') {
        wordsList = wordsList.filter(word => word.mastered);
      }
      
      if (reviewOrder === 'random') {
        wordsList = [...wordsList].sort(() => Math.random() - 0.5);
      }
      
      setWords(wordsList);
      
      // Find the index of the current word in the new wordsList
      const idx = wordsList.findIndex(w => w.id === prevWordId);
      setCurrentIndex(idx >= 0 ? idx : 0);
      setIsFlipped(false);
      message.success(t('status_updated'));
    }
  };
  
  // Next/prev/restart handlers
  const handleNext = () => {
    console.log('Next button clicked, currentIndex:', currentIndex, 'words.length:', words.length);
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      message.success(t('review_complete'));
    }
  };
  
  const handlePrev = () => {
    console.log('Prev button clicked, currentIndex:', currentIndex);
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };
  
  const handleRestart = () => {
    console.log('Restart button clicked');
    setCurrentIndex(0);
    message.info(t('review_restart'));
  };
  
  const handleModeChange = (e: any) => {
    const value = e.target?.value || e;
    console.log('Mode change:', value);
    setReviewMode(value);
  };
  
  const handleOrderChange = (e: any) => {
    const value = e.target?.value || e;
    console.log('Order change:', value);
    setReviewOrder(value);
  };
  
  const handleFlipModeChange = (e: any) => {
    const value = e.target?.value || e;
    console.log('Flip mode change:', value);
    setFlipMode(value);
  };
  
  if (!unit) {
    return <div className="flex items-center justify-center h-64 text-lg text-gray-600">{t('loading')}</div>;
  }
  
  // Calculate progress
  const progress = words.length > 0 ? Math.round(((currentIndex + 1) / words.length) * 100) : 0;
  
  return (
    <div className={getTailwindClass('review-page')}>
      {/* First row: Title and language switcher */}
      <div className={getTailwindClass('page-header')}>
        <Title level={2} className={getTailwindClass('page-title')}>
          {unit.name} - {t('word_review')}
        </Title>
        <LanguageSwitcher className="flex items-center gap-2" />
      </div>
      
      {/* Second row: Action controls */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-6">
        {/* All controls in one flex container with wrap */}
        <div className="flex flex-wrap items-start justify-between gap-6">
          {/* Navigation controls */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to={`/unit/${unitId}`}>
              <Button 
                className={`${getTailwindClass('btn-secondary')} ${getTailwindClass('btn-standard')} flex items-center gap-2 font-bold`}
                icon={<ArrowLeftIcon className="w-4 h-4" />}
              >
                {t('back_to_unit')}
              </Button>
            </Link>
            <Button 
              icon={<ArrowPathIcon className="w-4 h-4" />} 
              onClick={handleRestart}
              className={`${getTailwindClass('btn-primary')} ${getTailwindClass('btn-standard')} flex items-center gap-2`}
            >
              {t('restart')}
            </Button>
          </div>
          
          {/* Review controls - unified layout */}
          <div className="flex flex-wrap items-start gap-6">
            {/* Review mode controls */}
            <div className="flex flex-col gap-3 flex-shrink-0 min-w-[140px]">
              <label className="text-sm font-bold text-gray-700">{t('review_mode')}</label>
              <RadioGroup value={reviewMode} onChange={handleModeChange} className="flex gap-2">
                <RadioButton value="all">{t('all')}</RadioButton>
                <RadioButton value="unmastered">{t('unmastered')}</RadioButton>
                <RadioButton value="mastered">{t('mastered')}</RadioButton>
              </RadioGroup>
            </div>
            
            {/* Review order controls */}
            <div className="flex flex-col gap-3 flex-shrink-0 min-w-[140px]">
              <label className="text-sm font-bold text-gray-700">{t('review_order')}</label>
              <RadioGroup value={reviewOrder} onChange={handleOrderChange} className="flex gap-2">
                <RadioButton value="sequential">{t('sequential')}</RadioButton>
                <RadioButton value="random">{t('random')}</RadioButton>
              </RadioGroup>
            </div>
            
            {/* Flip mode controls */}
            <div className="flex flex-col gap-3 flex-shrink-0 min-w-[140px]">
              <label className="text-sm font-bold text-gray-700">{t('flip_mode')}</label>
              <RadioGroup value={flipMode} onChange={handleFlipModeChange} className="flex gap-2">
                <RadioButton value="en2zh">{t('flip_mode_en2zh')}</RadioButton>
                <RadioButton value="zh2en">{t('flip_mode_zh2en')}</RadioButton>
              </RadioGroup>
            </div>
          </div>
        </div>
      </div>
      {words.length > 0 ? (
        <div>
          <div className="mb-6">
            <Progress 
              percent={progress} 
              status="active" 
              format={() => `${currentIndex + 1}/${words.length}`} 
              className={getTailwindClass('progress-text')}
            />
          </div>
          <div className="flex justify-center mb-8">
            <div className="w-full max-w-2xl">
              <ReviewWordCard
                key={words[currentIndex]?.id || currentIndex}
                word={words[currentIndex]}
                isFlipped={isFlipped}
                onFlip={() => setIsFlipped(f => !f)}
                onMasteredToggle={() => handleMasteredToggle(words[currentIndex].id)}
                flipMode={flipMode}
              />
            </div>
          </div>
          <div className="flex justify-center gap-4 mb-4">
            <Button 
              size="large" 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              className={`${getTailwindClass('btn-primary')} ${getTailwindClass('btn-large')} ${currentIndex === 0 ? 'opacity-50' : ''}`}
            >
              {t('prev')}
            </Button>
            <Button 
              type="primary" 
              size="large" 
              onClick={handleNext} 
              className={`${getTailwindClass('btn-primary')} ${getTailwindClass('btn-large')} ${currentIndex === words.length - 1 ? 'opacity-50' : ''}`}
              disabled={currentIndex === words.length - 1}
            >
              {t('next')}
            </Button>
          </div>
          <div className="text-center mt-4">
            <Text className={`${getTailwindClass('text-secondary')} text-lg font-medium`}>
              {t('flip_card_tip', { side: words[currentIndex].mastered ? t('word') : t('meaning') })}
            </Text>
          </div>
        </div>
      ) : (
        <Empty 
          description={
            <span>
              {t('no_words', { mode: reviewMode === 'unmastered' ? t('unmastered') : reviewMode === 'mastered' ? t('mastered') : '' })}
            </span>
          }
        />
      )}
    </div>
  );
};

export default ReviewPage; 