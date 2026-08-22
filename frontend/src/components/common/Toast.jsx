// src/components/common/Toast.jsx
import React, { useEffect } from 'react';

export default function Toast({ id, message, type = 'info', duration = 4000, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(id);
    }, duration);
    return () => clearTimeout(timer);
  }, [id, duration, onClose]);

  // Color styles based on type
  const typeStyles = {
    success: {
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-950/40',
      glow: 'shadow-emerald-500/5',
      iconColor: 'text-emerald-400',
      progress: 'bg-emerald-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    error: {
      border: 'border-rose-500/20',
      bg: 'bg-rose-950/40',
      glow: 'shadow-rose-500/5',
      iconColor: 'text-rose-400',
      progress: 'bg-rose-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    warning: {
      border: 'border-amber-500/20',
      bg: 'bg-amber-950/40',
      glow: 'shadow-amber-500/5',
      iconColor: 'text-amber-400',
      progress: 'bg-amber-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    info: {
      border: 'border-violet-500/20',
      bg: 'bg-violet-950/40',
      glow: 'shadow-violet-500/5',
      iconColor: 'text-violet-400',
      progress: 'bg-violet-500',
      icon: (
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  };

  const style = typeStyles[type] || typeStyles.info;

  return (
    <div
      role="alert"
      className={`flex flex-col w-full max-w-sm ${style.bg} backdrop-blur-md border ${style.border} ${style.glow} rounded-xl shadow-2xl overflow-hidden animate-slide-in-right relative`}
    >
      <div className="flex items-start gap-3 p-4">
        <span className={`shrink-0 ${style.iconColor}`}>{style.icon}</span>
        <div className="flex-1 text-xs font-semibold text-white/90 leading-normal pr-4">
          {message}
        </div>
        <button
          type="button"
          onClick={() => onClose(id)}
          className="shrink-0 text-white/40 hover:text-white/80 transition-colors focus:outline-none cursor-pointer"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      
      {/* Visual countdown progress line */}
      <div className="w-full h-0.5 bg-white/5">
        <div 
          className={`h-full ${style.progress} transition-all ease-linear`}
          style={{
            animation: `toast-progress ${duration}ms linear forwards`
          }}
        />
      </div>
    </div>
  );
}
