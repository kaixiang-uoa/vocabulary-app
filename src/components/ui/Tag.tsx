import React from 'react';

export interface TagProps {
  children: React.ReactNode;
  color?: 'default' | 'primary' | 'success' | 'warning' | 'error' | 'processing' | string;
  closable?: boolean;
  onClose?: () => void;
  icon?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Tag: React.FC<TagProps> = ({
  children,
  color = 'default',
  closable = false,
  onClose,
  icon,
  className = '',
  style,
}) => {
  const colorClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    primary: 'bg-blue-100 text-blue-800 border-blue-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    error: 'bg-red-100 text-red-800 border-red-200',
    processing: 'bg-purple-100 text-purple-800 border-purple-200',
  };

  const baseClasses = 'inline-flex items-center px-2 py-1 text-xs font-medium rounded border';
  const colorClass = colorClasses[color as keyof typeof colorClasses] || colorClasses.default;
  const classes = `${baseClasses} ${colorClass} ${className}`;

  return (
    <span className={classes} style={style}>
      {icon && <span className="mr-1">{icon}</span>}
      {children}
      {closable && (
        <button
          onClick={onClose}
          className="ml-1 text-current hover:opacity-70 transition-opacity"
        >
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      )}
    </span>
  );
};

export default Tag; 