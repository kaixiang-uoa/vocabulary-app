import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { Button, Progress, Typography, Space, Radio, Empty, message } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import ReviewWordCard from '../components/ReviewWordCard';
import { getUnitWords, toggleWordMastered, getAllData } from '../utils/wordUtils';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const ReviewPage = () => {
  const { t } = useTranslation();
  const { unitId } = useParams();
  const [words, setWords] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewMode, setReviewMode] = useState('all'); // all, unmastered, mastered
  const [reviewOrder, setReviewOrder] = useState('sequential'); // sequential, random
  const [unit, setUnit] = useState(null);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // load data and filter by mode/order
  const loadData = useCallback(() => {
    const numericUnitId = parseInt(unitId, 10);
    // getAllData() is only needed for setUnit, not for assignment
    setUnit(getAllData().units.find(u => u.id === numericUnitId) ? JSON.parse(JSON.stringify(getAllData().units.find(u => u.id === numericUnitId))) : null);
    let wordsList = getUnitWords(numericUnitId).map(w => ({ ...w }));
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
  }, [unitId, reviewMode, reviewOrder]);
  
  useEffect(() => {
    loadData();
    setIsFlipped(false);
  }, [loadData]);
  
  // toggle mastered state
  const handleMasteredToggle = (wordId) => {
    const numericUnitId = parseInt(unitId, 10);
    if (toggleWordMastered(numericUnitId, wordId)) {
      // record current word id
      const prevWordId = wordId;
      // reload data and find the index of this id
      // getAllData() is only needed for setUnit, not for assignment
      let wordsList = getUnitWords(numericUnitId).map(w => ({ ...w }));
      if (reviewMode === 'unmastered') {
        wordsList = wordsList.filter(word => !word.mastered);
      } else if (reviewMode === 'mastered') {
        wordsList = wordsList.filter(word => word.mastered);
      }
      if (reviewOrder === 'random') {
        wordsList = [...wordsList].sort(() => Math.random() - 0.5);
      }
      setWords(wordsList);
      // find the index of the current word in the new wordsList
      const idx = wordsList.findIndex(w => w.id === prevWordId);
      setCurrentIndex(idx >= 0 ? idx : 0);
      setIsFlipped(false);
      message.success(t('status_updated'));
    }
  };
  // next/prev/restart handlers
  const handleNext = () => {
    if (currentIndex < words.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
    } else {
      message.success(t('review_complete'));
    }
  };
  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
    }
  };
  const handleRestart = () => {
    setCurrentIndex(0);
    message.info(t('review_restart'));
  };
  const handleModeChange = (e) => {
    setReviewMode(e.target.value);
  };
  const handleOrderChange = (e) => {
    setReviewOrder(e.target.value);
  };
  if (!unit) {
    return <div>{t('loading')}</div>;
  }
  // calculate progress
  const progress = words.length > 0 ? Math.round(((currentIndex + 1) / words.length) * 100) : 0;
  return (
    <div className="review-page">
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Space>
          <Link to={`/unit/${unitId}`}>
            <Button 
              style={{
                background: 'var(--neutral-100)',
                color: 'var(--neutral-700)',
                borderRadius: 8,
                border: 'none',
                fontWeight: 500,
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
              }}
              icon={<ArrowLeftOutlined />}
            >{t('back_to_unit')}</Button>
          </Link>
          <Button 
            icon={<ReloadOutlined />} 
            onClick={handleRestart}
            style={{
              background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: '#fff',
              borderRadius: 8,
              border: 'none',
              fontWeight: 500,
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s',
            }}
          >{t('restart')}</Button>
        </Space>
        <Space>
          <Radio.Group value={reviewMode} onChange={handleModeChange} buttonStyle="solid">
            <Radio.Button value="all">{t('all')}</Radio.Button>
            <Radio.Button value="unmastered">{t('unmastered')}</Radio.Button>
            <Radio.Button value="mastered">{t('mastered')}</Radio.Button>
          </Radio.Group>
          <Radio.Group value={reviewOrder} onChange={handleOrderChange} buttonStyle="solid">
            <Radio.Button value="sequential">{t('sequential')}</Radio.Button>
            <Radio.Button value="random">{t('random')}</Radio.Button>
          </Radio.Group>
        </Space>
      </div>
      <Title 
        level={2}
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: '#222',
          marginBottom: 24
        }}
      >
        {unit.name} - {t('word_review')}
      </Title>
      {words.length > 0 ? (
        <div>
          <div style={{ marginBottom: 16 }}>
            <Progress 
              percent={progress} 
              status="active" 
              format={() => `${currentIndex + 1}/${words.length}`} 
            />
          </div>
          <div style={{ maxWidth: 500, margin: '0 auto' }}>
            <ReviewWordCard
              key={words[currentIndex]?.id || currentIndex}
              word={words[currentIndex]}
              isFlipped={isFlipped}
              onFlip={() => setIsFlipped(f => !f)}
              onMasteredToggle={() => handleMasteredToggle(words[currentIndex].id)}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24, gap: 16 }}>
            <Button 
              size="large" 
              onClick={handlePrev} 
              disabled={currentIndex === 0}
              style={{
                background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                color: '#fff',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                boxShadow: 'var(--wordcard-shadow-md)',
                transition: 'all 0.2s',
                opacity: currentIndex === 0 ? 0.5 : 1
              }}
            >
              {t('prev')}
            </Button>
            <Button 
              type="primary" 
              size="large" 
              onClick={handleNext} 
              style={{
                background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                color: '#fff',
                borderRadius: 8,
                border: 'none',
                fontWeight: 600,
                boxShadow: 'var(--wordcard-shadow-md)',
                transition: 'all 0.2s',
                marginLeft: 0,
                opacity: currentIndex === words.length - 1 ? 0.5 : 1
              }}
              disabled={currentIndex === words.length - 1}
            >
              {t('next')}
            </Button>
          </div>
          <div style={{ textAlign: 'center', marginTop: 16 }}>
            <Text type="secondary" style={{ fontSize: 15, color: '#888', fontWeight: 500 }}>
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