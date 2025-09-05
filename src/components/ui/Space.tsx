import React from 'react';

export interface SpaceProps {
  children: React.ReactNode;
  direction?: 'horizontal' | 'vertical';
  size?: 'small' | 'medium' | 'large' | number | 'middle';
  align?: 'start' | 'end' | 'center' | 'baseline';
  wrap?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Space: React.FC<SpaceProps> = ({
  children,
  direction = 'horizontal',
  size = 'medium',
  align = 'start',
  wrap = false,
  className = '',
  style,
}) => {
  const sizeValue =
    typeof size === 'number'
      ? size
      : size === 'small'
        ? 8
        : size === 'large'
          ? 16
          : size === 'middle'
            ? 12
            : 12;

  const directionClasses = {
    horizontal: 'flex flex-row',
    vertical: 'flex flex-col',
  };

  const alignClasses = {
    start: 'items-start',
    end: 'items-end',
    center: 'items-center',
    baseline: 'items-baseline',
  };

  const classes = `${directionClasses[direction]} ${alignClasses[align]} ${wrap ? 'flex-wrap' : ''} ${className}`;

  const spaceStyle = {
    gap: `${sizeValue}px`,
    ...style,
  };

  return (
    <div className={classes} style={spaceStyle}>
      {children}
    </div>
  );
};

export default Space;
