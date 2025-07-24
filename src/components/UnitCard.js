import React from 'react';
import { Card, Checkbox, Tag, Tooltip } from 'antd';
import { BookOutlined, CheckCircleOutlined, CloseCircleOutlined, RightOutlined, EditOutlined } from '@ant-design/icons';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import EditModal from './EditModal';

const UnitCard = ({ unit, isSelected, onSelect, onEdit }) => {
  const { t } = useTranslation();
  const wordCount = unit.words.length;
  const masteredCount = unit.words.filter(word => word.mastered).length;
  const progressPercent = wordCount > 0 ? Math.round((masteredCount / wordCount) * 100) : 0;
  const [showEditModal, setShowEditModal] = React.useState(false);

  return (
    <Card
      className={`unit-card ${isSelected ? 'unit-card-selected' : ''}`}
      hoverable
      styles={{ body: { padding: 0, background: 'transparent', height: '100%' } }}
      variant="outlined"
      style={{ 
        width: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        background: 'var(--neutral-50)',
        boxShadow: isSelected
          ? 'var(--shadow-xl)'
          : 'var(--shadow-lg)',
        transition: 'all 0.25s cubic-bezier(.4,2,.6,1)',
        transform: isSelected ? 'scale(1.04)' : 'scale(1)',
        border: isSelected ? '2px solid var(--primary-500)' : 'none',
        cursor: 'pointer',
        margin: 0,
        padding: 0,
        minHeight: 260,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}
    >
      {/* Top gradient block */}
      <div style={{
        width: '100%',
        height: 70,
        background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'relative'
      }}>
        <div style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.18)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <BookOutlined style={{ fontSize: 20, color: '#fff' }} />
        </div>
        {/* Edit button and checkbox side by side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={e => { e.stopPropagation(); setShowEditModal(true); }}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--neutral-50)',
              cursor: 'pointer',
              borderRadius: 4,
              padding: 4,
              transition: 'background 0.2s',
              fontSize: 18,
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
            onMouseLeave={e => e.currentTarget.style.background = 'none'}
            aria-label="Edit"
          >
            <EditOutlined />
          </button>
          {/* Edit modal */}
          <EditModal
            visible={showEditModal}
            title="edit_unit"
            okText="save"
            cancelText="cancel"
            fields={[
              { name: 'name', label: 'unit_name', value: unit.name, placeholder: 'input_unit_name_placeholder' },
            ]}
            onOk={values => { setShowEditModal(false); onEdit && onEdit(unit.id, values); }}
            onCancel={() => setShowEditModal(false)}
          />
          <Checkbox
            checked={isSelected}
            onClick={e => {
              e.stopPropagation();
              onSelect(unit.id);
            }}
            style={{ marginRight: 0, background: 'rgba(255,255,255,0.12)', borderRadius: 6, padding: 4 }}
          />
        </div>
      </div>
      {/* Content area */}
      <div
        onClick={() => onSelect(unit.id)}
        style={{
          background: 'var(--neutral-100)',
          borderBottomLeftRadius: 20,
          borderBottomRightRadius: 20,
          padding: '20px 24px 18px 24px',
          minHeight: 140,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          flex: 1,
          cursor: 'pointer',
        }}
      >
        {/* Unit name and word count */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
          <h3 style={{ 
            fontSize: '18px', 
            fontWeight: 700, 
            color: 'var(--neutral-900)', 
            margin: 0,
            marginRight: 12,
            letterSpacing: 0.5
          }}>{unit.name}</h3>
          <Tag color="var(--primary-50)" style={{ color: 'var(--primary-600)', borderRadius: 6, fontWeight: 600, fontSize: 14, margin: 0, padding: '2px 10px', border: '1px solid var(--primary-200)' }}>
            {t('word_count', { count: wordCount })}
          </Tag>
        </div>
        {/* Progress bar */}
        <div style={{ marginBottom: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2 }}>
            <span style={{ fontSize: 13, color: 'var(--neutral-500)' }}>{t('learning_progress')}</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--neutral-900)' }}>{progressPercent}%</span>
          </div>
          <div style={{
            width: '100%',
            height: 8,
            background: 'var(--neutral-200)',
            borderRadius: 6,
            overflow: 'hidden',
            marginBottom: 0
          }}>
            <div style={{
              width: `${progressPercent}%`,
              height: '100%',
              background: 'var(--primary-600)',
              borderRadius: 6,
              transition: 'width 0.3s'
            }} />
          </div>
        </div>
        {/* Statistics */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 10 }}>
          <Tooltip title={t('mastered_words')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--success-600)', fontSize: 16, fontWeight: 600 }}>
              <CheckCircleOutlined />
              <span style={{ fontWeight: 600 }}>{masteredCount}</span>
            </div>
          </Tooltip>
          <Tooltip title={t('unmastered_words')}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--error-600)', fontSize: 16, fontWeight: 600 }}>
              <CloseCircleOutlined />
              <span style={{ fontWeight: 600 }}>{wordCount - masteredCount}</span>
            </div>
          </Tooltip>
        </div>
        {/* Detail link */}
        <Link 
          to={`/unit/${unit.id}`} 
          onClick={e => e.stopPropagation()}
          style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            padding: '10px 14px',
            borderRadius: '8px',
            color: 'var(--primary-600)',
            background: 'var(--primary-50)',
            border: '1px solid var(--primary-200)',
            fontWeight: 600,
            fontSize: 15,
            transition: 'all 0.2s',
            marginTop: 2
          }}
          className="detail-link"
        >
          {t('view_details')}
          <RightOutlined />
        </Link>
      </div>
    </Card>
  );
};

export default UnitCard; 