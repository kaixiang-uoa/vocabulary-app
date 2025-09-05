import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  PencilIcon,
  SpeakerWaveIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, Link } from 'react-router';

import AddWordForm from '../components/AddWordForm';
import EditModal from '../components/EditModal';
import LanguageSwitcher from '../components/LanguageSwitcher';
import {
  Title,
  Button,
  Card,
  Divider,
  message,
  Statistic,
  Row,
  Col,
  Checkbox,
  Tag,
  Tabs,
  Popconfirm,
} from '../components/ui';
import { VirtualList } from '../components/ui/VirtualList';
import { useWordContext } from '../contexts/WordContext';
import { Word } from '../types';
import { getTailwindClass } from '../utils/styleMapping';
import { exportWordsToCSV } from '../utils/wordImportExport';

const UnitDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { unitId } = useParams<{ unitId: string }>();
  const [activeTab, setActiveTab] = useState<'all' | 'mastered' | 'unmastered'>(
    'all'
  );
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);

  // Use word operations hook
  const {
    data,
    loadData,
    toggleWordMasteredStatus,
    deleteWords,
    updateWordInUnit,
    addWordToUnit,
  } = useWordContext();

  // Get current unit and words from hook data
  const unit = data?.units.find(u => u.id === unitId) || null;
  const words = unit?.words || [];

  // Filter word list
  const filteredWords =
    activeTab === 'all'
      ? words
      : activeTab === 'mastered'
        ? words.filter(word => word.mastered)
        : words.filter(word => !word.mastered);

  // Load data when component mounts or unitId changes
  useEffect(() => {
    if (unitId) {
      loadData();
    }
  }, [unitId, loadData]);

  // 刷新入口集中在 WordContext，此处无需再监听

  const handleMasteredToggle = async (wordId: string) => {
    if (!unitId) return;

    const success = await toggleWordMasteredStatus(unitId, wordId);
    if (success) {
      message.success(t('status_updated'));
    } else {
      message.error(t('status_update_failed'));
    }
  };

  const handleExport = async () => {
    if (!unitId) return;

    const csvContent = exportWordsToCSV(words);

    if (!csvContent) {
      message.error(t('no_words_to_export'));
      return;
    }

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', t('unit_word_csv_filename', { unitId }));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    message.success(t('export_success'));
  };

  // Delete words (batch)
  const handleDeleteWords = async () => {
    if (!unitId) return;

    const success = await deleteWords(unitId, selectedWordIds);
    if (success) {
      message.success(t('delete_success', { count: selectedWordIds.length }));
      setSelectedWordIds([]);
    } else {
      message.error(t('delete_fail'));
    }
  };

  // Select all/cancel all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedWordIds(filteredWords.map(word => word.id));
    } else {
      setSelectedWordIds([]);
    }
  };

  const isAllSelected =
    filteredWords.length > 0 && selectedWordIds.length === filteredWords.length;
  const isIndeterminate =
    selectedWordIds.length > 0 && selectedWordIds.length < filteredWords.length;

  // Calculate statistics
  const totalWords = words.length;
  const masteredWords = words.filter(word => word.mastered).length;
  const masteryRate =
    totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;

  // Virtual list configuration
  const ITEM_HEIGHT = 80; // Height of each word item
  const CONTAINER_HEIGHT = 600; // Height of the virtual list container

  // Word editing
  const handleEditWord = async (
    wordId: string,
    values: { word: string; meaning: string }
  ) => {
    if (!unitId) return;

    const success = await updateWordInUnit(unitId, wordId, values);
    if (success) {
      message.success(t('word_updated'));
      setShowEditModal(false);
      setEditingWord(null);
    } else {
      message.error(t('word_update_failed'));
    }
  };

  // Play pronunciation
  const playPronunciation = (word: string) => {
    try {
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;
      const audio = new window.Audio(url);

      // Handle audio loading errors gracefully
      audio.addEventListener('error', e => {
        // ignore
        // Don't throw error, just log it
      });

      audio.play().catch(error => {
        // ignore
        // Don't throw error, just log it
      });
    } catch (error) {
      // ignore
      // Don't throw error, just log it
    }
  };

  if (!unit) {
    return (
      <div className="flex items-center justify-center h-64 text-lg text-gray-600">
        {t('loading')}
      </div>
    );
  }

  return (
    <div className={getTailwindClass('unit-detail-page')}>
      {/* Header with title and language switcher */}
      <div className={getTailwindClass('page-header')}>
        <Title level={2} className={getTailwindClass('page-title')}>
          {unit.name}
        </Title>
        <LanguageSwitcher className="flex items-center gap-2" />
      </div>

      {/* Action buttons - Responsive Layout */}
      <div className="mb-6">
        {/* Large screen: horizontal layout */}
        <div className="hidden lg:flex flex-wrap gap-3">
          <Link to="/">
            <Button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
              icon={<ArrowLeftIcon className="w-5 h-5" />}
            >
              {t('back_to_home')}
            </Button>
          </Link>
          <Link to={`/review/${unitId}`}>
            <Button
              icon={<ArrowPathIcon />}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
            >
              {t('start_review')}
            </Button>
          </Link>
          <Link to={`/spelling-review/${unitId}`}>
            <Button
              icon={<BookOpenIcon />}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
            >
              {t('spelling_review')}
            </Button>
          </Link>
        </div>

        {/* Medium and small screen: vertical layout */}
        <div className="lg:hidden space-y-3">
          <Link to="/">
            <Button
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 w-full justify-center"
              icon={<ArrowLeftIcon className="w-5 h-5" />}
            >
              {t('back_to_home')}
            </Button>
          </Link>
          <div className="flex gap-2">
            <Link to={`/review/${unitId}`} className="flex-1">
              <Button
                icon={<ArrowPathIcon />}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center w-full"
              >
                {t('start_review')}
              </Button>
            </Link>
            <Link to={`/spelling-review/${unitId}`} className="flex-1">
              <Button
                icon={<BookOpenIcon />}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center w-full"
              >
                {t('spelling_review')}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card className={getTailwindClass('stats-card')}>
            <Statistic
              title={t('total_words')}
              value={totalWords}
              prefix={<BookOpenIcon />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className={`${getTailwindClass('stats-card')} ${getTailwindClass('stats-card.mastered')}`}
          >
            <Statistic
              title={t('mastered')}
              value={masteredWords}
              prefix={<CheckCircleIcon />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card
            className={`${getTailwindClass('stats-card')} ${masteryRate > 80 ? 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50' : masteryRate > 50 ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50'}`}
          >
            <Statistic
              title={t('mastery_rate')}
              value={masteryRate}
              suffix="%"
              prefix={<ArrowPathIcon />}
              valueStyle={{
                color:
                  masteryRate > 80
                    ? '#3f8600'
                    : masteryRate > 50
                      ? '#faad14'
                      : '#cf1322',
              }}
            />
          </Card>
        </Col>
      </Row>

      <div className="mb-4">
        <Divider orientation="left">
          <span className="text-xl font-semibold text-gray-800">
            {t('add_word')}
          </span>
        </Divider>
      </div>

      <AddWordForm
        unitId={unitId}
        onWordAdded={loadData}
        onAddWord={async (word, meaning) => {
          if (!unitId) return false;
          return addWordToUnit(unitId, word, meaning);
        }}
        onExport={handleExport}
      />

      <div className="mt-8 mb-2">
        <Divider orientation="left">
          <span className="text-xl font-semibold text-gray-800">
            {t('word_list')}
          </span>
        </Divider>
      </div>

      {/* First row: Tabs */}
      <div className="mb-4 py-2">
        <Tabs
          activeKey={activeTab}
          onChange={key => {
            setActiveTab(key as 'all' | 'mastered' | 'unmastered');
            setSelectedWordIds([]);
          }}
          items={[
            { key: 'all', label: `${t('all')} (${words.length})` },
            {
              key: 'mastered',
              label: `${t('mastered')} (${words.filter(word => word.mastered).length})`,
            },
            {
              key: 'unmastered',
              label: `${t('unmastered')} (${words.filter(word => !word.mastered).length})`,
            },
          ]}
        />
      </div>

      {/* Second row: Selection and pagination controls - Unified responsive layout */}
      {filteredWords.length > 0 && (
        <>
          {/* Large screens: horizontal layout */}
          <div
            className="hidden lg:flex items-center justify-between mb-4"
            style={{
              padding: '16px 20px',
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              marginBottom: 20,
            }}
          >
            {/* Left side: Selection controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={handleSelectAll}
                className="text-sm font-medium"
              >
                {t('select_all')}
              </Checkbox>
              <Popconfirm
                title={t('delete_confirm_title')}
                description={t('delete_confirm_desc')}
                onConfirm={handleDeleteWords}
                okText={t('ok')}
                cancelText={t('cancel')}
                trigger="click"
              >
                <Button
                  type="primary"
                  danger
                  disabled={selectedWordIds.length === 0}
                  style={{
                    background:
                      selectedWordIds.length === 0 ? '#f5f5f5' : '#fff',
                    color: selectedWordIds.length === 0 ? '#999' : '#dc2626',
                    borderRadius: 8,
                    border:
                      selectedWordIds.length === 0
                        ? '2px solid #e5e7eb'
                        : '2px solid #dc2626',
                    fontWeight: 500,
                    fontSize: 14,
                    boxShadow:
                      selectedWordIds.length === 0
                        ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                        : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.2s',
                    opacity: selectedWordIds.length === 0 ? 0.5 : 1,
                  }}
                >
                  {t('delete_selected')}
                  {selectedWordIds.length > 0
                    ? ` (${selectedWordIds.length})`
                    : ''}
                </Button>
              </Popconfirm>
            </div>
          </div>

          {/* Medium screens: horizontal layout */}
          <div
            className="hidden md:block lg:hidden mb-4"
            style={{
              padding: '16px 20px',
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              marginBottom: 20,
            }}
          >
            <div className="flex items-center justify-between">
              {/* Left side: Selection controls */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  className="text-sm font-medium"
                >
                  {t('select_all')}
                </Checkbox>
                <Popconfirm
                  title={t('delete_confirm_title')}
                  description={t('delete_confirm_desc')}
                  onConfirm={handleDeleteWords}
                  okText={t('ok')}
                  cancelText={t('cancel')}
                  trigger="click"
                >
                  <Button
                    type="primary"
                    danger
                    disabled={selectedWordIds.length === 0}
                    size="small"
                    style={{
                      background:
                        selectedWordIds.length === 0 ? '#f5f5f5' : '#fff',
                      color: selectedWordIds.length === 0 ? '#999' : '#dc2626',
                      borderRadius: 6,
                      border:
                        selectedWordIds.length === 0
                          ? '1px solid #e5e7eb'
                          : '2px solid #dc2626',
                      fontWeight: 500,
                      fontSize: 12,
                      boxShadow:
                        selectedWordIds.length === 0
                          ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
                          : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.2s',
                      opacity: selectedWordIds.length === 0 ? 0.5 : 1,
                    }}
                  >
                    {t('delete_selected')}
                    {selectedWordIds.length > 0
                      ? ` (${selectedWordIds.length})`
                      : ''}
                  </Button>
                </Popconfirm>
              </div>

              {/* Right side: Pagination controls */}
            </div>
          </div>

          {/* Small screens: mobile layout */}
          <div
            className="block md:hidden mb-4"
            style={{
              padding: '16px 20px',
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              marginBottom: 20,
            }}
          >
            <div className="flex items-center justify-between">
              {/* Left side: Selection controls */}
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={handleSelectAll}
                  className="text-sm"
                >
                  All
                </Checkbox>
                <Popconfirm
                  title={t('delete_confirm_title')}
                  description={t('delete_confirm_desc')}
                  onConfirm={handleDeleteWords}
                  okText={t('ok')}
                  cancelText={t('cancel')}
                  trigger="click"
                >
                  <Button
                    type="primary"
                    danger
                    disabled={selectedWordIds.length === 0}
                    size="small"
                    className="text-xs"
                    style={{
                      background:
                        selectedWordIds.length === 0 ? '#f5f5f5' : '#fff',
                      color: selectedWordIds.length === 0 ? '#999' : '#dc2626',
                      borderRadius: 6,
                      border:
                        selectedWordIds.length === 0
                          ? '1px solid #e5e7eb'
                          : '2px solid #dc2626',
                      fontWeight: 500,
                      fontSize: 12,
                      boxShadow:
                        selectedWordIds.length === 0
                          ? 'none'
                          : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s',
                      opacity: selectedWordIds.length === 0 ? 0.5 : 1,
                    }}
                  >
                    Delete ({selectedWordIds.length})
                  </Button>
                </Popconfirm>
              </div>

              {/* Right side: Pagination controls */}
            </div>
          </div>
        </>
      )}

      {/* Virtual List for Words */}
      {filteredWords.length > 0 ? (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <VirtualList
            items={filteredWords}
            itemHeight={ITEM_HEIGHT}
            containerHeight={CONTAINER_HEIGHT}
            renderItem={(word, index) => (
              <div
                key={word.id}
                className="flex items-center justify-between p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors"
                style={{ height: ITEM_HEIGHT }}
              >
                <div className="flex items-center gap-3 flex-1">
                  <Checkbox
                    checked={selectedWordIds.includes(word.id)}
                    onChange={checked => {
                      if (checked) {
                        setSelectedWordIds(prev => [...prev, word.id]);
                      } else {
                        setSelectedWordIds(prev =>
                          prev.filter(id => id !== word.id)
                        );
                      }
                    }}
                  />

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-gray-900">
                        {word.word}
                      </span>
                      <Button
                        type="text"
                        size="small"
                        onClick={() => playPronunciation(word.word)}
                        className="p-1 text-gray-500 hover:text-gray-700"
                      >
                        <SpeakerWaveIcon className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="text-base text-gray-600">
                      {word.meaning}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {word.mastered ? (
                    <Tag color="success" icon={<CheckCircleIcon />}>
                      {t('mastered')}
                    </Tag>
                  ) : (
                    <Tag color="processing" icon={<ArrowPathIcon />}>
                      {t('unmastered')}
                    </Tag>
                  )}

                  <Button
                    type="text"
                    size="small"
                    onClick={() => {
                      setEditingWord(word);
                      setShowEditModal(true);
                    }}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </Button>

                  <Button
                    type="text"
                    size="small"
                    onClick={() => handleMasteredToggle(word.id)}
                    className="p-1 text-gray-500 hover:text-gray-700"
                  >
                    {word.mastered ? (
                      <ArrowPathIcon className="w-4 h-4" />
                    ) : (
                      <CheckCircleIcon className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </div>
            )}
          />
        </div>
      ) : (
        <div className="text-center py-15 px-5 text-gray-600">
          <div className="text-lg font-medium mb-3">
            {t('no_words_in_unit')}
          </div>
          <div className="text-sm text-gray-500 leading-relaxed">
            {t('no_words_in_unit_tip')}
          </div>
        </div>
      )}

      {/* Edit Modal */}
      <EditModal
        visible={showEditModal}
        title="edit_word"
        okText="save"
        cancelText="cancel"
        fields={
          editingWord
            ? [
                {
                  name: 'word',
                  label: 'word',
                  value: editingWord.word,
                  placeholder: 'input_word_placeholder',
                },
                {
                  name: 'meaning',
                  label: 'meaning',
                  value: editingWord.meaning,
                  placeholder: 'input_meaning_placeholder',
                },
              ]
            : []
        }
        onOk={values => {
          if (editingWord) {
            handleEditWord(editingWord.id, {
              word: values.word,
              meaning: values.meaning,
            });
          }
          setShowEditModal(false);
          setEditingWord(null);
        }}
        onCancel={() => {
          setShowEditModal(false);
          setEditingWord(null);
        }}
      />
    </div>
  );
};

export default UnitDetailPage;
