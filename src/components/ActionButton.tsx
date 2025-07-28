import React from 'react';
import { Button } from '../components/ui';
import { ActionButtonProps } from '../types/component.types';
import { getTailwindClass } from '../utils/styleMapping';

const ActionButton: React.FC<ActionButtonProps> = ({ 
  icon, 
  children, 
  variant = 'outline', 
  size = 'md', 
  onClick, 
  disabled = false, 
  className = '' 
}) => {
  const getButtonStyles = () => {
    const baseStyles = 'rounded-lg font-medium transition-all duration-300 border-none';
    
    switch (variant) {
      case 'primary':
        return `${baseStyles} ${getTailwindClass('btn-primary')}`;
      case 'secondary':
        return `${baseStyles} ${getTailwindClass('btn-secondary')}`;
      case 'danger':
        return `${baseStyles} ${getTailwindClass('btn-danger')}`;
      case 'outline':
      default:
        return `${baseStyles} border border-gray-300 bg-white text-gray-600 hover:border-blue-500 hover:text-blue-600`;
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return 'px-3 py-1 text-sm';
      case 'lg':
        return 'px-6 py-3 text-base';
      case 'md':
      default:
        return 'px-4 py-2 text-sm';
    }
  };

  return (
    <Button
      icon={icon}
      onClick={onClick}
      disabled={disabled}
      className={`${getButtonStyles()} ${getSizeStyles()} ${className}`}
    >
      {children}
    </Button>
  );
};

export default ActionButton; 