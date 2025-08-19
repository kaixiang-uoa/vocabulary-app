import React from "react";
import { Modal, Input } from "../components/ui";
import { useTranslation } from "react-i18next";
import { EditModalProps } from "../types";
import { getTailwindClass } from "../utils/styleMapping";

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
const EditModal: React.FC<EditModalProps> = ({
  visible,
  fields = [],
  title = "Edit",
  onOk,
  onCancel,
  okText = "Save",
  cancelText = "Cancel",
}) => {
  const [formData, setFormData] = React.useState<Record<string, string>>({});
  const { t } = useTranslation();

  React.useEffect(() => {
    if (visible) {
      // Initialize form values
      const initialValues: Record<string, string> = {};
      fields.forEach((f) => {
        initialValues[f.name] = f.value || "";
      });
      setFormData(initialValues);
    }
  }, [visible, fields]);

  const handleOk = () => {
    // Simple validation
    const hasEmptyFields = fields.some((f) => !formData[f.name]?.trim());
    if (hasEmptyFields) {
      return;
    }
    onOk && onOk(formData);
    setFormData({});
  };

  const handleCancel = () => {
    setFormData({});
    onCancel && onCancel();
  };

  const handleInputChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Modal
      open={visible}
      title={
        <span className={`${getTailwindClass("page-title")} text-blue-600`}>
          {t(title)}
        </span>
      }
      onOk={handleOk}
      onCancel={handleCancel}
      okText={
        <span className={getTailwindClass("font-semibold")}>{t(okText)}</span>
      }
      cancelText={
        <span className={getTailwindClass("font-medium")}>{t(cancelText)}</span>
      }
      okButtonProps={{
        className: `${getTailwindClass("btn-primary")} ${getTailwindClass("btn-standard")}`,
      }}
      cancelButtonProps={{
        className: `${getTailwindClass("btn-secondary")} ${getTailwindClass("btn-standard")}`,
      }}
      destroyOnClose
    >
      <div className="space-y-4">
        {fields.map((f) => (
          <div key={f.name}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <span className={getTailwindClass("font-semibold")}>
                {t(f.label)}
              </span>
            </label>
            <Input
              placeholder={f.placeholder ? t(f.placeholder) : ""}
              autoComplete="off"
              value={formData[f.name] || ""}
              onChange={(e) => handleInputChange(f.name, e.target.value)}
            />
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default EditModal;
