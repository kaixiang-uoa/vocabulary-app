import React, { useState } from 'react';
import { Input, Button, message, Modal } from '../components/ui';
import { PlusIcon, ArrowUpTrayIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { addWord } from '../utils/wordUtils';
import { addWordsInBatch } from '../utils/wordImportExport';
import ImportModal from './ImportModal';
import { useTranslation } from 'react-i18next';
import { ImportWordData, ImportData, AddWordFormProps, FormValues } from '../types';



const AddWordForm: React.FC<AddWordFormProps> = ({ unitId, onWordAdded }) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormValues>({ word: '', meaning: '' });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  // Handle form submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { word, meaning } = formData;
    if (addWord(unitId, word, meaning)) {
      message.success(t('add_word_success'));
      setFormData({ word: '', meaning: '' });
      if (onWordAdded) onWordAdded();
    } else {
      message.error(t('add_word_fail'));
    }
  };

  const handleInputChange = (field: keyof FormValues, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Show import modal
  const showImportModal = () => {
    setIsModalVisible(true);
  };

  // Handle batch import (now supports multiple formats)
  const handleImportConfirm = (parsed: ImportData) => {
    // For AddWordForm, we only support word array format
    if (Array.isArray(parsed) && parsed.length > 0 && !('unit' in parsed[0])) {
      // Handle direct word array import
      if (addWordsInBatch(unitId, parsed as ImportWordData[])) {
        message.success(t('import_success'));
        setIsModalVisible(false);
        if (onWordAdded) onWordAdded();
      } else {
        message.error(t('import_csv_fail'));
      }
    } else {
      message.error(t('import_parse_error'));
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('word')}
          </label>
          <Input 
            placeholder={t('input_word_placeholder')} 
            value={formData.word}
            onChange={(e) => handleInputChange('word', e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t('meaning')}
          </label>
          <Input.TextArea 
            placeholder={t('input_meaning_placeholder')} 
            rows={2}
            value={formData.meaning}
            onChange={(e) => handleInputChange('meaning', e.target.value)}
          />
        </div>

        <div>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<PlusIcon />} 
            style={{
              background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 17,
              border: 'none',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {t('add_word')}
          </Button>
          <Button 
            style={{ 
              marginLeft: 8, 
              background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 17,
              border: 'none',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s',
            }}
            onClick={showImportModal}
            icon={<ArrowUpTrayIcon />}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {t('import_all')}
          </Button>
          <Button
            icon={<QuestionMarkCircleIcon />}
            style={{
              background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: '#fff',
              borderRadius: 6,
              border: 'none',
              fontWeight: 500,
              fontSize: 16,
              boxShadow: 'var(--shadow-sm)',
              marginLeft: 8
            }}
            onClick={() => setHelpVisible(true)}
          >
            {t('help')}
          </Button>
        </div>
      </form>
      <Modal
        open={helpVisible}
        title={t('help_title')}
        onCancel={() => setHelpVisible(false)}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <b>{t('help_csv_title_word')}</b>
          <div style={{ color: '#666', fontSize: 14, margin: '8px 0' }}>{t('help_csv_desc_word')}</div>
          <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 6, fontSize: 13 }}>{t('help_csv_example_word')}</pre>
        </div>
        <div style={{ marginBottom: 16 }}>
          <b>{t('help_json_title_word')}</b>
          <div style={{ color: '#666', fontSize: 14, margin: '8px 0' }}>{t('help_json_desc_word')}</div>
          <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 6, fontSize: 13 }}>{t('help_json_example_word')}</pre>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={() => setHelpVisible(false)}>{t('help_close')}</Button>
        </div>
      </Modal>

      <ImportModal
        visible={isModalVisible}
        onOk={handleImportConfirm}
        onCancel={() => setIsModalVisible(false)}
        title={t('import_all')}
        accept=".csv,.json"
        buttonText={t('upload_file')}
        icon={<ArrowUpTrayIcon />}
        placeholder={t('import_paste_tip')}
      />
    </div>
  );
};

export default AddWordForm; 