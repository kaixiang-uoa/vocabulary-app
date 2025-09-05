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
  placement = 'bottom',
  trigger = 'hover',
  className = '',
  style,
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

    // Find the actual button element within the trigger
    const buttonElement =
      triggerRef.current.querySelector('button') || triggerRef.current;
    const triggerRect = buttonElement.getBoundingClientRect();

    // Get viewport dimensions
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Estimate popup size
    const estimatedWidth = 320;
    const estimatedHeight = 140;

    let top = 0;
    let left = 0;

    // Calculate initial position based on placement
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
      default:
        top = triggerRect.bottom + 8;
        left = triggerRect.left + (triggerRect.width - estimatedWidth) / 2;
    }

    // Ensure popup stays within viewport bounds
    // Adjust horizontal position
    if (left + estimatedWidth > viewportWidth - 16) {
      left = viewportWidth - estimatedWidth - 16;
    }
    if (left < 16) {
      left = 16;
    }

    // Adjust vertical position - simplified logic
    if (top + estimatedHeight > viewportHeight - 16) {
      // If bottom overflow, show above
      top = triggerRect.top - estimatedHeight - 8;
      // If above also doesn't fit, center it
      if (top < 16) {
        top = Math.max(16, (viewportHeight - estimatedHeight) / 2);
      }
    }
    if (top < 16) {
      // If top overflow, show below
      top = triggerRect.bottom + 8;
      // If below also doesn't fit, center it
      if (top + estimatedHeight > viewportHeight - 16) {
        top = Math.max(16, (viewportHeight - estimatedHeight) / 2);
      }
    }

    setPosition({ top, left });
    setIsVisible(true);
  };

  const hidePopup = () => {
    setIsVisible(false);
  };

  const handleConfirm = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (onConfirm) {
      onConfirm();
    }
    // Force delayed close to ensure callback execution completes
    setTimeout(() => {
      hidePopup();
    }, 0);
  };

  const handleCancel = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    hidePopup();
    onCancel?.();
  };

  // Refine position after popup is rendered
  useEffect(() => {
    if (isVisible && popupRef.current && triggerRef.current) {
      const popupRect = popupRef.current.getBoundingClientRect();

      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let { top, left } = position;

      // Simple boundary adjustments
      if (left + popupRect.width > viewportWidth - 16) {
        left = viewportWidth - popupRect.width - 16;
      }
      if (left < 16) {
        left = 16;
      }

      if (top + popupRect.height > viewportHeight - 16) {
        top = viewportHeight - popupRect.height - 16;
      }
      if (top < 16) {
        top = 16;
      }

      if (top !== position.top || left !== position.left) {
        setPosition({ top, left });
      }
    }
  }, [isVisible, position]);

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
      onClick={trigger === 'click' ? e => showPopup(e) : undefined}
      className={className}
      style={style}
    >
      {children}
      {isVisible && (
        <div
          ref={popupRef}
          className="fixed z-50 bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-64"
          style={{
            top: position.top,
            left: position.left,
            animation: 'fadeIn 0.2s ease-out',
          }}
        >
          <div className="mb-4">
            <div className="text-sm font-semibold text-gray-900 mb-2">
              {title}
            </div>
            {description && (
              <div className="text-sm text-gray-600 leading-relaxed">
                {description}
              </div>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              size="small"
              onClick={handleCancel}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-md transition-colors"
            >
              {cancelText}
            </Button>
            <Button
              type="primary"
              size="small"
              onClick={handleConfirm}
              danger
              className="px-3 py-1.5 text-sm font-medium"
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
