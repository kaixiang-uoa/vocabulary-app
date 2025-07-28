import React from 'react';

export interface RadioProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  value?: any;
  onChange?: (checked: boolean) => void;
  children?: React.ReactNode;
  className?: string;
}

export interface RadioButtonProps {
  value?: any;
  disabled?: boolean;
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export interface RadioGroupProps {
  value?: any;
  defaultValue?: any;
  onChange?: (value: any) => void;
  children: React.ReactNode;
  className?: string;
}

const Radio: React.FC<RadioProps> = ({
  checked,
  defaultChecked = false,
  disabled = false,
  value,
  onChange,
  children,
  className = '',
}) => {
  const [isChecked, setIsChecked] = React.useState(checked ?? defaultChecked);

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleChange = () => {
    if (disabled) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  const baseClasses = 'inline-flex items-center cursor-pointer';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';
  const classes = `${baseClasses} ${disabledClasses} ${className}`;

  return (
    <label className={classes}>
      <div className="relative">
        <input
          type="radio"
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          value={value}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 border-2 rounded-full transition-all duration-200 ${
            isChecked
              ? 'border-primary-600'
              : 'border-gray-300'
          } ${disabled ? 'opacity-50' : ''}`}
        >
          {isChecked && (
            <div className="w-2 h-2 bg-primary-600 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>
      {children && (
        <span className="ml-2 text-sm text-gray-700">{children}</span>
      )}
    </label>
  );
};

const RadioButton: React.FC<RadioButtonProps> = ({
  value,
  disabled = false,
  children,
  className = '',
  onClick,
}) => {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`px-3 py-1 text-sm font-medium rounded border transition-all duration-200 ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  );
};

const RadioGroup: React.FC<RadioGroupProps> = ({
  value,
  defaultValue,
  onChange,
  children,
  className = '',
}) => {
  const [selectedValue, setSelectedValue] = React.useState(value ?? defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  const handleRadioChange = (radioValue: any) => {
    setSelectedValue(radioValue);
    onChange?.({ target: { value: radioValue } });
  };

  return (
    <div className={`radio-group flex gap-1 ${className}`}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child) && child.type === RadioButton) {
          const childProps = child.props as RadioButtonProps;
          const isSelected = childProps.value === selectedValue;
          const newProps = {
            className: `${childProps.className || ''} ${
              isSelected 
                ? 'bg-primary-600 text-white border-primary-600' 
                : 'bg-white text-gray-700 border-gray-300 hover:border-primary-500'
            }`,
            onClick: () => handleRadioChange(childProps.value),
          };
          return React.cloneElement(child, newProps as any);
        }
        return child;
      })}
    </div>
  );
};

export { Radio, RadioGroup, RadioButton }; 