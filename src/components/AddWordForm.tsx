import {
  PlusIcon,
  ArrowUpTrayIcon,
  QuestionMarkCircleIcon,
  ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Input, Button, message, Modal } from '../components/ui';
// Batch import will iterate and use onAddWord to ensure unified data flow
import {
  ImportWordData,
  ImportData,
  AddWordFormProps,
  FormValues,
} from '../types';

import ImportModal from './ImportModal';
// Note: business logic (state) should be provided by page via props

const AddWordForm: React.FC<AddWordFormProps & { onExport?: () => void }> = ({
  unitId,
  onWordAdded,
  onAddWord,
  onExport,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<FormValues>({
    word: '',
    meaning: '',
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  // addWordToUnit is provided from parent via onAddWord

  // Handle form submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const { word, meaning } = formData;

    // Validate input
    const trimmedWord = word.trim();
    const trimmedMeaning = meaning.trim();

    if (!trimmedWord) {
      message.error(t('word_required'));
      return;
    }

    if (!trimmedMeaning) {
      message.error(t('meaning_required'));
      return;
    }

    const performAdd = onAddWord;
    const success = performAdd
      ? await performAdd(trimmedWord, trimmedMeaning)
      : false;
    if (success) {
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
  const handleImportConfirm = async (parsed: ImportData) => {
    // For AddWordForm, we only support word array format
    if (Array.isArray(parsed) && parsed.length > 0 && !('unit' in parsed[0])) {
      // Handle direct word array import via onAddWord to keep single data source
      const items = parsed as ImportWordData[];
      if (!onAddWord) {
        message.error(t('import_csv_fail'));
        return;
      }
      let successCount = 0;
      for (const item of items) {
        const word = (item.word || '').trim();
        const meaning = (item.meaning || '').trim();
        if (!word || !meaning) continue;
        // delegate to parent add handler
        const ok = await onAddWord(word, meaning);
        if (ok) successCount++;
      }
      if (successCount > 0) {
        message.success(t('import_words_success', { count: successCount }));
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
            onChange={e => handleInputChange('word', e.target.value)}
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
            onChange={e => handleInputChange('meaning', e.target.value)}
          />
        </div>

        <div className="flex flex-wrap gap-3 justify-center lg:justify-start">
          <Button
            htmlType="submit"
            icon={<PlusIcon />}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
          >
            {t('add_word')}
          </Button>
          <Button
            onClick={showImportModal}
            icon={<ArrowUpTrayIcon />}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
          >
            {t('import_all')}
          </Button>
          {onExport && (
            <Button
              icon={<ArrowDownTrayIcon />}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
              onClick={onExport}
            >
              {t('export_words')}
            </Button>
          )}
          <Button
            icon={<QuestionMarkCircleIcon />}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
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
        <div className="mb-4">
          <b>{t('help_csv_title_word')}</b>
          <div className="text-gray-600 text-sm my-2">
            {t('help_csv_desc_word')}
          </div>
          <pre className="bg-gray-100 p-3 rounded text-xs">
            {t('help_csv_example_word')}
          </pre>
        </div>
        <div className="mb-4">
          <b>{t('help_json_title_word')}</b>
          <div className="text-gray-600 text-sm my-2">
            {t('help_json_desc_word')}
          </div>
          <pre className="bg-gray-100 p-3 rounded text-xs">
            {t('help_json_example_word')}
          </pre>
        </div>
        <div className="text-right">
          <Button
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg justify-center"
            onClick={() => setHelpVisible(false)}
          >
            {t('help_close')}
          </Button>
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
