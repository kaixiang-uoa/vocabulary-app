import React, { useState, useRef } from 'react';
import { Modal, Button, Input } from '../components/ui';
import { useTranslation } from 'react-i18next';
import { parseImportContent } from '../utils/importParser';
import { ImportModalProps } from '../types';
import { getTailwindClass } from '../utils/styleMapping';

const ImportModal: React.FC<ImportModalProps> = ({
  visible,
  onOk,
  onCancel,
  title,
  accept = '',
  buttonText,
  icon,
  placeholder = '',
  validate,
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  // Record filename
  const fileNameRef = useRef<string>('');

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    fileNameRef.current = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result as string;
      setContent(result);
      setError('');
    };
    reader.readAsText(file);
  };

  // Handle import confirm
  const handleOk = () => {
    if (!content.trim()) {
      setError(t('import_empty_error'));
      return;
    }
    
    if (validate) {
      const err = validate(content);
      if (err) {
        setError(err);
        return;
      }
    }
    
    try {
      // Get file extension from filename
      const fileExtension = fileNameRef.current.split('.').pop()?.toLowerCase() || '';
      const parsed = parseImportContent(content, fileExtension);
      onOk(parsed);
      setContent('');
      setError('');
      const input = document.getElementById('import-file-input') as HTMLInputElement | null;
      if (input) input.value = '';
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError('');
    onCancel();
    const input = document.getElementById('import-file-input') as HTMLInputElement | null;
    if (input) input.value = '';
  };

  return (
    <Modal
      title={<span className={getTailwindClass('page-title')}>{title}</span>}
      visible={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
      width={800}
      centered
    >
      <div className={`${getTailwindClass('text-secondary')} ${getTailwindClass('text-small')} mb-4`}>
        {t('import_brief_tip')}
      </div>
      <div className="mb-6 min-w-[220px]">
                    <input id="import-file-input" type="file" accept={accept} onChange={handleFileUpload} className="sr-only" />
        <Button
          onClick={() => document.getElementById('import-file-input')?.click()}
          icon={icon}
          className={`${getTailwindClass('btn-primary')} mb-2 w-full`}
        >
          {buttonText || t('upload_file')}
        </Button>
        <div className={`${getTailwindClass('text-secondary')} ${getTailwindClass('text-small')} mb-2`}>
          {t('import_paste_tip')}
        </div>
      </div>
      <Input.TextArea
        placeholder={placeholder || t('import_placeholder_default')}
        value={content}
        onChange={e => { setContent(e.target.value); setError(''); }}
        rows={8}
        className={`${getTailwindClass('text-small')} rounded mb-2`}
        style={{ 
          minHeight: '300px',
          fontFamily: 'monospace',
          fontSize: '13px',
          lineHeight: '1.5'
        }}
      />
      {error && (
        <div className={`${getTailwindClass('text-error')} ${getTailwindClass('text-small')} font-medium mb-0`}>
          {error}
        </div>
      )}
      <div className="flex justify-end gap-3 mt-4">
        <Button onClick={handleCancel} className={getTailwindClass('btn-standard')} style={{ minWidth: 80 }}>
          {t('cancel')}
        </Button>
        <Button type="primary" onClick={handleOk} className={getTailwindClass('btn-standard')} style={{ minWidth: 80 }}>
          {t('ok')}
        </Button>
      </div>
    </Modal>
  );
};

export default ImportModal; 