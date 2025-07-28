import React from 'react';
import { useTranslation } from 'react-i18next';
import { ReviewWordCardProps } from '../types';
import { getTailwindClass } from '../utils/styleMapping';

// Play pronunciation using Youdao API
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

const ReviewWordCard: React.FC<ReviewWordCardProps> = ({ word, isFlipped, onFlip, onMasteredToggle, flipMode }) => {
  const { t } = useTranslation();
  const isEn2Zh = flipMode === 'en2zh';
  
  return (
    <div 
      className={`${getTailwindClass('review-card')} ${word.mastered ? 'mastered' : ''} ${isFlipped ? 'flipped' : ''} cursor-pointer`} 
      onClick={onFlip}
      style={{ perspective: '1000px' }}
    >
      <div 
        className="relative w-full h-full transition-transform duration-500"
        style={{ 
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }}
      >
        {/* Front: Display English or meaning based on mode */}
        <div 
          className={`absolute inset-0 rounded-xl border-2 p-8 flex flex-col items-center justify-center ${word.mastered ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}`}
          style={{ backfaceVisibility: 'hidden' }}
        >
          {isEn2Zh ? (
            <div className="flex items-center gap-3">
              <span className="text-3xl font-bold text-gray-900">{word.word}</span>
              <button
                onClick={(e) => { e.stopPropagation(); playYoudaoVoice(word.word, 2); }}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors duration-200"
                title={t('play_pronunciation')}
              >
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/>
                </svg>
              </button>
            </div>
          ) : (
            <span className="text-3xl font-bold text-gray-900">{word.meaning}</span>
          )}
        </div>
        
        {/* Back: Display meaning or English based on mode */}
        <div 
          className={`absolute inset-0 rounded-xl border-2 p-8 flex flex-col items-center justify-center ${word.mastered ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}`}
          style={{ 
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)'
          }}
        >
          {isEn2Zh ? (
            <span className="text-3xl font-bold text-gray-900 mb-6 text-center leading-relaxed px-5">{word.meaning}</span>
          ) : (
            <span className="text-3xl font-bold text-gray-900 mb-6 text-center leading-relaxed px-5">{word.word}</span>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onMasteredToggle && onMasteredToggle(word.id); }}
            className={`px-6 py-3 text-base font-medium rounded-lg transition-colors duration-200 ${
              word.mastered 
                ? 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200' 
                : 'bg-blue-500 text-white border border-blue-500 hover:bg-blue-600'
            }`}
          >
            {word.mastered ? t('mark_unmastered') : t('mark_mastered')}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReviewWordCard; 