import React, { useState, useRef, useEffect } from 'react';
import Button from './Button';

export interface PopconfirmProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  onConfirm?: () => void;
  onCancel?: () => void;
  okText?: string;
  cancelText?: string;
  children: React.ReactNode;
  placement?: 'top' | 'bottom' | 'left' | 'right';
  trigger?: 'hover' | 'click';
  className?: string;
  style?: React.CSSProperties;
}

const Popconfirm: React.FC<PopconfirmProps> = ({
  title = 'Are you sure?',
  description,
  onConfirm,
  onCancel,
  okText = 'Yes',
  cancelText = 'No',
  children,
  placement = 'top',
  trigger = 'hover',
  className = '',
  style
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  const showPopup = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    if (!triggerRef.current) return;
    
    const triggerRect = triggerRef.current.getBoundingClientRect();
    
    let top = 0;
    let left = 0;
    
    // Estimate popup size for positioning
    const estimatedWidth = 280;
    const estimatedHeight = 120;
    
    switch (placement) {
      case 'top':
        top = triggerRect.top - estimatedHeight - 8;
        left = triggerRect.left + (triggerRect.width - estimatedWidth) / 2;
        break;
      case 'bottom':
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - estimatedWidth) / 2;
        break;
      case 'left':
        top = triggerRect.top + (triggerRect.height - estimatedHeight) / 2;
        left = triggerRect.left - estimatedWidth - 8;
        break;
      case 'right':
        top = triggerRect.top + (triggerRect.height - estimatedHeight) / 2;
        left = triggerRect.right + 8;
        break;
    }
    
    setPosition({ top, left });
    setIsVisible(true);
  };

  const hidePopup = () => {
    setIsVisible(false);
  };

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
         // Force delayed close to ensure callback execution completes
     setTimeout(() => {
       hidePopup();
     }, 0);
  };

  const handleCancel = () => {
    hidePopup();
    onCancel?.();
  };

  useEffect(() => {
    if (isVisible) {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          triggerRef.current &&
          !triggerRef.current.contains(event.target as Node) &&
          popupRef.current &&
          !popupRef.current.contains(event.target as Node)
        ) {
          hidePopup();
        }
      };
      
      const handleScroll = () => hidePopup();
      const handleResize = () => hidePopup();
      
      document.addEventListener('mousedown', handleClickOutside);
      window.addEventListener('scroll', handleScroll);
      window.addEventListener('resize', handleResize);
      
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', handleResize);
      };
    }
  }, [isVisible]);

  return (
    <div
      ref={triggerRef}
      onMouseEnter={trigger === 'hover' ? showPopup : undefined}
      onMouseLeave={trigger === 'hover' ? hidePopup : undefined}
      onClick={trigger === 'click' ? (e) => showPopup(e) : undefined}
      className={className}
      style={style}
    >
      {children}
      {isVisible && (
        <div
          ref={popupRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-64"
          style={{
            top: position.top,
            left: position.left,
          }}
        >
          <div className="mb-3">
            <div className="text-sm font-medium text-gray-900 mb-1">
              {title}
            </div>
            {description && (
              <div className="text-sm text-gray-600">
                {description}
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button
              size="small"
              onClick={handleCancel}
              className="text-gray-600 hover:text-gray-800"
            >
              {cancelText}
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={handleConfirm}
              danger
            >
              {okText}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popconfirm; 