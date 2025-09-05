import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';
import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';

import { Button, Progress, Text } from '../components/ui';
import { usePronunciation } from '../hooks/usePronunciation';
import { InputHistoryItem, SpellingReviewCardProps } from '../types';
import { isValidLetter } from '../utils/spellingUtils';
import { getTailwindClass } from '../utils/styleMapping';

const SpellingReviewCard: React.FC<SpellingReviewCardProps> = ({
  word,
  onMasteredToggle,
  onNext,
  onPrev,
  isFirst,
  isLast,
  currentIndex,
  failedWords,
  setFailedWords,
  onCompleted,
  autoPlay = true,
  pronunciationDelay = 1,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();
  const [currentInput, setCurrentInput] = useState('');
  const [errorCount, setErrorCount] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [inputHistory, setInputHistory] = useState<InputHistoryItem[]>([]);
  const inputRef = useRef<any>(null);
  const lastWordId = useRef<string>('');
  const { play } = usePronunciation();

  const maxErrors = 3;
  const targetWord = word.word.toLowerCase();

  // Qwerty Learner style: Force input focus and clear on error
  const forceInputFocus = () => {
    if (inputRef.current) {
      inputRef.current.focus();
      // Force cursor to end
      const length = inputRef.current.value.length;
      inputRef.current.setSelectionRange(length, length);
    }
  };

  // Simple audio play functions
  const playErrorPronunciation = () => {
    setTimeout(() => {
      play(word.word);
    }, 300);
  };

  const playManualPronunciation = () => {
    play(word.word);
  };

  // Reset state when word changes - Qwerty Learner style
  useEffect(() => {
    setCurrentInput('');
    setErrorCount(0);
    setIsCompleted(false);
    setShowResult(false);
    setInputHistory([]);

    // Force focus after state reset
    setTimeout(() => {
      forceInputFocus();
    }, 0);
  }, [word.id]);

  // Qwerty Learner style - simple auto play
  useEffect(() => {
    if (autoPlay && word.id !== lastWordId.current) {
      lastWordId.current = word.id;
      setTimeout(() => {
        try {
          const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word.word)}&type=2`;
          const audio = new Audio(url);

          // Handle audio loading errors gracefully
          audio.addEventListener('error', e => {
            // Auto-play audio failed to load - graceful fallback
            // Don't throw error, just log it
          });

          audio.play().catch(error => {
            // Auto-play audio playback failed - graceful fallback
            // Don't throw error, just log it
          });
        } catch (error) {
          // Auto-play audio service error - graceful fallback
          // Don't throw error, just log it
        }
      }, pronunciationDelay * 1000);
    }
  }, [word.id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Handle key press
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && showResult) {
      handleNext();
    }
  };

  // Handle next word
  const handleNext = () => {
    if (!isLast) {
      onNext();
    } else {
      // If last word and showResult, jump to UnitDetailPage
      navigate(`/unit/${unitId}`);
    }
  };

  // Handle previous word
  const handlePrev = () => {
    if (!isFirst) {
      onPrev();
    }
  };

  // Handle show answer
  const handleShowAnswer = () => {
    setShowResult(true);
    if (!failedWords.has(word.id)) {
      setFailedWords(word.id);
    }
  };

  // Generate input display
  const renderInputDisplay = () => {
    return targetWord.split('').map((letter, index) => {
      const inputLetter = currentInput[index] || '';
      const isCorrect = inputLetter === letter;
      const hasInput = inputLetter !== '';

      return (
        <span
          key={index}
          className={`inline-block w-8 h-8 mx-1 text-center leading-8 border-2 rounded font-mono text-lg font-bold ${
            hasInput
              ? isCorrect
                ? 'border-green-500 bg-green-100 text-green-700'
                : 'border-red-500 bg-red-100 text-red-700'
              : 'border-gray-300 bg-gray-50 text-gray-400'
          }`}
        >
          {inputLetter}
        </span>
      );
    });
  };

  // Handle input validation and processing

  // Handle input error - Qwerty Learner style
  const handleInputError = (input: string) => {
    // Immediately clear input and force focus
    setCurrentInput('');

    // Force input focus after state update
    setTimeout(() => {
      forceInputFocus();
    }, 0);

    const newErrorCount = errorCount + 1;
    setErrorCount(newErrorCount);
    setInputHistory([...inputHistory, { input, correct: false }]);

    // Play error pronunciation only if autoPlay is enabled AND not the last error
    if (autoPlay && newErrorCount < maxErrors) {
      playErrorPronunciation();
    }

    if (newErrorCount >= maxErrors) {
      // Add to failed words
      setFailedWords(word.id);
      // Mark as unmastered after 3 failed attempts
      onMasteredToggle(false);
      setShowResult(true);
      // Auto jump to next after showing result
      setTimeout(() => handleNext(), 800);
    }
  };

  // Handle input success
  const handleInputSuccess = (input: string) => {
    setIsCompleted(true);
    setInputHistory([...inputHistory, { input, correct: true }]);

    // Mark as mastered when spelling is correct
    onMasteredToggle(true);
    if (onCompleted) onCompleted(word.id);

    // Directly jump to next word without showing result
    handleNext();
  };

  return (
    <div className="max-w-2xl mx-auto p-8 bg-white rounded-xl shadow-lg">
      {/* Word meaning */}
      <div className="mb-6">
        <div className="text-center mb-4">
          <span className="text-lg font-medium text-gray-600">
            {t('meaning')}
          </span>
        </div>
        <div className="text-center">
          <span className="text-xl font-medium">{word.meaning}</span>
          <button
            type="button"
            onClick={playManualPronunciation}
            className="text-gray-500 hover:text-gray-700 ml-3 inline-flex items-center"
            title={t('play_pronunciation')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
            </svg>
          </button>
        </div>
      </div>

      {/* Progress indicator */}
      <div className={`${getTailwindClass('mb-24')}`}>
        <Progress
          percent={Math.round((errorCount / maxErrors) * 100)}
          status={errorCount >= maxErrors ? 'exception' : 'active'}
          format={() => `${errorCount}/${maxErrors}`}
          strokeColor={errorCount >= maxErrors ? '#ff4d4f' : '#1890ff'}
          className="text-base font-medium"
        />
      </div>

      {/* Spelling area */}
      <div className="mb-8">
        {!showResult ? (
          <div>
            <input
              ref={inputRef}
              type="text"
              value={currentInput}
              onChange={e => {
                const value = e.target.value.toLowerCase();

                // Handle backspace
                if (value.length < currentInput.length) {
                  setCurrentInput(value);
                  return;
                }

                // Handle new input - Qwerty Learner style
                if (value.length === currentInput.length + 1) {
                  const nextChar = value[value.length - 1];
                  if (!isValidLetter(nextChar)) return;

                  // Qwerty Learner style: Check if this character is correct
                  const expectedChar = targetWord[value.length - 1];

                  if (nextChar !== expectedChar) {
                    // Wrong character - immediately handle error
                    handleInputError(value);
                    return;
                  }

                  // Correct character - update input
                  setCurrentInput(value);

                  // Check if word is complete
                  if (value === targetWord) {
                    handleInputSuccess(value);
                  }
                }
                // Other cases (like multiple letters input), ignore
              }}
              onKeyPress={handleKeyPress}
              onPaste={e => e.preventDefault()}
              placeholder={t('enter_word')}
              className="w-full text-center font-mono text-xl h-14 px-4 py-3 border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              maxLength={targetWord.length}
              autoFocus
            />
            <div className="mt-4 text-center">{renderInputDisplay()}</div>
          </div>
        ) : (
          <div>
            <div className="mb-4 text-center">
              {targetWord.split('').map((letter, index) => (
                <span
                  key={index}
                  className="inline-block w-8 h-8 mx-1 text-center leading-8 border-2 border-green-500 bg-green-100 text-green-700 rounded font-mono text-lg font-bold"
                >
                  {letter}
                </span>
              ))}
            </div>
            <div className="mt-4 text-center">
              {isCompleted ? (
                <Text className="text-green-600 text-base flex items-center justify-center gap-2">
                  <CheckCircleIcon className="w-5 h-5" />{' '}
                  {t('spelling_correct')}
                </Text>
              ) : (
                <Text className="text-red-600 text-base flex items-center justify-center gap-2">
                  <XCircleIcon className="w-5 h-5" /> {t('correct_answer')}
                  {targetWord}
                </Text>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="flex justify-center items-center gap-4 mt-6">
        <Button
          onClick={handlePrev}
          disabled={isFirst}
          className={`${getTailwindClass('btn-primary')} ${getTailwindClass('btn-standard')}`}
        >
          {t('previous')}
        </Button>

        {!showResult && (
          <Button
            onClick={handleShowAnswer}
            className="px-4 py-2 text-base font-medium rounded-lg transition-colors duration-200 bg-yellow-500 text-white border border-yellow-500 hover:bg-yellow-600"
          >
            {t('view_answer')}
          </Button>
        )}

        <Button
          onClick={handleNext}
          disabled={isLast && !showResult}
          className={`${getTailwindClass('btn-primary')} ${getTailwindClass('btn-standard')}`}
        >
          {isLast ? t('complete') : t('next_word')}
        </Button>
      </div>

      {/* Error history */}
      {inputHistory.length > 0 && (
        <div className="mt-8 text-center">
          <Text
            className={`${getTailwindClass('text-secondary')} ${getTailwindClass('text-small')}`}
          >
            {t('attempt_history')}
          </Text>
          <div className="mt-2 text-center">
            {inputHistory.map((attempt, index) => (
              <div
                key={index}
                className={`inline-block mx-1 px-3 py-1 rounded text-sm font-mono ${
                  attempt.correct
                    ? 'bg-green-100 text-green-700 border border-green-300'
                    : 'bg-red-100 text-red-700 border border-red-300'
                }`}
              >
                {attempt.input}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SpellingReviewCard;
