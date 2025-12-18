"use client";
import { createContext, useContext, useState, useEffect, ReactNode, useMemo } from 'react';

interface ToastContextProps {
  showToast: (message: string) => void;
}

const ToastContext = createContext<ToastContextProps | undefined>(undefined);

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const [toast, setToast] = useState<string>('');
  const [visible, setVisible] = useState(false);

  const showToast = (message: string) => {
    setToast(message);
    setVisible(true);
  };

  const contextValue = useMemo(() => ({ showToast }), []);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {visible && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[var(--bg-inverse,#1f2937)] text-[var(--text-inverse,#ffffff)] px-4 py-2 rounded-lg shadow-lg transition-opacity duration-300 opacity-90" role="alert">
          {toast}
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
