import React from 'react';

export interface ProgressProps {
  percent?: number;
  showInfo?: boolean;
  status?: 'success' | 'exception' | 'normal' | 'active';
  strokeColor?: string;
  strokeWidth?: number;
  format?: (percent?: number) => string;
  className?: string;
  style?: React.CSSProperties;
}

const Progress: React.FC<ProgressProps> = ({
  percent = 0,
  showInfo = true,
  status = 'normal',
  strokeColor,
  strokeWidth = 8,
  format,
  className = '',
  style,
}) => {
  const clampedPercent = Math.min(Math.max(percent, 0), 100);

  const statusClasses = {
    success: 'bg-green-500',
    exception: 'bg-red-500',
    normal: 'bg-primary-500',
    active: 'bg-primary-500',
  };

  const getStrokeColor = () => {
    if (strokeColor) return strokeColor;
    return status === 'success'
      ? '#22c55e'
      : status === 'exception'
        ? '#ef4444'
        : '#6366f1';
  };

  const getFormatText = () => {
    if (format) return format(clampedPercent);
    return `${Math.round(clampedPercent)}%`;
  };

  return (
    <div className={`progress ${className}`} style={style}>
      <div
        className="w-full bg-gray-200 rounded-full"
        style={{ height: strokeWidth }}
      >
        <div
          className={`h-full rounded-full transition-all duration-300 ${statusClasses[status]}`}
          style={{
            width: `${clampedPercent}%`,
            backgroundColor: getStrokeColor(),
          }}
        >
          {status === 'active' && (
            <div className="h-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse" />
          )}
        </div>
      </div>
      {showInfo && (
        <div className="mt-2 text-sm text-gray-600 text-center">
          {getFormatText()}
        </div>
      )}
    </div>
  );
};

export default Progress;
