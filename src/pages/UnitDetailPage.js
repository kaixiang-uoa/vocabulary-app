import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router';
import { Typography, Button, List, Card, Divider, Empty, message, Tabs, Statistic, Row, Col, Checkbox, Popconfirm } from 'antd';
import { ArrowLeftOutlined, ExportOutlined, BookOutlined, CheckCircleOutlined, SyncOutlined } from '@ant-design/icons';
import AddWordForm from '../components/AddWordForm';
import { getUnitWords, toggleWordMastered, exportUnitWordsToCSV, getAllData, deleteItems } from '../utils/wordUtils';
import { useTranslation } from 'react-i18next';
import WordCard from '../components/WordCard';

const { Title } = Typography;

const UnitDetailPage = () => {
  const { t } = useTranslation();
  const { unitId } = useParams();
  const [words, setWords] = useState([]);
  const [unit, setUnit] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [selectedWordIds, setSelectedWordIds] = useState([]);

  // filter word list (declare in advance)
  const filteredWords = activeTab === 'all' 
    ? words 
    : activeTab === 'mastered' 
      ? words.filter(word => word.mastered) 
      : words.filter(word => !word.mastered);
  
  const loadData = useCallback(() => {
    const numericUnitId = parseInt(unitId, 10);
    const allData = getAllData();
    const currentUnit = allData.units.find(u => u.id === numericUnitId);
    setUnit(currentUnit);
    setWords(getUnitWords(numericUnitId));
  }, [unitId]);
  
  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleMasteredToggle = (wordId) => {
    const numericUnitId = parseInt(unitId, 10);
    if (toggleWordMastered(numericUnitId, wordId)) {
      loadData();
    }
  };
  
  const handleExport = () => {
    const numericUnitId = parseInt(unitId, 10);
    const csvContent = exportUnitWordsToCSV(numericUnitId);
    
    if (!csvContent) {
      message.error(t('no_words_to_export'));
      return;
    }
    
    // create download link
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
  
  // delete words (batch)
  const handleDeleteWords = () => {
    const numericUnitId = parseInt(unitId, 10);
    const deletedCount = deleteItems({ type: 'word', ids: selectedWordIds, unitId: numericUnitId });
    if (deletedCount > 0) {
      message.success(t('delete_success', { count: deletedCount }));
      setSelectedWordIds([]);
      loadData();
    } else {
      message.error(t('delete_fail'));
    }
  };

  // single select
  const handleSelectWord = (wordId) => {
    setSelectedWordIds(prev => prev.includes(wordId) ? prev.filter(id => id !== wordId) : [...prev, wordId]);
  };
  // select all/cancel all
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedWordIds(filteredWords.map(word => word.id));
    } else {
      setSelectedWordIds([]);
    }
  };
  const isAllSelected = filteredWords.length > 0 && selectedWordIds.length === filteredWords.length;
  const isIndeterminate = selectedWordIds.length > 0 && selectedWordIds.length < filteredWords.length;
  
  // calculate statistics
  const totalWords = words.length;
  const masteredWords = words.filter(word => word.mastered).length;
  const masteryRate = totalWords > 0 ? Math.round((masteredWords / totalWords) * 100) : 0;
  
  if (!unit) {
    return <div>{t('loading')}</div>;
  }
  
  return (
    <div className="unit-detail-page">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
        <Link to="/">
          <Button 
            style={{ 
              background: 'var(--neutral-100)', 
              color: 'var(--neutral-700)', 
              borderRadius: 8, 
              border: 'none',
              fontWeight: 500,
              boxShadow: 'var(--shadow-sm)',
              transition: 'all 0.2s',
            }}
            icon={<ArrowLeftOutlined />}
          >{t('back_to_home')}</Button>
        </Link>
        <Button 
          style={{ 
            marginLeft: 0, 
            background: 'linear-gradient(90deg, var(--error-500) 0%, var(--error-600) 100%)',
            color: '#fff',
            borderRadius: 8,
            border: 'none',
            fontWeight: 500,
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s',
          }} 
          icon={<ExportOutlined />} 
          onClick={handleExport}
        >{t('export_words')}</Button>
        <Link to={`/review/${unitId}`} style={{ marginLeft: 0 }}>
          <Button 
            type="primary" 
            icon={<SyncOutlined />} 
            style={{
              background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              border: 'none',
              borderRadius: 8,
              fontWeight: 600,
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s',
            }}
          >{t('start_review')}</Button>
        </Link>
      </div>
      
      <Title level={2}>{unit.name}</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('total_words')}
              value={totalWords}
              prefix={<BookOutlined />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('mastered')}
              value={masteredWords}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic
              title={t('mastery_rate')}
              value={masteryRate}
              suffix="%"
              prefix={<SyncOutlined />}
              valueStyle={{ color: masteryRate > 80 ? '#3f8600' : masteryRate > 50 ? '#faad14' : '#cf1322' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Divider orientation="left">{t('add_word')}</Divider>
      <AddWordForm unitId={parseInt(unitId, 10)} onWordAdded={loadData} />
      
      <Divider orientation="left">{t('word_list')}</Divider>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
        <Tabs
          activeKey={activeTab}
          onChange={key => { setActiveTab(key); setSelectedWordIds([]); }}
          items={[
            { key: 'all', label: `${t('all')} (${words.length})` },
            { key: 'mastered', label: `${t('mastered')} (${words.filter(word => word.mastered).length})` },
            { key: 'unmastered', label: `${t('unmastered')} (${words.filter(word => !word.mastered).length})` },
          ]}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {filteredWords.length > 0 && (
            <Checkbox
              checked={isAllSelected}
              indeterminate={isIndeterminate}
              onChange={e => handleSelectAll(e.target.checked)}
              style={{ marginRight: 8 }}
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
            disabled={selectedWordIds.length === 0}
          >
            <Button
              type="primary"
              danger
              disabled={selectedWordIds.length === 0}
              style={{
                background: 'linear-gradient(90deg, var(--error-500) 0%, var(--error-600) 100%)',
                color: '#fff',
                borderRadius: 8,
                fontWeight: 600,
                fontSize: 15,
                border: 'none',
                boxShadow: 'var(--shadow-md)',
                transition: 'all 0.2s',
                opacity: selectedWordIds.length === 0 ? 0.5 : 1
              }}
            >
              {t('delete_selected')}{selectedWordIds.length > 0 ? ` (${selectedWordIds.length})` : ''}
            </Button>
          </Popconfirm>
        </div>
      </div>
      {filteredWords.length > 0 ? (
        <List
          grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
          dataSource={filteredWords}
          renderItem={word => (
            <List.Item>
              <WordCard
                word={word}
                isSelected={selectedWordIds.includes(word.id)}
                onSelect={handleSelectWord}
                onMasteredToggle={handleMasteredToggle}
              />
            </List.Item>
          )}
        />
      ) : (
        <Empty description={t('no_words_in_unit')} />
      )}
    </div>
  );
};

export default UnitDetailPage;