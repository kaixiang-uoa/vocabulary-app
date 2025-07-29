import React, { useState } from 'react';
import { Card, Checkbox, Tooltip } from '../components/ui';
import { BookOpenIcon, CheckCircleIcon, XCircleIcon, ArrowRightIcon, PencilIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import EditModal from './EditModal';
import { UnitCardProps } from '../types';
import { getTailwindClass } from '../utils/styleMapping';

const UnitCard: React.FC<UnitCardProps> = ({ unit, isSelected = false, onSelect, onEdit }) => {
  const { t } = useTranslation();
  const [showEditModal, setShowEditModal] = useState(false);
  
  const wordCount = unit.words.length;
  const masteredCount = unit.words.filter(word => word.mastered).length;
  const progressPercent = wordCount > 0 ? Math.round((masteredCount / wordCount) * 100) : 0;

  return (
    <Card
      className={`${getTailwindClass('unit-card')} ${isSelected ? getTailwindClass('unit-card.selected') : ''}`}
      hoverable
      styles={{ body: { padding: 0, background: 'transparent' } }}
      variant="outlined"
    >
      {/* Top gradient block */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
              <BookOpenIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-white text-lg font-semibold opacity-90">Unit</span>
          </div>
          {/* Edit button and checkbox side by side */}
          <div className="flex items-center gap-2">
            <button
              onClick={e => { e.stopPropagation(); setShowEditModal(true); }}
              className="p-2 text-white hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors duration-200"
              aria-label={t('edit_unit')}
            >
              <PencilIcon style={{ fontSize: 16 }} />
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
              onOk={values => { setShowEditModal(false); onEdit && onEdit(unit.id, { name: values.name }); }}
              onCancel={() => setShowEditModal(false)}
            />
            <Checkbox
              checked={isSelected}
              onClick={e => {
                e.stopPropagation();
                onSelect && onSelect(unit.id);
              }}
              className="bg-white bg-opacity-20 rounded-lg p-1 border-none"
            />
          </div>
        </div>
      </div>
      {/* Content area */}
      <div
        onClick={() => onSelect && onSelect(unit.id)}
        className="p-6 flex flex-col flex-1" 
      >
        {/* Top content area */}
        <div className="flex-1">
          {/* Unit name and word count */}
          <div className="mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">{unit.name}</h3>
            <span className="text-base text-gray-600 font-medium">
              {t('word_count', { count: wordCount })}
            </span>
          </div>
          {/* Progress bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <span className="text-base font-semibold text-gray-700">{t('learning_progress')}</span>
              <span className="text-lg font-bold text-blue-600">{progressPercent}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
          {/* Statistics */}
          <div className="flex items-center gap-6 mb-6">
            <Tooltip title={t('mastered_words')}>
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircleIcon className="w-5 h-5" />
                <span className="text-base font-semibold">{masteredCount}</span>
              </div>
            </Tooltip>
            <Tooltip title={t('unmastered_words')}>
              <div className="flex items-center gap-2 text-red-600">
                <XCircleIcon className="w-5 h-5" />
                <span className="text-base font-semibold">{wordCount - masteredCount}</span>
              </div>
            </Tooltip>
          </div>
        </div>
        
        {/* View Details button */}
        <div className="mt-auto">
          <Link 
            to={`/unit/${unit.id}`} 
            onClick={e => e.stopPropagation()}
            className="flex items-center justify-center bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 hover:text-blue-100"
          >
            <span className="text-base">{t('view_details')}</span>
            <ArrowRightIcon className="w-5 h-5 ml-3 flex-shrink-0" />
          </Link>
        </div>
      </div>
    </Card>
  );
};

export default UnitCard; 