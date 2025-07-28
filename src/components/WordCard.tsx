"use client"

import React, { useState } from "react"
import { PencilIcon } from '@heroicons/react/24/outline';
import { useTranslation } from 'react-i18next';
import EditModal from './EditModal';
import { WordCardProps, DifficultyColors } from '../types';
import { getTailwindClass } from '../utils/styleMapping';

// Simple icons as React components
const CheckCircleIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
)

const SyncIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
)

const SoundIcon: React.FC = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
)

const difficultyColors: DifficultyColors = {
  easy: { bg: 'var(--wordcard-easy-bg)', color: 'var(--wordcard-easy-color)', border: 'var(--wordcard-easy-border)' },
  medium: { bg: 'var(--wordcard-medium-bg)', color: 'var(--wordcard-medium-color)', border: 'var(--wordcard-medium-border)' },
  hard: { bg: 'var(--wordcard-hard-bg)', color: 'var(--wordcard-hard-color)', border: 'var(--wordcard-hard-border)' },
}

const playYoudaoVoice = (word: string, type: number = 2): void => {
  try {
    const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`;
    const audio = new window.Audio(url);
    
    // Handle audio loading errors gracefully
    audio.addEventListener('error', (e) => {
      console.warn('Audio failed to load for word:', word, e);
      // Don't throw error, just log it
    });
    
    audio.play().catch((error) => {
      console.warn('Audio playback failed for word:', word, error);
      // Don't throw error, just log it
    });
  } catch (error) {
    console.warn('playYoudaoVoice error for word:', word, error);
    // Don't throw error, just log it
  }
};

const WordCard: React.FC<WordCardProps> = ({ word, isSelected = false, onSelect, onMasteredToggle, onEdit }) => {
  const { t } = useTranslation();
  const [hovered, setHovered] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Use TailwindCSS classes with fallback to original classes
  const cardClassName = `${getTailwindClass('word-card')} ${word.mastered ? getTailwindClass('word-card.mastered') : ''} ${hovered ? 'hover' : ''}`;

  return (
    <div
      className={cardClassName}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Edit button, positioned in the top-right corner */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowEditModal(true);
        }}
        className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
        aria-label={t('edit_word')}
    >
        <PencilIcon style={{ fontSize: 18 }} />
      </button>
      {/* Edit modal */}
      <EditModal
        visible={showEditModal}
        title="edit_word"
        okText="save"
        cancelText="cancel"
        fields={[
          { name: 'word', label: 'word', value: word.word, placeholder: 'input_word_placeholder' },
          { name: 'meaning', label: 'meaning', value: word.meaning, placeholder: 'input_meaning_placeholder' },
        ]}
        onOk={(values) => { setShowEditModal(false); onEdit && onEdit(word.id, { word: values.word, meaning: values.meaning }); }}
        onCancel={() => setShowEditModal(false)}
      />
      
      {/* Main content area */}
      <div className="flex flex-col h-full">
        {/* Header area with checkbox and status */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onSelect && onSelect(word.id)
              }}
              className="w-4 h-4"
            />
            <div className={`p-1 rounded-full ${word.mastered ? 'text-green-500' : 'text-blue-500'}`}>
              {word.mastered ? <CheckCircleIcon /> : <SyncIcon />}
            </div>
          </div>

          {word.difficulty && (
            <span
              className="px-2 py-1 text-xs rounded capitalize"
              style={{
                background: difficultyColors[word.difficulty]?.bg,
                color: difficultyColors[word.difficulty]?.color,
                border: `1px solid ${difficultyColors[word.difficulty]?.border}`,
              }}
            >
              {word.difficulty}
            </span>
          )}
        </div>
        
        {/* Word and pronunciation - larger and more prominent */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl font-bold text-gray-900">
            {word.word}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playYoudaoVoice(word.word, 2);
            }}
            className="p-1 text-gray-500 hover:text-gray-700 transition-colors duration-200"
            title={t('play_pronunciation')}
          >
            <SoundIcon />
          </button>
        </div>

        {/* Meaning - more spacious */}
        <div className="flex-1">
          <span className="text-lg text-gray-700 leading-relaxed">
            {word.meaning}
          </span>
        </div>

        {/* Bottom operation area */}
        <div className={`${getTailwindClass('flex-between')} pt-4 border-t border-gray-200 mt-auto`}>
          <span className={`${getTailwindClass('text-secondary')} ${getTailwindClass('text-small')} flex items-center gap-2`}>
            <SyncIcon />
            {t('review_times', { count: word.reviewTimes })}
          </span>

          <button
            onClick={(e) => {
              e.stopPropagation()
              onMasteredToggle && onMasteredToggle(word.id)
            }}
            className={`${getTailwindClass('btn-secondary')} ${word.mastered ? 'mastered' : ''}`}
            style={{
              background: word.mastered ? 'var(--wordcard-btn-bg-mastered)' : 'var(--wordcard-btn-bg)',
              color: word.mastered ? 'var(--wordcard-btn-color-mastered)' : 'var(--wordcard-btn-color)',
              border: word.mastered ? '1px solid var(--wordcard-btn-border-mastered)' : 'none',
              fontSize: 14,
              padding: '8px 16px',
              borderRadius: '6px',
              fontWeight: 500,
            }}
          >
            {word.mastered ? t('mark_unmastered') : t('mark_mastered')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default WordCard 