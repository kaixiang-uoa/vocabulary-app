import React from "react";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  disabled?: boolean;
  indeterminate?: boolean;
  onChange?: (checked: boolean) => void;
  onClick?: (e: React.MouseEvent<HTMLLabelElement>) => void;
  children?: React.ReactNode;
  className?: string;
}

const Checkbox: React.FC<CheckboxProps> = ({
  checked,
  defaultChecked = false,
  disabled = false,
  indeterminate = false,
  onChange,
  onClick,
  children,
  className = "",
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

  const baseClasses = "inline-flex items-center cursor-pointer";
  const disabledClasses = disabled ? "opacity-50 cursor-not-allowed" : "";
  const classes = `${baseClasses} ${disabledClasses} ${className}`;

  return (
    <label className={classes} onClick={onClick}>
      <div className="relative">
        <input
          type="checkbox"
          checked={isChecked}
          disabled={disabled}
          onChange={handleChange}
          className="sr-only"
        />
        <div
          className={`w-4 h-4 border-2 rounded transition-all duration-200 ${
            isChecked
              ? "bg-primary-600 border-primary-600"
              : "bg-white border-gray-300"
          } ${disabled ? "opacity-50" : ""}`}
        >
          {isChecked && !indeterminate && (
            <svg
              className="w-3 h-3 text-white absolute top-0.5 left-0.5"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
          )}
          {indeterminate && (
            <div className="w-2 h-0.5 bg-white absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
          )}
        </div>
      </div>
      {children && (
        <span className="ml-2 text-sm text-gray-700">{children}</span>
      )}
    </label>
  );
};

export default Checkbox;
