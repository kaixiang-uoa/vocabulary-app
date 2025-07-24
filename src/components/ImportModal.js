import React, { useState } from 'react';
import { Modal, Button, Input } from 'antd';
import { useTranslation } from 'react-i18next';
import { parseImportContent } from '../utils/importParser';

const ImportModal = ({
  visible,
  onOk,
  onCancel,
  title,
  accept = '',
  buttonText,
  icon,
  placeholder = '',
  validate, // (content) => string | null, return error message or null 
}) => {
  const [content, setContent] = useState('');
  const [error, setError] = useState('');
  const { t } = useTranslation();

  // 记录文件名
  const fileNameRef = React.useRef('');
  // handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    fileNameRef.current = file.name;
    const reader = new FileReader();
    reader.onload = (evt) => {
      setContent(evt.target.result);
      setError('');
    };
    reader.readAsText(file);
  };

  // handle import confirm
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
      // Unified import parse and dispatch
      const parsed = parseImportContent(content, fileNameRef.current);
      onOk(parsed);
      setContent('');
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleCancel = () => {
    setContent('');
    setError('');
    onCancel();
  };

  return (
    <Modal
      title={<span style={{fontSize: 20, fontWeight: 700, color: '#222'}}>{title}</span>}
      open={visible}
      onOk={handleOk}
      onCancel={handleCancel}
      footer={null}
    >
      <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>{t('import_brief_tip')}</div>
      <div style={{ marginBottom: 12, minWidth: 220 }}>
        <input id="import-file-input" type="file" accept={accept} onChange={handleFileUpload} style={{ display: 'none' }} />
        <Button
          onClick={() => document.getElementById('import-file-input').click()}
          icon={icon}
          style={{
            background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
            color: '#fff',
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 15,
            border: 'none',
            boxShadow: 'var(--shadow-md)',
            transition: 'all 0.2s',
            marginBottom: 8
          }}
          block
        >
          {buttonText || t('upload_file')}
        </Button>
        <div style={{ color: '#888', fontSize: 13, marginBottom: 8 }}>{t('import_paste_tip')}</div>
      </div>
      <Input.TextArea
        placeholder={placeholder}
        value={content}
        onChange={e => { setContent(e.target.value); setError(''); }}
        rows={8}
        style={{ fontSize: 14, borderRadius: 8, fontWeight: 500, marginTop: 8 }}
      />
      {error && (
        <div style={{ color: '#ff4d4f', marginTop: 8, marginBottom: 0, fontSize: 14, fontWeight: 500 }}>{error}</div>
      )}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 18 }}>
        <Button onClick={handleCancel} style={{ minWidth: 80 }}>{t('cancel')}</Button>
        <Button type="primary" onClick={handleOk} style={{ minWidth: 80 }}>{t('ok')}</Button>
      </div>
    </Modal>
  );
};

export default ImportModal; 