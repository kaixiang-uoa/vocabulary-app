import React, { useState } from 'react';
import { Form, Input, Button, message } from 'antd';
import { PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { addWord, importWordsFromCSV } from '../utils/wordUtils';
import ImportModal from './ImportModal';
import { useTranslation } from 'react-i18next';

const AddWordForm = ({ unitId, onWordAdded }) => {
  const { t } = useTranslation();
  const [form] = Form.useForm();
  const [isModalVisible, setIsModalVisible] = useState(false);

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

  // Handle batch import CSV
  const handleImportConfirm = (csvContent) => {
    if (!csvContent.trim()) {
      message.error(t('input_csv_content'));
      return;
    }
    if (importWordsFromCSV(unitId, csvContent)) {
      message.success(t('import_csv_success'));
      setIsModalVisible(false);
      if (onWordAdded) onWordAdded();
    } else {
      message.error(t('import_csv_fail'));
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
            {t('import_batch_csv')}
          </Button>
        </Form.Item>
      </Form>

      <ImportModal
        visible={isModalVisible}
        onOk={handleImportConfirm}
        onCancel={() => setIsModalVisible(false)}
        title={t('import_batch_csv_modal_title')}
        accept=".csv,.txt"
        buttonText={t('upload_csv_file')}
        icon={<UploadOutlined />}
        placeholder={t('csv_placeholder')}
        validate={content => !content.trim() ? t('input_csv_content') : null}
        parseContent={content => content}
      />
    </div>
  );
};

export default AddWordForm;