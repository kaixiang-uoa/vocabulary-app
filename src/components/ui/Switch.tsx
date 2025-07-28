import React from 'react';

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  loading?: boolean;
  size?: 'small' | 'default';
  onChange?: (checked: boolean) => void;
  className?: string;
}

const Switch: React.FC<SwitchProps> = ({
  checked,
  defaultChecked = false,
  disabled = false,
  loading = false,
  size = 'default',
  onChange,
  className = '',
}) => {
  const [isChecked, setIsChecked] = React.useState(checked ?? defaultChecked);

  React.useEffect(() => {
    if (checked !== undefined) {
      setIsChecked(checked);
    }
  }, [checked]);

  const handleToggle = () => {
    if (disabled || loading) return;
    
    const newValue = !isChecked;
    setIsChecked(newValue);
    onChange?.(newValue);
  };

  const sizeClasses = {
    small: 'w-8 h-4',
    default: 'w-11 h-6',
  };

  const thumbSizeClasses = {
    small: 'w-3 h-3',
    default: 'w-5 h-5',
  };

  const baseClasses = 'relative inline-flex items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500';
  const checkedClasses = isChecked ? 'bg-primary-600' : 'bg-gray-200';
  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';
  
  const classes = `${baseClasses} ${sizeClasses[size]} ${checkedClasses} ${disabledClasses} ${className}`;

  return (
    <button
      type="button"
      className={classes}
      onClick={handleToggle}
      disabled={disabled || loading}
      role="switch"
      aria-checked={isChecked}
    >
      <span
        className={`inline-block ${thumbSizeClasses[size]} bg-white rounded-full shadow transform transition-transform duration-200 ${
          isChecked ? 'translate-x-6' : 'translate-x-1'
        }`}
      >
        {loading && (
          <svg className="w-full h-full animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        )}
      </span>
    </button>
  );
};

export default Switch; 