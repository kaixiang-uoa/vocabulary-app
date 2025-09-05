import React from 'react';

export interface EmptyProps {
  description?: React.ReactNode;
  image?: React.ReactNode;
  children?: React.ReactNode;
  styles?: {
    image?: React.CSSProperties;
  };
  className?: string;
  style?: React.CSSProperties;
}

const Empty: React.FC<EmptyProps> = ({
  description = 'No Data',
  image,
  children,
  styles,
  className = '',
  style,
}) => {
  const defaultImage = (
    <svg
      className="w-24 h-24 text-gray-300"
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path
        fillRule="evenodd"
        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
        clipRule="evenodd"
      />
    </svg>
  );

  return (
    <div
      className={`flex flex-col items-center justify-center py-12 ${className}`}
      style={style}
    >
      <div className="mb-4" style={styles?.image}>
        {image || defaultImage}
      </div>
      <div className="text-gray-500 text-center">{description}</div>
      {children}
    </div>
  );
};

export default Empty;
