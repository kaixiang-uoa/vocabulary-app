import React, { createContext, useContext, useEffect } from 'react';

import { useWordOperations } from '../hooks/useWordOperations';

import { useAuthContext } from './AuthContext';

// Use the exact return type of useWordOperations to avoid duplicating types
type WordContextValue = ReturnType<typeof useWordOperations>;

const WordContext = createContext<WordContextValue | null>(null);

export const WordProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const ops = useWordOperations();
  const { state } = useAuthContext();

  // Ensure initial data load once at app start
  useEffect(() => {
    ops.loadData().catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Reload when auth user changes (data source switch, cache cleared in AuthContext)
  useEffect(() => {
    if (!state.loading) {
      ops.loadData().catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.user, state.loading]);

  // Centralized visibility/focus refresh
  useEffect(() => {
    const onFocus = () => ops.loadData().catch(() => {});
    const onVisible = () => {
      if (document.visibilityState === 'visible') {
        ops.loadData().catch(() => {});
      }
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <WordContext.Provider value={ops}>{children}</WordContext.Provider>;
};

export const useWordContext = (): WordContextValue => {
  const ctx = useContext(WordContext);
  if (!ctx) {
    throw new Error('useWordContext must be used within a WordProvider');
  }
  return ctx;
};
