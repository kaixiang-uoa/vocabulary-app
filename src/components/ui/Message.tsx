import React from 'react';
import { createRoot } from 'react-dom/client';

export interface MessageConfig {
  content: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
  onClose?: () => void;
}

let messageContainer: HTMLDivElement | null = null;

const createMessageContainer = () => {
  if (messageContainer) return messageContainer;
  
  messageContainer = document.createElement('div');
  messageContainer.className = 'fixed top-4 right-4 z-50 flex flex-col gap-2';
  document.body.appendChild(messageContainer);
  return messageContainer;
};

const removeMessageContainer = () => {
  if (messageContainer && messageContainer.children.length === 0) {
    document.body.removeChild(messageContainer);
    messageContainer = null;
  }
};

const Message: React.FC<MessageConfig> = ({ content, type = 'info', duration = 3, onClose }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  React.useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300);
    }, duration * 1000);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const typeClasses = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };

  const iconClasses = {
    success: 'text-green-500',
    error: 'text-red-500',
    warning: 'text-yellow-500',
    info: 'text-blue-500',
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 'error':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
    }
  };

  return (
    <div
      className={`flex items-center gap-3 p-4 rounded-lg border transition-all duration-300 ${
        typeClasses[type]
      } ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
    >
      <div className={iconClasses[type]}>{getIcon()}</div>
      <span className="text-sm font-medium">{content}</span>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-auto text-gray-400 hover:text-gray-600"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
};

// Static methods
const message = {
  success: (content: string, duration?: number) => {
    const container = createMessageContainer();
    const div = document.createElement('div');
    container.appendChild(div);
    
    const onClose = () => {
      container.removeChild(div);
      removeMessageContainer();
    };
    
    const root = createRoot(div);
    root.render(<Message content={content} type="success" duration={duration} onClose={onClose} />);
  },
  
  error: (content: string, duration?: number) => {
    const container = createMessageContainer();
    const div = document.createElement('div');
    container.appendChild(div);
    
    const onClose = () => {
      container.removeChild(div);
      removeMessageContainer();
    };
    
    const root = createRoot(div);
    root.render(<Message content={content} type="error" duration={duration} onClose={onClose} />);
  },
  
  warning: (content: string, duration?: number) => {
    const container = createMessageContainer();
    const div = document.createElement('div');
    container.appendChild(div);
    
    const onClose = () => {
      container.removeChild(div);
      removeMessageContainer();
    };
    
    const root = createRoot(div);
    root.render(<Message content={content} type="warning" duration={duration} onClose={onClose} />);
  },
  
  info: (content: string, duration?: number) => {
    const container = createMessageContainer();
    const div = document.createElement('div');
    container.appendChild(div);
    
    const onClose = () => {
      container.removeChild(div);
      removeMessageContainer();
    };
    
    const root = createRoot(div);
    root.render(<Message content={content} type="info" duration={duration} onClose={onClose} />);
  },
};

export default Message;
export { message }; 