import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { Title, Button, Card, Divider, Empty, message, Statistic, Row, Col, Checkbox, Space, Tag, Tabs, Popconfirm, Table } from '../components/ui';
import { ArrowLeftIcon, ArrowDownTrayIcon, BookOpenIcon, CheckCircleIcon, ArrowPathIcon, PencilIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
import AddWordForm from '../components/AddWordForm';
import LanguageSwitcher from '../components/LanguageSwitcher';
import { toggleWordMastered, getAllData, deleteItems, updateWord } from '../utils/wordUtils';
import { exportUnitWordsToCSV } from '../utils/wordImportExport';
import { getUnitWords } from '../utils/wordFiltering';
import { useTranslation } from 'react-i18next';
import EditModal from '../components/EditModal';
import { Word, Unit } from '../types';
import { getTailwindClass } from '../utils/styleMapping';



const UnitDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { unitId } = useParams<{ unitId: string }>();
  const [words, setWords] = useState<Word[]>([]);
  const [unit, setUnit] = useState<Unit | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'mastered' | 'unmastered'>('all');
  const [selectedWordIds, setSelectedWordIds] = useState<string[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingWord, setEditingWord] = useState<Word | null>(null);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);


  // Filter word list
  const filteredWords = activeTab === 'all' 
    ? words 
    : activeTab === 'mastered' 
      ? words.filter(word => word.mastered) 
      : words.filter(word => !word.mastered);
  
  const loadData = useCallback(() => {
    if (!unitId) return;
    
    const allData = getAllData();
    const currentUnit = allData.units.find(u => u.id === unitId);
    setUnit(currentUnit ? JSON.parse(JSON.stringify(currentUnit)) : null);
    setWords(getUnitWords(unitId).map(w => ({ ...w })));
  }, [unitId]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleMasteredToggle = (wordId: string) => {
    if (!unitId) return;
    
    if (toggleWordMastered(unitId, wordId)) {
      loadData();
    }
  };
  
  const handleExport = () => {
    if (!unitId) return;
    
    const csvContent = exportUnitWordsToCSV(unitId);
    
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
  const handleDeleteWords = () => {
    if (!unitId) return;
    
    const success = deleteItems({ type: 'word', ids: selectedWordIds, unitId });
    if (success) {
      message.success(t('delete_success', { count: selectedWordIds.length }));
      setSelectedWordIds([]);
      loadData();
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
  
  const isAllSelected = filteredWords.length > 0 && selectedWordIds.length === filteredWords.length;
  const isIndeterminate = selectedWordIds.length > 0 && selectedWordIds.length < filteredWords.length;
  
  // Calculate statistics
  const totalWords = words.length;
  const masteredWords = words.filter(word => word.mastered).length;
  const masteryRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;
  
  // Calculate paginated data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedWords = filteredWords.slice(startIndex, endIndex);

  // Reset to first page when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Word editing
  const handleEditWord = (wordId: string, values: { word: string; meaning: string }) => {
    if (!unitId) return;
    
    updateWord(unitId, wordId, values);
    loadData();
  };

  // Play pronunciation
  const playPronunciation = (word: string) => {
    try {
      const url = `https://dict.youdao.com/dictvoice?audio=${encodeURIComponent(word)}&type=2`;
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
      console.warn('playPronunciation error for word:', word, error);
      // Don't throw error, just log it
    }
  };

  // Table columns
  const columns = [
    {
      title: t('word'),
      dataIndex: 'word',
      key: 'word',
      width: '25%',
      render: (text: string, record: Word) => (
        <Space>
          <span className="text-base font-semibold">{text}</span>
          <Button
            type="text"
            icon={<SpeakerWaveIcon />}
            size="small"
            onClick={() => playPronunciation(text)}
            className="p-1 text-gray-500 hover:text-gray-700"
          />
        </Space>
      ),
    },
    {
      title: t('meaning'),
      dataIndex: 'meaning',
      key: 'meaning',
      width: '35%',
      render: (text: string) => (
        <span className="text-base text-gray-600">{text}</span>
      ),
    },
    {
      title: t('status'),
      dataIndex: 'mastered',
      key: 'mastered',
      width: '15%',
      render: (mastered: boolean, record: Word) => (
        <Space>
          {mastered ? (
            <Tag color="success" icon={<CheckCircleIcon />}>
              {t('mastered')}
            </Tag>
          ) : (
            <Tag color="processing" icon={<ArrowPathIcon />}>
              {t('unmastered')}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: t('times'),
      dataIndex: 'reviewTimes',
      key: 'reviewTimes',
      width: '15%',
      render: (times: number) => (
        <span className="text-base text-gray-500">
          {times} {t('times')}
        </span>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: '10%',
      render: (_: any, record: Word) => (
        <Space>
          <Button
            type="text"
            icon={<PencilIcon />}
            size="small"
            onClick={() => {
              setEditingWord(record);
              setShowEditModal(true);
            }}
            className="p-1 text-gray-500 hover:text-gray-700"
          />
          <Button
            type="text"
            size="small"
            onClick={() => handleMasteredToggle(record.id)}
            className={`px-2 py-1 text-sm ${record.mastered ? 'text-red-500 hover:text-red-700' : 'text-green-500 hover:text-green-700'}`}
          >
            {record.mastered ? t('mark_unmastered') : t('mark_mastered')}
          </Button>
        </Space>
      ),
    },
  ];
  
  if (!unit) {
    return <div className="flex items-center justify-center h-64 text-lg text-gray-600">{t('loading')}</div>;
  }
  
  return (
    <div className={getTailwindClass('unit-detail-page')}>
      {/* Header with title and language switcher */}
      <div className={getTailwindClass('page-header')}>
        <Title level={2} className={getTailwindClass('page-title')}>{unit.name}</Title>
        <LanguageSwitcher className="flex items-center gap-2" />
      </div>
      
      {/* Action buttons */}
      <div className={`${getTailwindClass('control-panel-left')} mb-6`}>
        <Link to="/">
          <Button 
            className={`${getTailwindClass('btn-secondary')} ${getTailwindClass('btn-standard')} flex items-center gap-2`}
            icon={<ArrowLeftIcon className="w-5 h-5" />}
          >{t('back_to_home')}</Button>
        </Link>
        <Button 
          className={`${getTailwindClass('btn-danger')} ${getTailwindClass('btn-standard')}`}
          icon={<ArrowDownTrayIcon />} 
          onClick={handleExport}
        >{t('export_words')}</Button>
        <Link to={`/review/${unitId}`}>
          <Button 
            type="primary" 
            icon={<ArrowPathIcon />} 
            className={`${getTailwindClass('btn-primary')} ${getTailwindClass('btn-standard')}`}
          >{t('start_review')}</Button>
        </Link>
        <Link to={`/spelling-review/${unitId}`}>
          <Button 
            type="primary" 
            icon={<BookOpenIcon />} 
            className={`${getTailwindClass('btn-success')} ${getTailwindClass('btn-standard')}`}
          >{t('spelling_review')}</Button>
        </Link>
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
          <Card className={`${getTailwindClass('stats-card')} ${getTailwindClass('stats-card.mastered')}`}>
            <Statistic
              title={t('mastered')}
              value={masteredWords}
              prefix={<CheckCircleIcon />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card className={`${getTailwindClass('stats-card')} ${masteryRate > 80 ? 'border-green-500 bg-gradient-to-br from-green-50 to-blue-50' : masteryRate > 50 ? 'border-yellow-500 bg-gradient-to-br from-yellow-50 to-orange-50' : 'border-red-500 bg-gradient-to-br from-red-50 to-orange-50'}`}>
            <Statistic
              title={t('mastery_rate')}
              value={masteryRate}
              suffix="%"
              prefix={<ArrowPathIcon />}
              valueStyle={{ color: masteryRate > 80 ? '#3f8600' : masteryRate > 50 ? '#faad14' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Divider orientation="left">{t('add_word')}</Divider>
      <AddWordForm unitId={unitId} onWordAdded={() => loadData()} />
      
      <Divider orientation="left">{t('word_list')}</Divider>
      
            {/* First row: Tabs */}
      <div className="mb-6">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { setActiveTab(key as 'all' | 'mastered' | 'unmastered'); setSelectedWordIds([]); }}
          items={[
            { key: 'all', label: `${t('all')} (${words.length})` },
            { key: 'mastered', label: `${t('mastered')} (${words.filter(word => word.mastered).length})` },
            { key: 'unmastered', label: `${t('unmastered')} (${words.filter(word => !word.mastered).length})` },
          ]}
        />
      </div>
      
      {/* Second row: Selection and pagination controls */}
      <div className="flex items-center justify-between mb-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        {/* Left side: Selection controls */}
        <div className="flex items-center gap-3">
          {filteredWords.length > 0 && (
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={handleSelectAll}
              className="text-sm font-medium"
            >
              {t('select_all')}
            </Checkbox>
          )}
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
              className={`${getTailwindClass('btn-danger')} ${getTailwindClass('btn-standard')} text-sm px-3 py-1 h-8 ${selectedWordIds.length === 0 ? 'opacity-50' : ''}`}
            >
              {t('delete_selected')}{selectedWordIds.length > 0 ? ` (${selectedWordIds.length})` : ''}
            </Button>
          </Popconfirm>
        </div>
        
        {/* Right side: Pagination controls */}
        <div className="flex items-center gap-3">
          <span className="text-sm text-gray-600">
            {t('page_size')}:
          </span>
          <select 
            value={pageSize} 
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="text-sm border border-gray-300 rounded px-2 py-1 h-8"
          >
            <option value={10}>10</option>
            <option value={20}>20</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
          
          <span className="text-sm text-gray-600">
            {t('page')} {currentPage} / {Math.ceil(filteredWords.length / pageSize)}
          </span>
          
          <Button
            size="small"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="text-sm font-medium px-3 py-1 h-8"
            style={{
              background: currentPage === 1 
                ? '#f5f5f5' 
                : 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: currentPage === 1 ? '#999' : '#fff',
              borderRadius: 6,
              border: 'none',
              fontWeight: 500,
              boxShadow: currentPage === 1 ? 'none' : 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            {t('prev')}
          </Button>
          <Button
            size="small"
            disabled={currentPage >= Math.ceil(filteredWords.length / pageSize)}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="text-sm font-medium px-3 py-1 h-8"
            style={{
              background: currentPage >= Math.ceil(filteredWords.length / pageSize)
                ? '#f5f5f5' 
                : 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '#999' : '#fff',
              borderRadius: 6,
              border: 'none',
              fontWeight: 500,
              boxShadow: currentPage >= Math.ceil(filteredWords.length / pageSize) ? 'none' : 'var(--shadow-sm)',
              transition: 'all 0.2s'
            }}
          >
            {t('next')}
          </Button>
        </div>
      </div>
      {paginatedWords.length > 0 ? (
        <Table
          dataSource={paginatedWords}
          columns={columns}
          rowKey="id"
          pagination={false}
          rowSelection={{
            selectedRowKeys: selectedWordIds,
            onChange: (newSelectedRowKeys) => {
              setSelectedWordIds(newSelectedRowKeys as string[]);
            },
            onSelect: (record, selected) => {
              if (selected) {
                setSelectedWordIds(prev => [...prev, record.id]);
              } else {
                setSelectedWordIds(prev => prev.filter(id => id !== record.id));
              }
            },
            onSelectAll: (selected, selectedRows, changeRows) => {
              if (selected) {
                setSelectedWordIds(paginatedWords.map(word => word.id));
              } else {
                setSelectedWordIds([]);
              }
            },
          }}
        />
      ) : (
        <Empty description={t('no_words_in_unit')} />
      )}
      
      {/* Edit Modal */}
      <EditModal
        visible={showEditModal}
        title="edit_word"
        okText="save"
        cancelText="cancel"
        fields={editingWord ? [
          { name: 'word', label: 'word', value: editingWord.word, placeholder: 'input_word_placeholder' },
          { name: 'meaning', label: 'meaning', value: editingWord.meaning, placeholder: 'input_meaning_placeholder' },
        ] : []}
        onOk={(values) => { 
          if (editingWord) {
            handleEditWord(editingWord.id, { word: values.word, meaning: values.meaning });
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