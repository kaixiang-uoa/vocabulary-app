import React, { useState } from 'react';
import { Button, Input, Modal, message, Checkbox, Space, Empty, Popconfirm } from '../components/ui';
import { BookOpenIcon, PlusIcon, TrashIcon, MagnifyingGlassIcon, ArrowUpTrayIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { getAllData, createUnit, deleteItems, updateUnit } from '../utils/wordUtils';
import { addWordsInBatch, importCompleteData, importUnitData } from '../utils/wordImportExport';
import UnitCard from './UnitCard';
import ImportModal from './ImportModal';
import { useTranslation } from 'react-i18next';
import { StorageData, ImportWordData, ImportUnitData, ImportCompleteData, ImportData, FormValues } from '../types';



const UnitList: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<StorageData>(getAllData());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<FormValues>({ unitName: '' });
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter units by search term
  const filteredUnits = data.units.filter(unit =>
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate paginated data
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

  // Reset to first page when search changes
  React.useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Debug effect to monitor data changes - removed to prevent console spam

  // Refresh data from storage
  const refreshData = () => {
    const newData = getAllData();
    console.log('refreshData - newData.units.length:', newData.units.length);
    setData(newData);
  };

  // Show create unit modal
  const showCreateModal = () => {
    setIsModalVisible(true);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    setFormData({ unitName: '' });
  };

  // Handle create unit
  const handleCreate = () => {
    if (!formData.unitName.trim()) {
      message.error(t('input_unit_name'));
      return;
    }
    
    const exists = data.units.some(unit => unit.name.trim() === formData.unitName.trim());
    if (exists) {
      message.error(t('unit_name_exists'));
      return;
    }
    
    const result = createUnit(formData.unitName);
    if (result) {
      message.success(t('unit_create_success', { name: formData.unitName }));
      setIsModalVisible(false);
      setFormData({ unitName: '' });
      refreshData();
    } else {
      message.error(t('unit_create_fail'));
    }
  };

  // Handle select unit
  const handleSelectUnit = (unitId: string) => {
    setSelectedUnits(prev => {
      if (prev.includes(unitId)) {
        return prev.filter(id => id !== unitId);
      } else {
        return [...prev, unitId];
      }
    });
  };

  // Handle select all/none
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUnits(paginatedUnits.map(unit => unit.id));
    } else {
      setSelectedUnits([]);
    }
  };

  // Handle delete selected units
  const handleDeleteSelected = () => {
    if (selectedUnits.length === 0) {
      message.warning(t('select_unit_to_delete'));
      return;
    }
    
    console.log('Before delete - selectedUnits:', selectedUnits);
    console.log('Before delete - data.units.length:', data.units.length);
    
    const success = deleteItems({ type: 'unit', ids: selectedUnits });
    
    console.log('Delete success:', success);
    
    if (success) {
      message.success(t('delete_success', { count: selectedUnits.length }));
      setSelectedUnits([]);
      refreshData();
    } else {
      message.error(t('delete_fail'));
    }
  };

  // Export all data as JSON
  const handleExportAll = () => {
    const data = getAllData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vocabulary-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    message.success(t('export_success'));
  };

  // Show import modal
  const handleImportAll = () => {
    setImportModalVisible(true);
  };

  // Handle import confirm (now supports multiple formats)
  const handleImportConfirm = (parsed: ImportData) => {
    let success = false;
    let messageText = '';
    
    if (Array.isArray(parsed)) {
      if (parsed.length === 0) {
        message.error(t('import_empty_error'));
        return;
      }
      
      // Check if it's unit data (has unit property)
      if ('unit' in parsed[0]) {
        // Unit CSV format: unit,word,meaning
        success = importUnitData(parsed as ImportUnitData[]);
        const unitCount = new Set((parsed as ImportUnitData[]).map(item => item.unit)).size;
        const wordCount = parsed.length;
        messageText = success ? 
          t('import_success', { count: wordCount, unitName: `${unitCount} units` }) : 
          t('import_fail');
      } else {
        // Word array format: create a new unit
        const unitName = `Imported Unit ${new Date().toLocaleDateString()}`;
        const unitId = createUnit(unitName);
        success = addWordsInBatch(unitId, parsed as ImportWordData[]);
        messageText = success ? 
          t('import_success', { count: parsed.length, unitName }) : 
          t('import_fail');
      }
    } else if (parsed && 'units' in parsed) {
      // Complete JSON structure
      success = importCompleteData(parsed as ImportCompleteData);
      const unitCount = (parsed as ImportCompleteData).units.length;
      const wordCount = (parsed as ImportCompleteData).units.reduce((total, unit) => total + unit.words.length, 0);
      messageText = success ? 
        t('import_success', { count: wordCount, unitName: `${unitCount} units` }) : 
        t('import_fail');
    } else {
      message.error(t('import_parse_error'));
      return;
    }
    
    if (success) {
      message.success(messageText);
      setImportModalVisible(false);
      refreshData();
    } else {
      message.error(messageText);
    }
  };

  // Unit editing
  const handleEditUnit = (unitId: string, values: { name: string }) => {
    updateUnit(unitId, values);
    refreshData();
  };

  // Select all/indeterminate state
  const isAllSelected = paginatedUnits.length > 0 && selectedUnits.length === paginatedUnits.length;
  const isIndeterminate = selectedUnits.length > 0 && selectedUnits.length < paginatedUnits.length;

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto">
        
        {/* First row: Search and action buttons */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          marginBottom: 16,
          marginTop: 16,
          marginLeft: 16,
          marginRight: 16,
          flexWrap: 'wrap',
          gap: 12
        }}>
          {/* Search input on the left */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <Input
              placeholder={t('search_unit_placeholder')}
              inputPrefix={<MagnifyingGlassIcon style={{ color: '#bfbfbf' }} />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                borderRadius: 8,
                border: '1px solid #e8e8e8',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
              }}
              allowClear
            />
          </div>
          
          {/* Action buttons on the right */}
          <Space wrap>
            {/* Help button */}
            <Button
              icon={<QuestionMarkCircleIcon />}
              style={{
                background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                color: '#fff',
                borderRadius: 6,
                border: 'none',
                fontWeight: 500,
                boxShadow: 'var(--shadow-sm)'
              }}
              onClick={() => setHelpVisible(true)}
            >
              {t('help')}
            </Button>
            <Button
              type="primary"
              icon={<PlusIcon />}
              onClick={showCreateModal}
              style={{
                background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                color: '#fff',
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 14,
                border: 'none',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
              }}
            >
              {t('create_unit')}
            </Button>
            <Button
              style={{
                background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                color: '#fff',
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 14,
                border: 'none',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
              }}
              onClick={handleExportAll}
            >
              {t('export_all')}
            </Button>
            <Button
              style={{
                background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                color: '#fff',
                borderRadius: 6,
                fontWeight: 500,
                fontSize: 14,
                border: 'none',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.2s',
              }}
              onClick={handleImportAll}
            >
              {t('import_all')}
            </Button>
          </Space>
        </div>
        
        {/* Second row: Selection and pagination controls */}
        {filteredUnits.length > 0 && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between', 
            marginBottom: 16,
            marginLeft: 16,
            marginRight: 16,
            padding: '12px 16px',
            background: '#fafafa',
            borderRadius: 8,
            border: '1px solid #f0f0f0'
          }}>
            {/* Left side: Selection controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Checkbox
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={handleSelectAll}
              >
                {t('select_all')}
              </Checkbox>
              <Popconfirm
                title={t('delete_confirm_title')}
                description={t('delete_confirm_desc')}
                onConfirm={handleDeleteSelected}
                okText={t('ok')}
                cancelText={t('cancel')}
                trigger="click"
              >
                <Button
                  type="primary"
                  danger
                  icon={<TrashIcon />}
                  disabled={selectedUnits.length === 0}
                  style={{
                    background: 'linear-gradient(90deg, var(--error-500) 0%, var(--error-600) 100%)',
                    color: '#fff',
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: 14,
                    border: 'none',
                    boxShadow: 'var(--shadow-sm)',
                    transition: 'all 0.2s',
                    opacity: selectedUnits.length === 0 ? 0.5 : 1
                  }}
                >
                  {t('delete_selected')}{selectedUnits.length > 0 ? ` (${selectedUnits.length})` : ''}
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
                <option value={6}>6</option>
                <option value={12}>12</option>
                <option value={24}>24</option>
                <option value={48}>48</option>
              </select>
              
              <span className="text-sm text-gray-600">
                {t('page')} {currentPage} / {Math.ceil(filteredUnits.length / pageSize)}
              </span>
              
              <Button
                size="small"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(currentPage - 1)}
              >
                {t('prev')}
              </Button>
              <Button
                size="small"
                disabled={currentPage >= Math.ceil(filteredUnits.length / pageSize)}
                onClick={() => setCurrentPage(currentPage + 1)}
              >
                {t('next')}
              </Button>
            </div>
          </div>
        )}

        {/* Create unit modal */}
        <Modal
          title={<span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>{t('create_new_unit')}</span>}
          open={isModalVisible}
          onOk={handleCreate}
          onCancel={handleCancel}
          okText={<span style={{ fontWeight: 600 }}>{t('create')}</span>}
          cancelText={<span style={{ fontWeight: 500 }}>{t('cancel')}</span>}
          okButtonProps={{
            style: {
              background: 'linear-gradient(90deg, #7fbcff 0%, #a084ee 100%)',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              border: 'none',
              boxShadow: '0 1px 6px rgba(127,188,255,0.10)',
              transition: 'all 0.2s',
            }
          }}
          cancelButtonProps={{
            style: {
              background: '#f5f5f5',
              color: '#444',
              borderRadius: 8,
              fontWeight: 500,
              fontSize: 15,
              border: 'none',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
              transition: 'all 0.2s',
            }
          }}
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('unit_name')}
              </label>
              <Input
                placeholder={t('input_unit_name_placeholder')}
                value={formData.unitName}
                onChange={(e) => setFormData({ unitName: e.target.value })}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
          </div>
        </Modal>

        {/* Import JSON modal */}
        <ImportModal
          visible={importModalVisible}
          onOk={handleImportConfirm}
          onCancel={() => setImportModalVisible(false)}
          title={t('import_all')}
          accept=".json,.csv"
          buttonText={t('upload_file')}
          icon={<ArrowUpTrayIcon />}
          placeholder={t('import_paste_tip')}
        />

        {/* Unit list content */}
        {filteredUnits.length === 0 ? (
          <Empty
            image={<BookOpenIcon style={{ fontSize: '64px', color: '#bfbfbf' }} />}
            styles={{ image: { height: 80 } }}
            description={
              <span style={{ color: '#666' }}>
                {searchTerm ? t('no_unit_found') : t('no_unit_create_tip')}
              </span>
            }
          >
            {!searchTerm && (
              <Button
                type="primary"
                onClick={showCreateModal}
                className="mt-6 px-8 py-4 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  color: 'white'
                }}
              >
                <PlusIcon className="w-6 h-6 mr-3" />
                {t('create_first_unit')}
              </Button>
            )}
          </Empty>
        ) : (
          <div style={{ width: '100%', display: 'flex', justifyContent: filteredUnits.length === 1 ? 'flex-start' : 'center' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
                gap: '40px',
                marginTop: 16,
                marginBottom: 16,
                marginLeft: 16,
                marginRight: 16,
                alignItems: 'stretch',
                maxWidth: filteredUnits.length === 1 ? 480 : '100%',
                width: filteredUnits.length === 1 ? '100%' : '100%',
              }}
            >
              {paginatedUnits.map(unit => {
                const isSelected = selectedUnits.includes(unit.id);
                return (
                  <UnitCard
                    key={unit.id}
                    unit={unit}
                    isSelected={isSelected}
                    onSelect={handleSelectUnit}
                    onEdit={handleEditUnit}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Help Modal */}
      <Modal
        open={helpVisible}
        title={t('help_title')}
        onCancel={() => setHelpVisible(false)}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <b>{t('help_json_title')}</b>
          <div style={{ color: '#666', fontSize: 14, margin: '8px 0' }}>{t('help_json_desc')}</div>
          <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 6, fontSize: 13 }}>
            {`{
  "units": [
    {
      "id": 1,
      "name": "Unit 1",
      "words": [
        { "word": "apple", "meaning": "苹果" }
      ]
    }
  ]
}`}
          </pre>
        </div>
        <div style={{ marginBottom: 16 }}>
          <b>{t('help_csv_title')}</b>
          <div style={{ color: '#666', fontSize: 14, margin: '8px 0' }}>{t('help_csv_desc')}</div>
          <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 6, fontSize: 13 }}>
            {`unit,word,meaning
Unit 1,apple,苹果
Unit 1,banana,香蕉
Unit 2,cat,猫`}
          </pre>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={() => setHelpVisible(false)}>{t('help_close')}</Button>
        </div>
      </Modal>
    </div>
  );
};

export default UnitList; 