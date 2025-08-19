import React from "react";

export interface ButtonProps {
  children?: React.ReactNode;
  type?: "primary" | "secondary" | "danger" | "success" | "default" | "text";
  size?: "small" | "medium" | "large";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
  htmlType?: "button" | "submit" | "reset";
  style?: React.CSSProperties;
  danger?: boolean;
  title?: string;
  onMouseEnter?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  onMouseLeave?: (e: React.MouseEvent<HTMLButtonElement>) => void;
}

const Button: React.FC<ButtonProps> = ({
  children,
  type = "default",
  size = "medium",
  disabled = false,
  loading = false,
  icon,
  onClick,
  className = "",
  htmlType = "button",
  style,
  danger,
  title,
  onMouseEnter,
  onMouseLeave,
}) => {
  const baseClasses =
    "inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";

  const typeClasses = {
    primary:
      "bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:from-primary-600 hover:to-primary-700 focus:ring-primary-500 shadow-md hover:shadow-lg",
    secondary:
      "bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500 border border-gray-300",
    danger:
      "bg-gradient-to-r from-error-500 to-error-600 text-white hover:from-error-600 hover:to-error-700 focus:ring-error-500 shadow-md hover:shadow-lg",
    success:
      "bg-gradient-to-r from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 focus:ring-success-500 shadow-md hover:shadow-lg",
    default:
      "bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500 border border-gray-300",
    text: "bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500",
  };

  // Handle danger prop
  const finalType = danger ? "danger" : type;

  const sizeClasses = {
    small: "px-3 py-1.5 text-sm",
    medium: "px-4 py-2 text-base",
    large: "px-5 py-2.5 text-lg",
  };

  const classes =
    `${baseClasses} ${typeClasses[finalType]} ${sizeClasses[size]} ${className}`
      .replace(/\s+/g, " ")
      .trim();

  return (
    <button
      type={htmlType}
      className={classes}
      disabled={disabled || loading}
      onClick={onClick}
      style={style}
      title={title}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          ></path>
        </svg>
      )}
      {icon && !loading && <span className="mr-2">{icon}</span>}
      {children}
    </button>
  );
};

export default Button;
