import React, { useEffect } from "react";

export interface ModalProps {
  visible?: boolean;
  open?: boolean;
  title?: React.ReactNode;
  children: React.ReactNode;
  onOk?: () => void;
  onCancel?: () => void;
  okText?: React.ReactNode;
  cancelText?: React.ReactNode;
  okButtonProps?: any;
  cancelButtonProps?: any;
  width?: number | string;
  centered?: boolean;
  maskClosable?: boolean;
  className?: string;
  footer?: React.ReactNode;
  destroyOnClose?: boolean;
}

const Modal: React.FC<ModalProps> = ({
  visible,
  open,
  title,
  children,
  onOk,
  onCancel,
  okText = "确定",
  cancelText = "取消",
  okButtonProps = {},
  cancelButtonProps = {},
  width = 520,
  centered = true,
  maskClosable = true,
  className = "",
  footer,
  destroyOnClose,
}) => {
  const isVisible = visible !== undefined ? visible : open;
  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const handleMaskClick = () => {
    if (maskClosable && onCancel) {
      onCancel();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape" && onCancel) {
      onCancel();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleMaskClick}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className={`relative bg-white rounded-lg shadow-xl max-w-full ${className}`}
          style={{ width: typeof width === "number" ? `${width}px` : width }}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              )}
            </div>
          )}

          {/* Content */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer !== undefined
            ? footer
            : (onOk || onCancel) && (
                <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200">
                  {onCancel && (
                    <button
                      onClick={onCancel}
                      className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                      {...cancelButtonProps}
                    >
                      {cancelText}
                    </button>
                  )}
                  {onOk && (
                    <button
                      onClick={onOk}
                      className="px-4 py-2 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 transition-all shadow-md hover:shadow-lg"
                      {...okButtonProps}
                    >
                      {okText}
                    </button>
                  )}
                </div>
              )}
        </div>
      </div>
    </div>
  );
};

export default Modal;
