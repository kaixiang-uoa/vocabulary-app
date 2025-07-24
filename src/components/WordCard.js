"use client"

import { useState } from "react"
import { EditOutlined } from '@ant-design/icons';
import EditModal from './EditModal';

// Simple icons as React components
const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
  </svg>
)

const SyncIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46C19.54 15.03 20 13.57 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74C4.46 8.97 4 10.43 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
  </svg>
)

const SoundIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
  </svg>
)

const difficultyColors = {
  easy: { bg: 'var(--wordcard-easy-bg)', color: 'var(--wordcard-easy-color)', border: 'var(--wordcard-easy-border)' },
  medium: { bg: 'var(--wordcard-medium-bg)', color: 'var(--wordcard-medium-color)', border: 'var(--wordcard-medium-border)' },
  hard: { bg: 'var(--wordcard-hard-bg)', color: 'var(--wordcard-hard-color)', border: 'var(--wordcard-hard-border)' },
}

const playYoudaoVoice = (word, type = 2) => {
  const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=${type}`;
  const audio = new window.Audio(url);
  audio.play();
};

const WordCard = ({ word, isSelected, onSelect, onMasteredToggle, onEdit }) => {
  const [hovered, setHovered] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false);

  const cardStyle = {
    borderRadius: 'var(--wordcard-radius)',
    border: word.mastered ? '2px solid var(--wordcard-mastered-border)' : '2px solid var(--wordcard-unmastered-border)',
    background: word.mastered ? 'var(--wordcard-mastered-bg)' : 'var(--wordcard-unmastered-bg)',
    transition: 'all 0.3s ease',
    transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
    boxShadow: hovered ? 'var(--wordcard-shadow-hover)' : 'var(--wordcard-shadow-normal)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    cursor: 'pointer',
    padding: '16px',
  }

  return (
    <div
      style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Edit button, positioned in the top-right corner */}
      <button
        onClick={e => {
          e.stopPropagation();
          setShowEditModal(true);
        }}
        style={{
          position: 'absolute',
          top: 10,
          right: 10,
          background: 'none',
          border: 'none',
          color: 'var(--neutral-400)',
          cursor: 'pointer',
          borderRadius: 4,
          padding: 4,
          zIndex: 2,
          transition: 'background 0.2s',
        }}
        onMouseEnter={e => e.currentTarget.style.background = 'var(--neutral-100)'}
        onMouseLeave={e => e.currentTarget.style.background = 'none'}
        aria-label="Edit"
    >
        <EditOutlined style={{ fontSize: 18 }} />
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
        onOk={values => { setShowEditModal(false); onEdit && onEdit(word.id, values); }}
        onCancel={() => setShowEditModal(false)}
      />
      {/* Header area */}
      <div
        // No onClick here, only checkbox controls selection
      >
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={(e) => {
                e.stopPropagation()
                onSelect && onSelect(word.id)
              }}
              style={{ width: 16, height: 16 }}
            />
            <div
              style={{
                width: 24,
                height: 24,
                borderRadius: '50%',
                background: word.mastered ? 'var(--wordcard-easy-color)' : 'var(--wordcard-btn-bg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
              }}
            >
              {word.mastered ? <CheckCircleIcon /> : <SyncIcon />}
            </div>
          </div>

          {word.difficulty && (
            <span
              style={{
                background: difficultyColors[word.difficulty]?.bg,
                color: difficultyColors[word.difficulty]?.color,
                border: `1px solid ${difficultyColors[word.difficulty]?.border}`,
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: 12,
                textTransform: "capitalize",
              }}
            >
              {word.difficulty}
            </span>
          )}
        </div>
        
        {/* Word and pronunciation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 12,
          }}
        >
          <span
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: 'var(--wordcard-text-main)',
              flex: 1,
            }}
          >
            {word.word}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              playYoudaoVoice(word.word, 2); // English pronunciation, type=1 is American pronunciation
            }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--wordcard-btn-bg)',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            title="Play pronunciation"
          >
            <SoundIcon />
          </button>
        </div>

        {/* Meaning */}
        <div
          style={{
            background: 'var(--wordcard-bg-secondary)',
            padding: '12px',
            borderRadius: 8,
            border: '1px solid var(--wordcard-border-secondary)',
            marginBottom: 12,
          }}
        >
          <span
            style={{
              color: 'var(--wordcard-text-secondary)',
              fontSize: 14,
              lineHeight: 1.5,
              display: 'block',
            }}
          >
            {word.meaning}
          </span>
        </div>
      </div>

      {/* Bottom operation area */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: 8,
          borderTop: '1px solid var(--wordcard-border-secondary)',
          marginTop: 'auto',
        }}
      >
        <span
          style={{
            fontSize: 12,
            color: '#8c8c8c',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
        >
          <SyncIcon />
          {word.reviewTimes} reviews
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation()
            onMasteredToggle && onMasteredToggle(word.id)
          }}
          style={{
            background: word.mastered ? 'var(--wordcard-btn-bg-mastered)' : 'var(--wordcard-btn-bg)',
            color: word.mastered ? 'var(--wordcard-btn-color-mastered)' : 'var(--wordcard-btn-color)',
            border: word.mastered ? '1px solid var(--wordcard-btn-border-mastered)' : 'none',
            borderRadius: 6,
            fontWeight: 500,
            fontSize: 12,
            padding: '4px 12px',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          {word.mastered ? "Unmaster" : "Master"}
        </button>
      </div>
    </div>
  )
}

export default WordCard
