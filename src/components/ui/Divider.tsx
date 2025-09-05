import React from 'react';

export interface DividerProps {
  type?: 'horizontal' | 'vertical';
  orientation?: 'left' | 'right' | 'center';
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

const Divider: React.FC<DividerProps> = ({
  type = 'horizontal',
  orientation = 'center',
  children,
  className = '',
  style,
}) => {
  if (type === 'vertical') {
    return (
      <div
        className={`inline-block w-px h-4 bg-gray-300 mx-2 ${className}`}
        style={style}
      />
    );
  }

  const orientationClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  };

  return (
    <div
      className={`flex items-center ${orientationClasses[orientation]} ${className}`}
      style={style}
    >
      <div className="flex-1 h-px bg-gray-300" />
      {children && <div className="px-4 text-sm text-gray-500">{children}</div>}
      <div className="flex-1 h-px bg-gray-300" />
    </div>
  );
};

export default Divider;
