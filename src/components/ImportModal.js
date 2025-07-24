import React, { useState } from 'react';
import { Modal, Button, Input, message } from 'antd';
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
    };
    reader.readAsText(file);
  };

  // handle import confirm
  const handleOk = () => {
    if (!content.trim()) {
      message.error(t('import_empty_error'));
      return;
    }
    if (validate) {
      const err = validate(content);
      if (err) {
        message.error(err);
        return;
      }
    }
    try {
      // Unified import parse and dispatch
      const parsed = parseImportContent(content, fileNameRef.current);
      onOk(parsed);
      setContent('');
    } catch (e) {
      message.error(e.message);
    }
  };

  return (
    <Modal
      title={<span style={{fontSize: 20, fontWeight: 700, color: '#222'}}>{title}</span>}
      open={visible}
      onOk={handleOk}
      onCancel={() => { setContent(''); onCancel(); }}
      okText={<span style={{fontWeight: 600}}>{t('ok')}</span>}
      cancelText={<span style={{fontWeight: 500}}>{t('cancel')}</span>}
      okButtonProps={{
        style: {
          background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
          color: '#fff',
          borderRadius: 8,
          fontWeight: 600,
          fontSize: 15,
          border: 'none',
          boxShadow: 'var(--shadow-md)',
          transition: 'all 0.2s',
        }
      }}
      cancelButtonProps={{
        style: {
          background: 'var(--neutral-100)',
          color: 'var(--neutral-700)',
          borderRadius: 8,
          fontWeight: 500,
          fontSize: 15,
          border: 'none',
          boxShadow: 'var(--shadow-sm)',
          transition: 'all 0.2s',
        }
      }}
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
        onChange={e => setContent(e.target.value)}
        rows={8}
        style={{ fontSize: 14, borderRadius: 8, fontWeight: 500, marginTop: 8 }}
      />
    </Modal>
  );
};

export default ImportModal; 