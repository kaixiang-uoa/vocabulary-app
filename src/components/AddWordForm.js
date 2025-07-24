import React, { useState } from 'react';
import { Form, Input, Button, message, Modal } from 'antd';
import { PlusOutlined, UploadOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { addWord, addWordsInBatch } from '../utils/wordUtils';
import ImportModal from './ImportModal';
import { useTranslation } from 'react-i18next';

const AddWordForm = ({ unitId, onWordAdded }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [helpVisible, setHelpVisible] = useState(false);

  // Handle form submit
  const handleSubmit = (values) => {
    const { word, meaning } = values;
    if (addWord(unitId, word, meaning)) {
      message.success(t('add_word_success'));
      form.resetFields();
      if (onWordAdded) onWordAdded();
    } else {
      message.error(t('add_word_fail'));
    }
  };

  // Show import modal
  const showImportModal = () => {
    setIsModalVisible(true);
  };

  // Handle batch import (now supports multiple formats)
  const handleImportConfirm = (parsed) => {
    // parsed: { type, data }
    if (parsed.type === 'csv-words') {
      if (addWordsInBatch(unitId, parsed.data.words)) {
        message.success(t('import_csv_success'));
        setIsModalVisible(false);
        if (onWordAdded) onWordAdded();
      } else {
        message.error(t('import_csv_fail'));
      }
    } else if (parsed.type === 'json') {
      // 支持两种 json 格式：1. 单词数组 2. { units: [...] }
      if (Array.isArray(parsed.data)) {
        // 直接是单词数组
        if (addWordsInBatch(unitId, parsed.data)) {
          message.success(t('import_success'));
          setIsModalVisible(false);
          if (onWordAdded) onWordAdded();
        } else {
          message.error(t('import_csv_fail'));
        }
      } else if (parsed.data.units && Array.isArray(parsed.data.units)) {
        // 多单元 json，找到当前单元
        const unit = parsed.data.units.find(u => String(u.id) === String(unitId) || u.name === unitId);
        if (unit && Array.isArray(unit.words)) {
          if (addWordsInBatch(unitId, unit.words)) {
            message.success(t('import_success'));
            setIsModalVisible(false);
            if (onWordAdded) onWordAdded();
          } else {
            message.error(t('import_csv_fail'));
          }
        } else {
          message.error(t('json_format_error'));
        }
      } else {
        message.error(t('json_format_error'));
      }
    } else {
      message.error('Only single-unit CSV or JSON import is supported here.');
    }
  };

  return (
    <div>
      <Form form={form} layout="vertical" onFinish={handleSubmit}>
        <Form.Item
          name="word"
          label={t('word')}
          rules={[{ required: true, message: t('input_word') }]}
        >
          <Input placeholder={t('input_word_placeholder')} />
        </Form.Item>

        <Form.Item
          name="meaning"
          label={t('meaning')}
          rules={[{ required: true, message: t('input_meaning') }]}
        >
          <Input.TextArea placeholder={t('input_meaning_placeholder')} rows={2} />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            icon={<PlusOutlined />} 
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
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {t('add_word')}
          </Button>
          <Button 
            style={{ 
              marginLeft: 8, 
              background: 'linear-gradient(90deg, var(--primary-500) 0%, var(--primary-600) 100%)',
              color: '#fff',
              borderRadius: 8,
              fontWeight: 600,
              fontSize: 15,
              border: 'none',
              boxShadow: 'var(--shadow-md)',
              transition: 'all 0.2s',
            }}
            onClick={showImportModal}
            icon={<UploadOutlined />}
            onMouseEnter={e => e.currentTarget.style.filter = 'brightness(0.95)'}
            onMouseLeave={e => e.currentTarget.style.filter = 'none'}
          >
            {t('import_all')}
          </Button>
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
        </Form.Item>
      </Form>
      <Modal
        open={helpVisible}
        title={t('help_title')}
        onCancel={() => setHelpVisible(false)}
        footer={null}
      >
        <div style={{ marginBottom: 16 }}>
          <b>{t('help_csv_title_word')}</b>
          <div style={{ color: '#666', fontSize: 14, margin: '8px 0' }}>{t('help_csv_desc_word')}</div>
          <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 6, fontSize: 13 }}>{t('help_csv_example_word')}</pre>
        </div>
        <div style={{ marginBottom: 16 }}>
          <b>{t('help_json_title_word')}</b>
          <div style={{ color: '#666', fontSize: 14, margin: '8px 0' }}>{t('help_json_desc_word')}</div>
          <pre style={{ background: '#f6f6f6', padding: 12, borderRadius: 6, fontSize: 13 }}>{t('help_json_example_word')}</pre>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Button type="primary" onClick={() => setHelpVisible(false)}>{t('help_close')}</Button>
        </div>
      </Modal>

      <ImportModal
        visible={isModalVisible}
        onOk={handleImportConfirm}
        onCancel={() => setIsModalVisible(false)}
        title={t('import_all')}
        accept=".csv,.json"
        buttonText={t('upload_file')}
        icon={<UploadOutlined />}
        placeholder={t('import_paste_tip')}
      />
    </div>
  );
};

export default AddWordForm;