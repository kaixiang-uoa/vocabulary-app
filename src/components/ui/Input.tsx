import React, { forwardRef } from 'react';

export interface InputProps extends Partial<Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size' | 'prefix' | 'suffix'>> {
  customSize?: 'small' | 'medium' | 'large';
  inputPrefix?: React.ReactNode;
  inputSuffix?: React.ReactNode;
  allowClear?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  allowClear?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const InputComponent = forwardRef<HTMLInputElement, InputProps>(({
  customSize = 'medium',
  inputPrefix,
  inputSuffix,
  allowClear = false,
  className = '',
  style,
  ...rest
}, ref) => {
  const [inputValue, setInputValue] = React.useState(rest.value || rest.defaultValue || '');
  const [showClear, setShowClear] = React.useState(false);

  React.useEffect(() => {
    if (rest.value !== undefined) {
      setInputValue(rest.value);
    }
  }, [rest.value]);

  const baseClasses = 'w-full border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';
  const sizeClasses = {
    small: 'px-3 py-1.5 text-sm',
    medium: 'px-4 py-2 text-base',
    large: 'px-4 py-3 text-lg',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowClear(newValue.length > 0);
    rest.onChange?.(e);
  };

  const handleClear = () => {
    setInputValue('');
    setShowClear(false);
    const event = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLInputElement>;
    rest.onChange?.(event);
  };

  return (
    <div className={`relative ${className}`} style={style}>
      {inputPrefix && (
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          {inputPrefix}
        </div>
      )}
      <input
        ref={ref}
        {...rest}
        value={inputValue}
        onChange={handleChange}
        className={`${baseClasses} ${sizeClasses[customSize]} ${inputPrefix ? 'pl-10' : ''} ${inputSuffix || (allowClear && showClear) ? 'pr-10' : ''}`}
      />
      {(inputSuffix || (allowClear && showClear)) && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
          {allowClear && showClear && (
            <button
              onClick={handleClear}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {inputSuffix}
        </div>
      )}
    </div>
  );
});

InputComponent.displayName = 'Input';

const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(({
  allowClear = false,
  className = '',
  style,
  ...rest
}, ref) => {
  const [inputValue, setInputValue] = React.useState(rest.value || rest.defaultValue || '');
  const [showClear, setShowClear] = React.useState(false);

  React.useEffect(() => {
    if (rest.value !== undefined) {
      setInputValue(rest.value);
    }
  }, [rest.value]);

  const baseClasses = 'w-full border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed resize-none';

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    setShowClear(newValue.length > 0);
    rest.onChange?.(e);
  };

  const handleClear = () => {
    setInputValue('');
    setShowClear(false);
    const event = {
      target: { value: '' }
    } as React.ChangeEvent<HTMLTextAreaElement>;
    rest.onChange?.(event);
  };

  return (
    <div className={`relative ${className}`} style={style}>
      <textarea
        ref={ref}
        {...rest}
        value={inputValue}
        onChange={handleChange}
        className={`${baseClasses} px-4 py-2 text-base ${allowClear && showClear ? 'pr-10' : ''}`}
      />
      {allowClear && showClear && (
        <div className="absolute right-3 top-3">
          <button
            onClick={handleClear}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            type="button"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

const Input = InputComponent as typeof InputComponent & {
  TextArea: typeof TextArea;
};
Input.TextArea = TextArea;

export default Input; 