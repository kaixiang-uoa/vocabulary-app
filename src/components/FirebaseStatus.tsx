import {
  CloudIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';
import React, { useState, useEffect } from 'react';

import { useAuthContext } from '../contexts/AuthContext';

export const FirebaseStatus: React.FC = () => {
  const { state } = useAuthContext();
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    if (state.user) {
      // Simple connection check - if user is logged in, Firebase is working
      setIsConnected(true);
    } else {
      setIsConnected(null);
    }
  }, [state.user]);

  if (!state.user) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 text-sm">
      <CloudIcon className="w-4 h-4 text-gray-500" />
      <span className="text-gray-600">Firebase:</span>
      {isConnected ? (
        <div className="flex items-center gap-1 text-green-600">
          <CheckCircleIcon className="w-4 h-4" />
          <span>Connected</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 text-yellow-600">
          <ExclamationTriangleIcon className="w-4 h-4" />
          <span>Checking...</span>
        </div>
      )}
    </div>
  );
};
