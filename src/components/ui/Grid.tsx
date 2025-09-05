import React from 'react';

export interface RowProps {
  children: React.ReactNode;
  gutter?: number | [number, number];
  justify?: 'start' | 'end' | 'center' | 'space-around' | 'space-between';
  align?: 'top' | 'middle' | 'bottom';
  className?: string;
  style?: React.CSSProperties;
}

export interface ColProps {
  children: React.ReactNode;
  span?: number;
  offset?: number;
  className?: string;
  style?: React.CSSProperties;
  gutter?: number;
}

const Row: React.FC<RowProps> = ({
  children,
  gutter = 0,
  justify = 'start',
  align = 'top',
  className = '',
  style,
}) => {
  const gutterValue = Array.isArray(gutter) ? gutter[0] : gutter;
  const gutterStyle =
    gutterValue > 0
      ? { marginLeft: -gutterValue / 2, marginRight: -gutterValue / 2 }
      : {};

  const justifyClasses = {
    start: 'justify-start',
    end: 'justify-end',
    center: 'justify-center',
    'space-around': 'justify-around',
    'space-between': 'justify-between',
  };

  const alignClasses = {
    top: 'items-start',
    middle: 'items-center',
    bottom: 'items-end',
  };

  const classes = `flex flex-wrap ${justifyClasses[justify]} ${alignClasses[align]} ${className}`;

  return (
    <div className={classes} style={{ ...gutterStyle, ...style }}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          const props = { ...(child.props as object), gutter: gutterValue };
          return React.cloneElement(child, props);
        }
        return child;
      })}
    </div>
  );
};

const Col: React.FC<ColProps> = ({
  children,
  span = 24,
  offset = 0,
  className = '',
  style,
  gutter = 0,
}) => {
  const width = (span / 24) * 100;
  const marginLeft = (offset / 24) * 100;
  const padding = gutter > 0 ? gutter / 2 : 0;

  const classes = `flex-shrink-0 ${className}`;

  return (
    <div
      className={classes}
      style={{
        width: `${width}%`,
        marginLeft: marginLeft > 0 ? `${marginLeft}%` : undefined,
        paddingLeft: padding,
        paddingRight: padding,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export { Row, Col };
