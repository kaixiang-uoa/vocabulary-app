import React from 'react';

export interface InputNumberProps {
  value?: number;
  defaultValue?: number;
  min?: number;
  max?: number;
  step?: number;
  precision?: number;
  disabled?: boolean;
  size?: 'small' | 'medium' | 'large';
  onChange?: (value: number | null) => void;
  className?: string;
  style?: React.CSSProperties;
  title?: string;
}

const InputNumber: React.FC<InputNumberProps> = ({
  value,
  defaultValue,
  min,
  max,
  step = 1,
  precision = 0,
  disabled = false,
  size = 'medium',
  onChange,
  className = '',
  style,
  title,
}) => {
  const [inputValue, setInputValue] = React.useState(value ?? defaultValue ?? 0);

  React.useEffect(() => {
    if (value !== undefined) {
      setInputValue(value);
    }
  }, [value]);

  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg',
  };

  const baseClasses = 'w-full border border-gray-300 rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed';
  const classes = `${baseClasses} ${sizeClasses[size]} ${className}`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (isNaN(newValue)) {
      setInputValue(0);
      onChange?.(null);
      return;
    }

    let finalValue = newValue;
    
    // Apply min/max constraints
    if (min !== undefined && finalValue < min) {
      finalValue = min;
    }
    if (max !== undefined && finalValue > max) {
      finalValue = max;
    }

    // Apply precision
    if (precision !== undefined) {
      finalValue = Math.round(finalValue * Math.pow(10, precision)) / Math.pow(10, precision);
    }

    setInputValue(finalValue);
    onChange?.(finalValue);
  };



  return (
    <input
      type="number"
      value={inputValue}
      min={min}
      max={max}
      step={step}
      disabled={disabled}
      onChange={handleChange}
      className={classes}
      style={style}
      title={title}
    />
  );
};

export default InputNumber; 