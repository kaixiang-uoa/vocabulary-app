import React from 'react';

export interface StatisticProps {
  title?: React.ReactNode;
  value?: React.ReactNode;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  precision?: number;
  valueStyle?: React.CSSProperties;
  className?: string;
}

const Statistic: React.FC<StatisticProps> = ({
  title,
  value,
  prefix,
  suffix,
  precision,
  valueStyle,
  className = '',
}) => {
  const formatValue = (val: any) => {
    if (typeof val === 'number' && precision !== undefined) {
      return val.toFixed(precision);
    }
    return val;
  };

  return (
    <div className={`statistic ${className}`}>
      {title && (
        <div className="statistic-title text-sm text-gray-500 mb-1">
          {title}
        </div>
      )}
      <div className="statistic-content flex items-center" style={valueStyle}>
        {prefix && (
          <span className="statistic-prefix mr-1 text-gray-500">
            {prefix}
          </span>
        )}
        <span className="statistic-value text-2xl font-bold text-gray-900">
          {formatValue(value)}
        </span>
        {suffix && (
          <span className="statistic-suffix ml-1 text-gray-500">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
};

export default Statistic; 