import React, { useState } from 'react';
import { Card, Button, Typography, Badge, Checkbox, Tooltip } from 'antd';
import { CheckCircleOutlined, SyncOutlined, SoundOutlined, StarFilled } from '@ant-design/icons';

const { Text } = Typography;

const difficultyColors = {
  easy: { bg: 'var(--success-50)', color: 'var(--success-600)', border: 'var(--success-200)' },
  medium: { bg: 'var(--warning-50)', color: 'var(--warning-600)', border: 'var(--warning-200)' },
  hard: { bg: 'var(--error-50)', color: 'var(--error-600)', border: 'var(--error-200)' }
};

const WordCard = ({ word, isSelected, onSelect, onMasteredToggle, onPlayPronunciation }) => {
  const [hovered, setHovered] = useState(false);

  // main background 
  const mainBg = word.mastered
    ? 'linear-gradient(135deg, var(--success-50) 0%, var(--success-100) 100%)'
    : 'linear-gradient(135deg, var(--primary-50) 0%, var(--primary-100) 100%)';
  // top status bar
  const topBar = word.mastered
    ? 'linear-gradient(90deg, var(--success-500) 0%, var(--success-600) 100%)'
    : 'linear-gradient(90deg, var(--primary-500) 0%, var(--warning-500) 100%)';
  // state circle
  const stateCircleBg = word.mastered
    ? 'linear-gradient(135deg, var(--success-500) 0%, var(--success-600) 100%)'
    : 'linear-gradient(135deg, var(--primary-500) 0%, var(--warning-500) 100%)';
  const stateCircleShadow = word.mastered
    ? '0 4px 12px rgba(34, 197, 94, 0.25)'
    : '0 4px 12px rgba(59, 130, 246, 0.25)';
  // button style
  const buttonStyles = word.mastered ? {
    background: 'var(--success-50)',
    color: 'var(--success-600)',
    border: '1px solid var(--success-200)',
    fontWeight: 600,
    fontSize: 15,
    borderRadius: 8,
    boxShadow: 'var(--shadow-sm)',
    transition: 'all 0.2s',
    padding: '0 16px',
  } : {
    background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    fontSize: 15,
    borderRadius: 8,
    boxShadow: 'var(--shadow-md)',
    transition: 'all 0.2s',
    padding: '0 16px',
  };
  // card shadow
  const cardShadow = hovered
    ? 'var(--shadow-xl)'
    : 'var(--shadow-lg)';

  return (
    <Card
      className="word-card-modern"
      hoverable
      style={{
        borderRadius: 18,
        boxShadow: cardShadow,
        background: mainBg,
        border: '1px solid var(--neutral-200)',
        transition: 'box-shadow 0.2s, transform 0.2s',
        cursor: 'pointer',
        minHeight: 210,
        width: '100%',
        padding: 0,
        position: 'relative',
      }}
      bodyStyle={{ padding: 0 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => onSelect && onSelect(word.id)}
    >
      {/* 顶部状态条 */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: hovered ? 6 : 3,
        background: topBar,
        borderTopLeftRadius: 18,
        borderTopRightRadius: 18,
        transition: 'all 0.2s',
        zIndex: 2
      }} />
      {/* 头部区域 */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '20px 28px 0 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
          <Checkbox
            checked={isSelected}
            onChange={e => { e.stopPropagation(); onSelect && onSelect(word.id); }}
            style={{ marginRight: 6 }}
          />
          <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <Text style={{ fontWeight: 700, fontSize: 22, color: 'var(--neutral-900)', letterSpacing: 1, margin: 0, lineHeight: 1 }}>{word.word}</Text>
            <Tooltip title="play pronunciation">
              <Button
                type="text"
                icon={<SoundOutlined style={{ fontSize: 16 }} />}
                size="small"
                style={{ marginLeft: 2, color: 'var(--primary-600)', opacity: 1, transition: 'opacity 0.2s' }}
                onClick={e => { e.stopPropagation(); onPlayPronunciation && onPlayPronunciation(word.word); }}
              />
            </Tooltip>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {word.difficulty && (
            <Badge
              count={word.difficulty}
              style={{
                background: difficultyColors[word.difficulty]?.bg,
                color: difficultyColors[word.difficulty]?.color,
                fontWeight: 600,
                fontSize: 12,
                borderRadius: 8,
                border: `1px solid ${difficultyColors[word.difficulty]?.border}`,
                marginRight: 6
              }}
            />
          )}
          <div style={{
            width: 32, height: 32, borderRadius: '50%',
            background: stateCircleBg,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 18, boxShadow: stateCircleShadow,
            transition: 'all 0.2s',
          }}>
            {word.mastered ? <CheckCircleOutlined /> : <SyncOutlined />}
          </div>
        </div>
      </div>
      {/* 释义区域 */}
      <div style={{ padding: '0 24px', marginTop: 12 }}>
        <div style={{ background: 'var(--neutral-100)', borderRadius: 10, padding: '14px 14px', border: '1px solid var(--neutral-200)' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
            <StarFilled style={{ color: 'var(--primary-500)', fontSize: 16, marginTop: 2 }} />
            <span style={{ color: 'var(--neutral-700)', fontSize: 15, lineHeight: 1.7 }}>{word.meaning}</span>
          </div>
        </div>
      </div>
      {/* 底部操作区域 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 28px 16px 24px', marginTop: 10, background: 'var(--neutral-50)', borderBottomLeftRadius: 18, borderBottomRightRadius: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--neutral-500)' }}>
          <SyncOutlined style={{ fontSize: 15 }} />
          <span style={{ fontSize: 13, fontWeight: 500 }}>review {word.reviewTimes} times</span>
        </div>
        <Button
          type={word.mastered ? 'default' : 'primary'}
          size="small"
          style={buttonStyles}
          onClick={e => { e.stopPropagation(); onMasteredToggle && onMasteredToggle(word.id); }}
        >
          {word.mastered ? 'mark unmastered' : 'mark mastered'}
        </Button>
      </div>
    </Card>
  );
};

export default WordCard;