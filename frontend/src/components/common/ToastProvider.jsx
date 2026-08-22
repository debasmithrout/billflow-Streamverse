// src/components/common/ToastProvider.jsx
import React, { createContext, useState, useCallback } from 'react';
import Toast from './Toast';

export const ToastContext = createContext(null);

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setToasts((prev) => [...prev, { id, message, type, duration }]);
  }, []);

  const closeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      
      {/* Toast container in top-right */}
      <div className="fixed top-6 right-6 z-99 flex flex-col gap-3 w-full max-w-sm pointer-events-none">
        {toasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <Toast
              id={t.id}
              message={t.message}
              type={t.type}
              duration={t.duration}
              onClose={closeToast}
            />
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
