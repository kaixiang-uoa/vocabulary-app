import React, { useState } from 'react';
import { Button, Form, Input, Modal, message, Popconfirm, Checkbox, Space, Empty } from 'antd';
import { BookOutlined, PlusOutlined, DeleteOutlined, SearchOutlined, UploadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { getAllData, createUnit, deleteItems, saveAllData, updateUnit } from '../utils/wordUtils';
import UnitCard from './UnitCard';
import ImportModal from './ImportModal';
import { useTranslation } from 'react-i18next';
import { v4 as uuidv4 } from 'uuid';

const UnitList = () => {
  const { t } = useTranslation();
  const [data, setData] = useState(getAllData());
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [form] = Form.useForm();
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);
  
  // Filter units by search term
  const filteredUnits = data.units.filter(unit => 
    unit.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Refresh data from storage
  const refreshData = () => {
    setData(JSON.parse(JSON.stringify(getAllData())));
  };

  // Show create unit modal
  const showCreateModal = () => {
    setIsModalVisible(true);
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Handle create unit
  const handleCreate = () => {
    form.validateFields().then(values => {
      const result = createUnit(values.unitName);
      if (result) {
        message.success(t('unit_create_success', { name: values.unitName }));
        setIsModalVisible(false);
        form.resetFields();
        refreshData();
      } else {
        message.error(t('unit_create_fail'));
      }
    }).catch(() => {
      // Form validation failed, no extra handling needed
    });
  };
  
  // Handle select unit
  const handleSelectUnit = (unitId) => {
    setSelectedUnits(prev => {
      if (prev.includes(unitId)) {
        return prev.filter(id => id !== unitId);
      } else {
        return [...prev, unitId];
      }
    });
  };

  // Handle select all/none
  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedUnits(filteredUnits.map(unit => unit.id));
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
    const deletedCount = deleteItems({ type: 'unit', ids: selectedUnits });
    if (deletedCount === selectedUnits.length) {
      message.success(t('delete_success', { count: deletedCount }));
    } else if (deletedCount > 0) {
      message.warning(t('delete_partial', { count: deletedCount }));
    }
    setSelectedUnits([]);
    refreshData();
  };

  // Export all data as JSON
  const handleExportAll = () => {
    const data = getAllData();
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `vocabulary-backup-${new Date().toISOString().slice(0,10)}.json`);
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
  const handleImportConfirm = (parsed) => {
    if (parsed.type === 'json' || parsed.type === 'csv-units') {
      // 补全每个 word 的 id 和必需字段
      const fixedData = {
        ...parsed.data,
        units: parsed.data.units.map(unit => ({
          ...unit,
          words: (unit.words || []).map(word => ({
            ...word,
            id: uuidv4(),
            mastered: false,
            createTime: Date.now(),
            reviewTimes: 0,
            lastReviewTime: null
          }))
        }))
      };
      saveAllData(fixedData);
      setImportModalVisible(false);
      refreshData();
      message.success(t('import_success'));
    } else {
      message.error('Please use JSON or CSV with unit,word,meaning for unit import.');
    }
  };

  // 单元编辑
  const handleEditUnit = (unitId, values) => {
    updateUnit(unitId, values);
    refreshData();
  };

  // Select all/indeterminate state
  const isAllSelected = filteredUnits.length > 0 && selectedUnits.length === filteredUnits.length;
  const isIndeterminate = selectedUnits.length > 0 && selectedUnits.length < filteredUnits.length;

  return (
    <div className="unit-list" style={{ minHeight: '100%', background: 'linear-gradient(to bottom right, #f0f5ff, #e6fffb)' }}>
      <div className="container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header area - NavBar layout */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            marginBottom: '24px'
          }}>
            {/* Search bar on the left */}
            <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
              <SearchOutlined style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#bfbfbf' }} />
              <Input 
                placeholder={t('search_unit_placeholder')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  paddingLeft: '36px', 
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.8)',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)'
                }}
                allowClear
              />
            </div>
            {/* Buttons on the right */}
            <Space>
              {/* Help button */}
              <Button
                icon={<QuestionCircleOutlined />}
                style={{
                  background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                  color: '#fff',
                  borderRadius: 6,
                  border: 'none',
                  fontWeight: 500,
                  boxShadow: 'var(--shadow-sm)',
                  marginLeft: 8
                }}
                onClick={() => setHelpVisible(true)}
              >
                {t('help')}
              </Button>
              <Popconfirm
                title={t('delete_confirm_title')}
                description={t('delete_confirm_desc')}
                onConfirm={handleDeleteSelected}
                okText={t('ok')}
                cancelText={t('cancel')}
                disabled={selectedUnits.length === 0}
              >
                <Button 
                  type="primary" 
                  danger
                  icon={<DeleteOutlined />} 
                  disabled={selectedUnits.length === 0}
                  style={{
                    background: 'linear-gradient(90deg, var(--error-500) 0%, var(--error-600) 100%)',
                    color: '#fff',
                    borderRadius: 8,
                    fontWeight: 600,
                    fontSize: 15,
                    border: 'none',
                    boxShadow: 'var(--shadow-md)',
                    transition: 'all 0.2s',
                    opacity: selectedUnits.length === 0 ? 0.5 : 1
                  }}
                > 
                  {t('delete_selected')}{selectedUnits.length > 0 ? ` (${selectedUnits.length})` : ''}
                </Button>
              </Popconfirm>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showCreateModal}
                style={{ 
                  background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                  color: '#fff',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 15,
                  border: 'none',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.2s',
                }}
              >
                {t('create_unit')}
              </Button>
              <Button
                style={{
                  background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                  color: '#fff',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 15,
                  border: 'none',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.2s',
                  marginLeft: 8
                }}
                onClick={handleExportAll}
              >
                {t('export_all')}
              </Button>
              <Button
                style={{
                  background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
                  color: '#fff',
                  borderRadius: 8,
                  fontWeight: 600,
                  fontSize: 15,
                  border: 'none',
                  boxShadow: 'var(--shadow-md)',
                  transition: 'all 0.2s',
                  marginLeft: 8
                }}
                onClick={handleImportAll}
              >
                {t('import_all')}
              </Button>
            </Space>
          </div>
          {/* Select all/none, only show when data exists */}
          {filteredUnits.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: 8 }}>
              <Checkbox 
                checked={isAllSelected}
                indeterminate={isIndeterminate}
                onChange={(e) => handleSelectAll(e.target.checked)}
              >
                {t('select_all')}
              </Checkbox>
            </div>
          )}
        </div>

        {/* Create unit modal */}
        <Modal
          title={<span style={{fontSize: 22, fontWeight: 700, color: '#222'}}>{t('create_new_unit')}</span>}
          open={isModalVisible}
          onOk={handleCreate}
          onCancel={handleCancel}
          okText={<span style={{fontWeight: 600}}>{t('create')}</span>}
          cancelText={<span style={{fontWeight: 500}}>{t('cancel')}</span>}
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
          <Form form={form} layout="vertical">
            <Form.Item
              name="unitName"
              label={t('unit_name')}
              rules={[
                { required: true, message: t('input_unit_name') },
                {
                  validator: (_, value) => {
                    if (!value) return Promise.resolve();
                    const exists = data.units.some(unit => unit.name.trim() === value.trim());
                    if (exists) {
                      return Promise.reject(new Error(t('unit_name_exists')));
                    }
                    return Promise.resolve();
                  }
                }
              ]}
            >
              <Input 
                placeholder={t('input_unit_name_placeholder')} 
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Import JSON modal */}
        <ImportModal
          visible={importModalVisible}
          onOk={handleImportConfirm}
          onCancel={() => setImportModalVisible(false)}
          title={t('import_all')}
          accept=".json,.csv"
          buttonText={t('upload_file')}
          icon={<UploadOutlined />}
          placeholder={t('import_paste_tip')}
        />

        {/* Unit list content */}
        {filteredUnits.length === 0 ? (
          <Empty
            image={<BookOutlined style={{ fontSize: '64px', color: '#bfbfbf' }} />}
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
                style={{ 
                  marginTop: '16px',
                  background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)', 
                  border: 'none',
                  boxShadow: 'var(--shadow-md)'
                }}
              >
                <PlusOutlined /> {t('create_first_unit')}
              </Button>
            )}
          </Empty>
        ) : (
          <div style={{ width: '100%', display: 'flex', justifyContent: filteredUnits.length === 1 ? 'flex-start' : 'center' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
                gap: '32px',
                marginTop: 8,
                marginBottom: 8,
                alignItems: 'stretch',
                maxWidth: filteredUnits.length === 1 ? 420 : '100%',
                width: filteredUnits.length === 1 ? '100%' : '100%',
              }}
            >
              {filteredUnits.map(unit => {
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