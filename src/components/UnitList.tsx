import React, { useState, useEffect } from 'react';
import { Button, Input, Checkbox, Popconfirm, Modal, message } from '../components/ui';
import { useTranslation } from 'react-i18next';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  ArrowUpTrayIcon, 
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import UnitCard from './UnitCard';
import ImportModal from './ImportModal';
import { getAllData, updateUnit, deleteItems } from '../utils/wordUtils';
import { ImportData } from '../types/index';

const UnitList: React.FC = () => {
  const { t } = useTranslation();
  const [units, setUnits] = useState<any[]>([]);
  const [filteredUnits, setFilteredUnits] = useState<any[]>([]);
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState(6);
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isImportModalVisible, setIsImportModalVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  // Load data on component mount
  useEffect(() => {
    refreshData();
  }, []);

  // Filter units based on search term
  useEffect(() => {
    const filtered = units.filter(unit =>
      unit.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredUnits(filtered);
    setCurrentPage(1); // Reset to first page when searching
  }, [units, searchTerm]);

  const refreshData = () => {
    const data = getAllData();
    setUnits(data.units || []);
  };

  const showCreateModal = () => {
    setIsModalVisible(true);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };

  const handleCreate = () => {
    setIsModalVisible(false);
    refreshData();
  };

  const handleSelectUnit = (unitId: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitId) 
        ? prev.filter(id => id !== unitId)
        : [...prev, unitId]
    );
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedUnits(paginatedUnits.map(unit => unit.id));
    } else {
      setSelectedUnits([]);
    }
  };

  const handleDeleteSelected = () => {
    if (selectedUnits.length === 0) return;
    
    deleteItems({ type: 'unit', ids: selectedUnits });
    setSelectedUnits([]);
    refreshData();
    message.success(t('delete_success'));
  };

  const handleExportAll = () => {
    try {
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
    } catch (error) {
      message.error(t('export_error'));
    }
  };

  const handleImportAll = () => {
    setIsImportModalVisible(true);
  };

  const handleImportConfirm = (parsed: ImportData) => {
    // Handle import logic here
    setIsImportModalVisible(false);
    refreshData();
    message.success(t('import_success'));
  };

  const handleEditUnit = (unitId: string, values: string) => {
    updateUnit(unitId, { name: values });
    refreshData();
  };

  // Pagination
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedUnits = filteredUnits.slice(startIndex, endIndex);

  // Select all/indeterminate state
  const isAllSelected = paginatedUnits.length > 0 && selectedUnits.length === paginatedUnits.length;
  const isIndeterminate = selectedUnits.length > 0 && selectedUnits.length < paginatedUnits.length;

  return (
    <div className="min-h-full">
      <div className="max-w-7xl mx-auto">
        
        {/* Search and action buttons - responsive layout */}
        <div style={{ padding: '20px' }}>
          {/* Large screens: horizontal layout */}
          <div className="hidden lg:flex items-center justify-between mb-4">
            <div className="flex-1 max-w-md">
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input
                  placeholder={t('search_unit_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  style={{ 
                    paddingLeft: '48px', 
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    fontSize: '16px'
                  }}
                  allowClear
                />
              </div>
            </div>
            
            <div className="flex gap-3 ml-6">
              <Button
                icon={<QuestionMarkCircleIcon />}
                onClick={() => setHelpVisible(true)}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
              >
                {t('help')}
              </Button>
              <Button
                icon={<PlusIcon />}
                onClick={showCreateModal}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
              >
                {t('create_unit')}
              </Button>
              <Button
                icon={<ArrowUpTrayIcon />}
                onClick={handleExportAll}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
              >
                {t('export_all')}
              </Button>
              <Button
                icon={<ArrowUpTrayIcon />}
                onClick={handleImportAll}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
              >
                {t('import_all')}
              </Button>
            </div>
          </div>
          
          {/* Medium screens: vertical layout */}
          <div className="hidden md:block lg:hidden">
            <div style={{ marginBottom: 16 }}>
              <div className="relative max-w-full">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                <Input
                  placeholder={t('search_unit_placeholder')}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full"
                  style={{ 
                    paddingLeft: '48px', 
                    paddingRight: '16px',
                    paddingTop: '14px',
                    paddingBottom: '14px',
                    fontSize: '16px'
                  }}
                  allowClear
                />
              </div>
            </div>
            
            <div style={{ marginBottom: 20, display: 'flex', justifyContent: 'center' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <Button
                  icon={<QuestionMarkCircleIcon />}
                  onClick={() => setHelpVisible(true)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
                >
                  {t('help')}
                </Button>
                <Button
                  icon={<PlusIcon />}
                  onClick={showCreateModal}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
                >
                  {t('create_unit')}
                </Button>
                <Button
                  icon={<ArrowUpTrayIcon />}
                  onClick={handleExportAll}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
                >
                  {t('export_all')}
                </Button>
                <Button
                  icon={<ArrowUpTrayIcon />}
                  onClick={handleImportAll}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
                >
                  {t('import_all')}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Small screens: mobile layout */}
          <div className="block md:hidden">
            <div className="space-y-4 mb-4 px-4">
              {/* Search bar */}
              <div className="w-full">
                <div className="relative max-w-full">
                  <MagnifyingGlassIcon className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
                  <Input
                    placeholder={t('search_unit_placeholder')}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full"
                    style={{ 
                      paddingLeft: '48px', 
                      paddingRight: '16px',
                      paddingTop: '14px',
                      paddingBottom: '14px',
                      fontSize: '16px'
                    }}
                    allowClear
                  />
                </div>
              </div>

              {/* Action buttons - 2x2 grid layout */}
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
                  icon={<QuestionMarkCircleIcon />}
                  onClick={() => setHelpVisible(true)}
                >
                  {t('help')}
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
                  icon={<PlusIcon />}
                  onClick={showCreateModal}
                >
                  {t('create_unit')}
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
                  icon={<ArrowUpTrayIcon />}
                  onClick={handleExportAll}
                >
                  {t('export_all')}
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold transition-all duration-200 rounded-xl px-6 py-4 text-base shadow-md hover:shadow-lg hover:transform hover:-translate-y-0.5 justify-center"
                  icon={<ArrowUpTrayIcon />}
                  onClick={handleImportAll}
                >
                  {t('import_all')}
                </Button>
              </div>


                            </div>
          </div>
        </div>
        
        {/* Selection and pagination controls - unified responsive layout */}
        {filteredUnits.length > 0 && (
          <>
            {/* Large screens: horizontal layout */}
            <div className="hidden lg:flex items-center justify-between mb-4" style={{ 
              padding: '16px 20px',
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              marginBottom: 20,
              marginLeft: 20,
              marginRight: 20
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
                  onConfirm={handleDeleteSelected}
                  okText={t('ok')}
                  cancelText={t('cancel')}
                  trigger="click"
                >
                  <Button
                    type="primary"
                    danger
                    disabled={selectedUnits.length === 0}
                    style={{
                      background: selectedUnits.length === 0 ? '#f5f5f5' : '#fff',
                      color: selectedUnits.length === 0 ? '#999' : '#dc2626',
                      borderRadius: 8,
                      border: selectedUnits.length === 0 ? '2px solid #e5e7eb' : '2px solid #dc2626',
                      fontWeight: 500,
                      fontSize: 14,
                      boxShadow: selectedUnits.length === 0 ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
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
                  {t('prev')}
                </Button>
                <Button
                  size="small"
                  disabled={currentPage >= Math.ceil(filteredUnits.length / pageSize)}
                  onClick={() => setCurrentPage(currentPage + 1)}
                  style={{
                    background: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? '#f5f5f5' : '#fff',
                    color: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? '#999' : '#374151',
                    borderRadius: 6,
                    border: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? '1px solid #e5e7eb' : '2px solid #d1d5db',
                    fontWeight: 500,
                    fontSize: 12,
                    boxShadow: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                    transition: 'all 0.2s',
                    opacity: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? 0.5 : 1
                  }}
                >
                  {t('next')}
                </Button>
              </div>
            </div>

            {/* Medium screens: vertical layout */}
            <div className="hidden md:block lg:hidden mb-4" style={{ 
              padding: '16px 20px',
              background: '#fafafa',
              borderRadius: 8,
              border: '1px solid #f0f0f0',
              marginBottom: 20,
              marginLeft: 20,
              marginRight: 20
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
                    onConfirm={handleDeleteSelected}
                    okText={t('ok')}
                    cancelText={t('cancel')}
                    trigger="click"
                  >
                    <Button
                      type="primary"
                      danger
                      disabled={selectedUnits.length === 0}
                      size="small"
                      style={{
                        background: selectedUnits.length === 0 ? '#f5f5f5' : '#fff',
                        color: selectedUnits.length === 0 ? '#999' : '#dc2626',
                        borderRadius: 6,
                        border: selectedUnits.length === 0 ? '1px solid #e5e7eb' : '2px solid #dc2626',
                        fontWeight: 500,
                        fontSize: 12,
                        boxShadow: selectedUnits.length === 0 ? '0 1px 3px 0 rgba(0, 0, 0, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                        transition: 'all 0.2s',
                        opacity: selectedUnits.length === 0 ? 0.5 : 1
                      }}
                    >
                      {t('delete_selected')}{selectedUnits.length > 0 ? ` (${selectedUnits.length})` : ''}
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
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                  
                  <span className="text-sm text-gray-600">
                    {currentPage}/{Math.ceil(filteredUnits.length / pageSize)}
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
                    disabled={currentPage >= Math.ceil(filteredUnits.length / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    style={{
                      background: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? '#f5f5f5' : '#fff',
                      color: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? '#999' : '#374151',
                      borderRadius: 6,
                      border: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? '1px solid #e5e7eb' : '2px solid #d1d5db',
                      fontWeight: 500,
                      fontSize: 12,
                      boxShadow: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s',
                      opacity: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? 0.5 : 1
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
              marginBottom: 20,
              marginLeft: 20,
              marginRight: 20
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
                    onConfirm={handleDeleteSelected}
                    okText={t('ok')}
                    cancelText={t('cancel')}
                    trigger="click"
                  >
                    <Button
                      type="primary"
                      danger
                      disabled={selectedUnits.length === 0}
                      size="small"
                      className="text-xs"
                      style={{
                        background: selectedUnits.length === 0 ? '#f5f5f5' : '#fff',
                        color: selectedUnits.length === 0 ? '#999' : '#dc2626',
                        borderRadius: 6,
                        border: selectedUnits.length === 0 ? '1px solid #e5e7eb' : '2px solid #dc2626',
                        fontWeight: 500,
                        fontSize: 12,
                        boxShadow: selectedUnits.length === 0 ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s',
                        opacity: selectedUnits.length === 0 ? 0.5 : 1
                      }}
                    >
                      Delete ({selectedUnits.length})
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
                    <option value={6}>6</option>
                    <option value={12}>12</option>
                    <option value={24}>24</option>
                    <option value={48}>48</option>
                  </select>
                  
                  <span className="text-xs text-gray-600">
                    {currentPage}/{Math.ceil(filteredUnits.length / pageSize)}
                  </span>
                  
                  <Button
                    size="small"
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(currentPage - 1)}
                    className="text-xs px-2 py-1"
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
                    disabled={currentPage >= Math.ceil(filteredUnits.length / pageSize)}
                    onClick={() => setCurrentPage(currentPage + 1)}
                    className="text-xs px-2 py-1"
                    style={{
                      background: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? '#f5f5f5' : '#fff',
                      color: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? '#999' : '#374151',
                      borderRadius: 6,
                      border: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? '1px solid #e5e7eb' : '2px solid #d1d5db',
                      fontWeight: 500,
                      fontSize: 12,
                      boxShadow: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? 'none' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s',
                      opacity: currentPage >= Math.ceil(filteredUnits.length / pageSize) ? 0.5 : 1
                    }}
                  >
                    →
                  </Button>
                </div>
              </div>
            </div>
          </>
        )}
        

        {/* Create unit modal */}
        <Modal
          title={<span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>{t('create_new_unit')}</span>}
          open={isModalVisible}
          onOk={handleCreate}
          onCancel={handleCancel}
          okText={<span style={{ fontWeight: 600 }}>{t('create')}</span>}
          cancelText={<span style={{ fontWeight: 500 }}>{t('cancel')}</span>}
          width={600}
          centered
          destroyOnClose
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('unit_name')}
              </label>
              <Input
                placeholder={t('input_unit_name_placeholder')}
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
          </div>
        </Modal>

        {/* Import modal */}
        <ImportModal
          visible={isImportModalVisible}
          onCancel={() => setIsImportModalVisible(false)}
          onOk={handleImportConfirm}
          title={t('import_all')}
        />

        {/* Help modal */}
        <Modal
          title={<span style={{ fontSize: 22, fontWeight: 700, color: '#222' }}>{t('help')}</span>}
          open={helpVisible}
          onCancel={() => setHelpVisible(false)}
          footer={[
            <Button key="close" onClick={() => setHelpVisible(false)}>
              {t('close')}
            </Button>
          ]}
          width={600}
          centered
        >
          <div style={{ fontSize: 16, lineHeight: 1.6, color: '#333', paddingBottom: 20, minHeight: 200 }}>
            <p><strong>{t('help_title')}</strong></p>
            <div style={{ whiteSpace: 'pre-line', marginTop: 16 }}>
              {t('help_content')}
            </div>
          </div>
        </Modal>

        {/* Unit cards grid */}
        <div style={{ padding: '0 16px 16px 16px' }}>
          {paginatedUnits.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {paginatedUnits.map(unit => (
                 <UnitCard
                   key={unit.id}
                   unit={unit}
                   isSelected={selectedUnits.includes(unit.id)}
                   onSelect={() => handleSelectUnit(unit.id)}
                   onEdit={(values) => handleEditUnit(unit.id, values)}
                 />
               ))}
            </div>
          ) : (
            <div style={{ 
              textAlign: 'center', 
              padding: '60px 20px',
              color: '#666',
              fontSize: 16
            }}>
              {searchTerm ? t('no_search_results') : t('no_units')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UnitList; 