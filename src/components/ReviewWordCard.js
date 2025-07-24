import React from 'react';

// Play pronunciation using Youdao API
const playYoudaoVoice = (word, type = 2) => {
  const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`;
  const audio = new window.Audio(url);
  audio.play();
};

/**
 * ReviewWordCard - A card component for review mode with flip effect.
 * Props:
 *   word: { word, meaning, mastered }
 *   isFlipped: boolean
 *   onFlip: () => void
 *   onMasteredToggle: () => void
 */
const ReviewWordCard = ({ word, isFlipped, onFlip, onMasteredToggle }) => {
  // Card style (reuse WordCard style)
  const cardStyle = {
    borderRadius: 'var(--wordcard-radius)',
    border: word.mastered ? '2px solid var(--wordcard-mastered-border)' : '2px solid var(--wordcard-unmastered-border)',
    background: word.mastered ? 'var(--wordcard-mastered-bg)' : 'var(--wordcard-unmastered-bg)',
    transition: 'all 0.3s ease',
    boxShadow: 'var(--wordcard-shadow-normal)',
    height: '260px',
    width: '100%',
    maxWidth: 400,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    position: 'relative',
    perspective: '800px',
    userSelect: 'none',
  };
  const innerStyle = {
    position: 'absolute',
    width: '100%',
    height: '100%',
    top: 0,
    left: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    transition: 'transform 0.5s',
    fontSize: 22,
    fontWeight: 700,
    color: '#222',
    padding: 24,
    boxSizing: 'border-box',
  };
  const frontStyle = {
    ...innerStyle,
    transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
    zIndex: isFlipped ? 0 : 2,
  };
  const backStyle = {
    ...innerStyle,
    transform: isFlipped ? 'rotateY(0deg)' : 'rotateY(180deg)',
    zIndex: isFlipped ? 2 : 0,
    background: 'var(--wordcard-bg-secondary)',
    color: 'var(--wordcard-text-secondary)',
    fontSize: 18,
    fontWeight: 500,
  };
  return (
    <div style={cardStyle} onClick={onFlip}>
      {/* Front: show word and pronunciation */}
      <div style={frontStyle}>
        <span style={{ fontSize: 28, fontWeight: 800, color: '#222', marginBottom: 16 }}>{word.word}</span>
        <button
          onClick={e => { e.stopPropagation(); playYoudaoVoice(word.word, 2); }}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--wordcard-btn-bg)',
            cursor: 'pointer',
            padding: 4,
            borderRadius: 4,
            marginTop: 8,
            marginBottom: 8,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          title="Play pronunciation"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
        </button>
        <span style={{ fontSize: 14, color: '#888', marginTop: 12 }}>(Click card to show meaning)</span>
      </div>
      {/* Back: show meaning and master button */}
      <div style={backStyle}>
        <span>{word.meaning}</span>
        <button
          onClick={e => { e.stopPropagation(); onMasteredToggle && onMasteredToggle(word.id); }}
          style={{
            marginTop: 24,
            background: word.mastered ? 'var(--wordcard-btn-bg-mastered)' : 'var(--wordcard-btn-bg)',
            color: word.mastered ? 'var(--wordcard-btn-color-mastered)' : 'var(--wordcard-btn-color)',
            border: word.mastered ? '1px solid var(--wordcard-btn-border-mastered)' : 'none',
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 15,
            padding: '6px 20px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {word.mastered ? 'Unmaster' : 'Master'}
        </button>
        <span style={{ fontSize: 13, color: '#aaa', marginTop: 10, display: 'block' }}>(Click card to show word)</span>
      </div>
    </div>
  );
};

export default ReviewWordCard; 