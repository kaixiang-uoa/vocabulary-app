import React, { createContext, useContext, useState, ReactNode } from "react";

export interface FormProps {
  children: ReactNode;
  onFinish?: (values: any) => void;
  initialValues?: Record<string, any>;
  className?: string;
  style?: React.CSSProperties;
}

export interface FormItemProps {
  label?: string;
  name?: string;
  rules?: Array<{
    required?: boolean;
    message?: string;
    validator?: (value: any) => boolean | string;
  }>;
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

interface FormContextType {
  values: Record<string, any>;
  setValue: (name: string, value: any) => void;
  errors: Record<string, string>;
  setError: (name: string, error: string) => void;
  validateField: (name: string, value: any) => boolean;
}

const FormContext = createContext<FormContextType | null>(null);

const useFormContext = () => {
  const context = useContext(FormContext);
  if (!context) {
    throw new Error("useFormContext must be used within a Form");
  }
  return context;
};

// Simple useForm hook for compatibility
const useForm = <T = any,>() => {
  const [values, setValues] = useState<T>({} as T);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setFieldsValue = (newValues: Partial<T>) => {
    setValues((prev) => ({ ...prev, ...newValues }));
  };

  const getFieldValue = (name: string) => {
    return (values as any)[name];
  };

  const validateFields = async (): Promise<T> => {
    // Simple validation - can be enhanced
    return values;
  };

  const resetFields = () => {
    setValues({} as T);
    setErrors({});
  };

  return [
    {
      setFieldsValue,
      getFieldValue,
      validateFields,
      resetFields,
      getFieldsValue: () => values,
      errors,
      setErrors,
    },
  ] as const;
};

const Form: React.FC<FormProps> = ({
  children,
  onFinish,
  initialValues = {},
  className = "",
  style,
}) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const setValue = (name: string, value: any) => {
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when value changes
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const setError = (name: string, error: string) => {
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const validateField = (name: string, value: any): boolean => {
    // Simple validation - can be extended
    if (value === undefined || value === null || value === "") {
      setError(name, "This field is required");
      return false;
    }
    setError(name, "");
    return true;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields
    let isValid = true;
    const newErrors: Record<string, string> = {};

    // This is a simplified validation - in a real implementation,
    // you would iterate through all form items and validate them

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      isValid = false;
    }

    if (isValid && onFinish) {
      onFinish(values);
    }
  };

  const contextValue: FormContextType = {
    values,
    setValue,
    errors,
    setError,
    validateField,
  };

  return (
    <FormContext.Provider value={contextValue}>
      <form onSubmit={handleSubmit} className={className} style={style}>
        {children}
      </form>
    </FormContext.Provider>
  );
};

const FormItem: React.FC<FormItemProps> = ({
  label,
  name,
  rules = [],
  children,
  className = "",
  style,
}) => {
  const { errors, validateField } = useFormContext();
  const error = name ? errors[name] : "";

  const handleChange = (value: any) => {
    if (name) {
      validateField(name, value);
    }
  };

  return (
    <div className={`mb-4 ${className}`} style={style}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div>
        {React.cloneElement(children as React.ReactElement<any>, {
          onChange: handleChange,
          "data-name": name,
        })}
      </div>
      {error && <div className="text-red-500 text-sm mt-1">{error}</div>}
    </div>
  );
};

// Attach FormItem and useForm to Form
(Form as any).Item = FormItem;
(Form as any).useForm = useForm;

// Export both default and named exports
export { FormItem, useFormContext, useForm };
export default Form;
