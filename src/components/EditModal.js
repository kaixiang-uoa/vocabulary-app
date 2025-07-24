import React from 'react';
import { Modal, Form, Input } from 'antd';
import { useTranslation } from 'react-i18next';

/**
 * General edit dialog 
 * @param visible whether to show
 * @param fields array of fields [{name, label, value, rules, placeholder}]
 * @param title title
 * @param onOk submit callback(values)
 * @param onCancel cancel callback
 * @param okText confirm button text
 * @param cancelText cancel button text
 */
const EditModal = ({
  visible,
  fields = [],
  title = 'Edit',
  onOk,
  onCancel,
  okText = 'Save',
  cancelText = 'Cancel',
}) => {
  const [form] = Form.useForm();
  const { t } = useTranslation();

  React.useEffect(() => {
    if (visible) {
      // initialize form values
      const initialValues = {};
      fields.forEach(f => { initialValues[f.name] = f.value; });
      form.setFieldsValue(initialValues);
    }
  }, [visible, fields, form]);

  const handleOk = () => {
    form.validateFields().then(values => {
      onOk && onOk(values);
      form.resetFields();
    });
  };

  const handleCancel = () => {
    form.resetFields();
    onCancel && onCancel();
  };

  return (
    <Modal
      open={visible}
      title={<span style={{fontSize: 20, fontWeight: 700, color: 'var(--primary-600)'}}>{t(title)}</span>}
      onOk={handleOk}
      onCancel={handleCancel}
      okText={<span style={{fontWeight: 600}}>{t(okText)}</span>}
      cancelText={<span style={{fontWeight: 500}}>{t(cancelText)}</span>}
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
      destroyOnClose
    >
      <Form form={form} layout="vertical">
        {fields.map(f => (
          <Form.Item
            key={f.name}
            name={f.name}
            label={<span style={{fontWeight: 600}}>{t(f.label)}</span>}
            rules={f.rules || [{ required: true, message: t('please_input', { label: t(f.label) }) }]}
          >
            <Input placeholder={f.placeholder ? t(f.placeholder) : ''} autoComplete="off" />
          </Form.Item>
        ))}
      </Form>
    </Modal>
  );
};

export default EditModal; 