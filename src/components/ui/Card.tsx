import React from 'react';

export interface CardProps {
  title?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
  hoverable?: boolean;
  bordered?: boolean;
  size?: 'small' | 'default';
  variant?: string;
  className?: string;
  style?: React.CSSProperties;
  styles?: {
    body?: React.CSSProperties;
  };
  onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
  title,
  extra,
  children,
  hoverable = false,
  bordered = true,
  size = 'default',
  variant,
  className = '',
  style,
  styles,
  onClick,
}) => {
  const baseClasses = 'bg-white rounded-lg transition-all duration-200';
  const borderClasses = bordered ? 'border border-gray-200' : '';
  const hoverClasses = hoverable ? 'hover:shadow-lg hover:-translate-y-1 cursor-pointer' : '';
  const sizeClasses = size === 'small' ? 'p-4' : 'p-6';
  
  const classes = `${baseClasses} ${borderClasses} ${hoverClasses} ${className}`;
  
  return (
    <div className={classes} style={style} onClick={onClick}>
      {(title || extra) && (
        <div className="flex items-center justify-between mb-4">
          {title && (
            <div className="text-lg font-semibold text-gray-900">
              {title}
            </div>
          )}
          {extra && (
            <div className="text-gray-500">
              {extra}
            </div>
          )}
        </div>
      )}
      <div className={sizeClasses} style={styles?.body}>
        {children}
      </div>
    </div>
  );
};

export default Card; 