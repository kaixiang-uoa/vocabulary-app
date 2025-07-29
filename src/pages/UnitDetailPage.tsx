import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { Title, Button, Card, Divider, message, Statistic, Row, Col, Checkbox, Space, Tag, Tabs, Popconfirm, Table } from '../components/ui';
import { ArrowLeftIcon, BookOpenIcon, CheckCircleIcon, ArrowPathIcon, PencilIcon, SpeakerWaveIcon } from '@heroicons/react/24/outline';
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
      width: '20%',
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
      width: '30%',
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
      width: '20%',
      render: (times: number) => (
        <span className="text-base text-gray-500">
          {times} {t('times')}
        </span>
      ),
    },
    {
      title: t('actions'),
      key: 'actions',
      width: '15%',
      render: (_: any, record: Word) => (
        <Space size="small">
          <Button
            type="text"
            icon={<PencilIcon className="w-4 h-4" />}
            size="small"
            onClick={() => {
              setEditingWord(record);
              setShowEditModal(true);
            }}
            className="p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded-md transition-colors duration-200"
            title={t('edit_word')}
          />
          <Button
            type="text"
            size="small"
            onClick={() => handleMasteredToggle(record.id)}
            className={`px-3 py-1 text-sm font-medium rounded-md transition-colors duration-200 ${record.mastered ? 'text-red-600 hover:text-red-800 hover:bg-red-50' : 'text-green-600 hover:text-green-800 hover:bg-green-50'}`}
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
      
      {/* Action buttons - Responsive Layout */}
      <div className="mb-6">
        {/* Large screen: horizontal layout */}
        <div className="hidden lg:flex flex-wrap gap-3">
          <Link to="/">
            <Button 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200"
              icon={<ArrowLeftIcon className="w-5 h-5" />}
            >{t('back_to_home')}</Button>
          </Link>
          <Link to={`/review/${unitId}`}>
            <Button 
              icon={<ArrowPathIcon />} 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
            >{t('start_review')}</Button>
          </Link>
          <Link to={`/spelling-review/${unitId}`}>
            <Button 
              icon={<BookOpenIcon />} 
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
            >{t('spelling_review')}</Button>
          </Link>
        </div>
        
        {/* Medium and small screen: vertical layout */}
        <div className="lg:hidden space-y-3">
          <Link to="/">
            <Button 
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors duration-200 w-full justify-center"
              icon={<ArrowLeftIcon className="w-5 h-5" />}
            >{t('back_to_home')}</Button>
          </Link>
          <div className="flex gap-2">
            <Link to={`/review/${unitId}`} className="flex-1">
              <Button 
                icon={<ArrowPathIcon />} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center w-full"
              >{t('start_review')}</Button>
            </Link>
            <Link to={`/spelling-review/${unitId}`} className="flex-1">
              <Button 
                icon={<BookOpenIcon />} 
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-lg px-4 py-2 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center w-full"
              >{t('spelling_review')}</Button>
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
      
      <div className="mb-4">
        <Divider orientation="left">
          <span className="text-xl font-semibold text-gray-800">{t('add_word')}</span>
        </Divider>
      </div>

      <AddWordForm unitId={unitId} onWordAdded={() => loadData()} onExport={handleExport} />
      
      <div className="mt-8 mb-2">
        <Divider orientation="left">
          <span className="text-xl font-semibold text-gray-800">{t('word_list')}</span>
        </Divider>
      </div>
      
      {/* First row: Tabs */}
      <div className="mb-4 py-2">
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
      
      {/* Second row: Selection and pagination controls - Unified responsive layout */}
      {filteredWords.length > 0 && (
        <>
          {/* Large screens: horizontal layout */}
          <div className="hidden lg:flex items-center justify-between mb-4" style={{ 
            padding: '16px 20px',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
            marginBottom: 20
          }}>
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
                    background: selectedWordIds.length === 0 ? '#f5f5f5' : '#fff',
                    color: selectedWordIds.length === 0 ? '#999' : '#dc2626',
                    borderRadius: 8,
                    border: selectedWordIds.length === 0 ? '2px solid #e5e7eb' : '2px solid #dc2626',
                    fontWeight: 500,
                    fontSize: 14,
                    boxShadow: selectedWordIds.length === 0 ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                    transition: 'all 0.2s',
                    opacity: selectedWordIds.length === 0 ? 0.5 : 1
                  }}
                >
                  {t('delete_selected')}{selectedWordIds.length > 0 ? ` (${selectedWordIds.length})` : ''}
                </Button>
              </Popconfirm>
            </div>

            {/* Right side: Pagination controls */}
            <div className="flex items-center gap-4 ml-0">
              <span className="text-sm text-gray-600">
                {t('page_size')}:
              </span>
              <select 
                value={pageSize} 
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
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
                style={{
                  background: currentPage === 1 ? '#f5f5f5' : '#fff',
                  color: currentPage === 1 ? '#999' : '#374151',
                  borderRadius: 8,
                  border: currentPage === 1 ? '2px solid #e5e7eb' : '2px solid #d1d5db',
                  fontWeight: 500,
                  fontSize: 14,
                  boxShadow: currentPage === 1 ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s',
                  opacity: currentPage === 1 ? 0.5 : 1
                }}
              >
                {t('prev')}
              </Button>
              <Button
                size="small"
                disabled={currentPage >= Math.ceil(filteredWords.length / pageSize)}
                onClick={() => setCurrentPage(currentPage + 1)}
                style={{
                  background: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '#f5f5f5' : '#fff',
                  color: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '#999' : '#374151',
                  borderRadius: 8,
                  border: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '2px solid #e5e7eb' : '2px solid #d1d5db',
                  fontWeight: 500,
                  fontSize: 14,
                  boxShadow: currentPage >= Math.ceil(filteredWords.length / pageSize) ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                  transition: 'all 0.2s',
                  opacity: currentPage >= Math.ceil(filteredWords.length / pageSize) ? 0.5 : 1
                }}
              >
                {t('next')}
              </Button>
            </div>
          </div>
          
          {/* Medium screens: horizontal layout */}
          <div className="hidden md:block lg:hidden mb-4" style={{ 
            padding: '16px 20px',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
            marginBottom: 20
          }}>
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
                      background: selectedWordIds.length === 0 ? '#f5f5f5' : '#fff',
                      color: selectedWordIds.length === 0 ? '#999' : '#dc2626',
                      borderRadius: 6,
                      border: selectedWordIds.length === 0 ? '1px solid #e5e7eb' : '2px solid #dc2626',
                      fontWeight: 500,
                      fontSize: 12,
                      boxShadow: selectedWordIds.length === 0 ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                      transition: 'all 0.2s',
                      opacity: selectedWordIds.length === 0 ? 0.5 : 1
                    }}
                  >
                    {t('delete_selected')}{selectedWordIds.length > 0 ? ` (${selectedWordIds.length})` : ''}
                  </Button>
                </Popconfirm>
              </div>

              {/* Right side: Pagination controls */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600">Size:</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-2 py-1 border border-gray-300 rounded text-sm"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                
                <span className="text-sm text-gray-600">
                  {currentPage}/{Math.ceil(filteredWords.length / pageSize)}
                </span>
                
                <Button
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  style={{
                    background: currentPage === 1 ? '#f5f5f5' : '#fff',
                    color: currentPage === 1 ? '#999' : '#374151',
                    borderRadius: 6,
                    border: currentPage === 1 ? '1px solid #e5e7eb' : '2px solid #d1d5db',
                    fontWeight: 500,
                    fontSize: 12,
                    boxShadow: currentPage === 1 ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  ←
                </Button>
                <Button
                  size="small"
                  disabled={currentPage >= Math.ceil(filteredWords.length / pageSize)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={{
                    background: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '#f5f5f5' : '#fff',
                    color: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '#999' : '#374151',
                    borderRadius: 6,
                    border: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '1px solid #e5e7eb' : '2px solid #d1d5db',
                    fontWeight: 500,
                    fontSize: 12,
                    boxShadow: currentPage >= Math.ceil(filteredWords.length / pageSize) ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    opacity: currentPage >= Math.ceil(filteredWords.length / pageSize) ? 0.5 : 1
                  }}
                >
                  →
                </Button>
              </div>
            </div>
          </div>
          
          {/* Small screens: mobile layout */}
          <div className="block md:hidden mb-4" style={{ 
            padding: '16px 20px',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px solid #f0f0f0',
            marginBottom: 20
          }}>
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
                      background: selectedWordIds.length === 0 ? '#f5f5f5' : '#fff',
                      color: selectedWordIds.length === 0 ? '#999' : '#dc2626',
                      borderRadius: 6,
                      border: selectedWordIds.length === 0 ? '1px solid #e5e7eb' : '2px solid #dc2626',
                      fontWeight: 500,
                      fontSize: 12,
                      boxShadow: selectedWordIds.length === 0 ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s',
                      opacity: selectedWordIds.length === 0 ? 0.5 : 1
                    }}
                  >
                    Delete ({selectedWordIds.length})
                  </Button>
                </Popconfirm>
              </div>

              {/* Right side: Pagination controls */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-600">Size:</span>
                <select 
                  value={pageSize} 
                  onChange={(e) => setPageSize(Number(e.target.value))}
                  className="px-1 py-1 border border-gray-300 rounded text-xs"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
                
                <span className="text-xs text-gray-600">
                  {currentPage}/{Math.ceil(filteredWords.length / pageSize)}
                </span>
                
                <Button
                  size="small"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                  style={{
                    background: currentPage === 1 ? '#f5f5f5' : '#fff',
                    color: currentPage === 1 ? '#999' : '#374151',
                    borderRadius: 6,
                    border: currentPage === 1 ? '1px solid #e5e7eb' : '2px solid #d1d5db',
                    fontWeight: 500,
                    fontSize: 12,
                    boxShadow: currentPage === 1 ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    opacity: currentPage === 1 ? 0.5 : 1
                  }}
                >
                  ←
                </Button>
                <Button
                  size="small"
                  disabled={currentPage >= Math.ceil(filteredWords.length / pageSize)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={{
                    background: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '#f5f5f5' : '#fff',
                    color: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '#999' : '#374151',
                    borderRadius: 6,
                    border: currentPage >= Math.ceil(filteredWords.length / pageSize) ? '1px solid #e5e7eb' : '2px solid #d1d5db',
                    fontWeight: 500,
                    fontSize: 12,
                    boxShadow: currentPage >= Math.ceil(filteredWords.length / pageSize) ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    opacity: currentPage >= Math.ceil(filteredWords.length / pageSize) ? 0.5 : 1
                  }}
                >
                  →
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
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