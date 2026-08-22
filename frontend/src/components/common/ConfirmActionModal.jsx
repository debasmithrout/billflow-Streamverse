import { useEffect, useRef, useState } from 'react';

export default function ConfirmActionModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'warning',
  loading = false,
  details = null
}) {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);
  const [cancelOption, setCancelOption] = useState('PERIOD_END'); // 'PERIOD_END' or 'IMMEDIATE'

  // Restores focus and locks body scroll
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      if (modalRef.current) {
        // focus the modal container for accessibility focus trapping
        modalRef.current.focus();
      }
    } else {
      document.body.style.overflow = '';
      if (previousFocus.current) {
        previousFocus.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Accessibility keyboard bindings (ESC, Enter, Tab Trap)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
      if (e.key === 'Enter' && !loading && e.target.tagName !== 'BUTTON' && e.target.tagName !== 'TEXTAREA') {
        e.preventDefault();
        if (variant === 'cancel') {
          onConfirm(cancelOption);
        } else {
          onConfirm();
        }
      }
      
      // Tab navigation loop focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
        );
        if (focusableElements.length === 0) return;
        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            last.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === last) {
            first.focus();
            e.preventDefault();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onClose, onConfirm, variant, cancelOption]);

  if (!isOpen) return null;

  // Background outside click close handler
  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  // Color schemas based on variant type
  const variantStyles = {
    upgrade: {
      accent: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
      glow: 'shadow-emerald-500/10',
      button: 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-500/20',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      )
    },
    downgrade: {
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      glow: 'shadow-amber-500/10',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 17h8m0 0v-8m0 8l-8-8-4 4-6-6" />
        </svg>
      )
    },
    cancel: {
      accent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      glow: 'shadow-rose-500/10',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    },
    delete: {
      accent: 'text-red-400 bg-red-500/10 border-red-500/20',
      glow: 'shadow-red-500/10',
      button: 'bg-red-600 hover:bg-red-700 shadow-red-500/20',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    },
    warning: {
      accent: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
      glow: 'shadow-amber-500/10',
      button: 'bg-amber-600 hover:bg-amber-700 shadow-amber-500/20',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    },
    'remove-payment-method': {
      accent: 'text-rose-400 bg-rose-500/10 border-rose-500/20',
      glow: 'shadow-rose-500/10',
      button: 'bg-rose-600 hover:bg-rose-700 shadow-rose-500/20',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      )
    },
    'clear-audit-logs': {
      accent: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
      glow: 'shadow-yellow-500/10',
      button: 'bg-yellow-600 hover:bg-yellow-700 shadow-yellow-500/20',
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
        </svg>
      )
    }
  };

  const style = variantStyles[variant] || variantStyles.warning;

  return (
    <div
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
    >
      <div
        ref={modalRef}
        tabIndex="-1"
        className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl focus:outline-none flex flex-col gap-6"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className={`w-12 h-12 rounded-full border flex items-center justify-center shadow ${style.accent} ${style.glow}`}>
            {style.icon}
          </div>
          
          <div className="space-y-1.5">
            <h3 className="text-lg font-black text-white">{title}</h3>
            <p className="text-xs text-white/50 leading-relaxed font-light">{description}</p>
          </div>
        </div>

        {/* Upgrade Details Panel */}
        {variant === 'upgrade' && details && (
          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-2.5 text-xs text-white/70">
            <div className="flex justify-between">
              <span>Current Plan:</span>
              <span className="font-bold text-white">{details.currentPlan}</span>
            </div>
            <div className="flex justify-between">
              <span>New Plan:</span>
              <span className="font-bold text-white">{details.newPlan}</span>
            </div>
            {details.isProrated && (
              <>
                <div className="flex justify-between">
                  <span>Proration Charge:</span>
                  <span className="font-mono text-gray-200">{details.currencySymbol}{parseFloat(details.prorationDebit || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-emerald-400">
                  <span>Proration Credit:</span>
                  <span className="font-mono">-{details.currencySymbol}{parseFloat(details.prorationCredit || 0).toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t border-white/5 pt-2">
                  <span>Net Proration:</span>
                  <span className="font-mono text-gray-200">{details.currencySymbol}{parseFloat(details.netProration || 0).toFixed(2)}</span>
                </div>
              </>
            )}
            <div className="flex justify-between border-t border-white/5 pt-2">
              <span>{details.taxName || "Tax"} ({details.taxPercentage || 0}%):</span>
              <span className="font-mono text-gray-200">{details.currencySymbol}{parseFloat(details.taxAmount || details.gstAmount || 0).toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-white/5 pt-2 text-white font-bold">
              <span>Total Price (with {details.taxName || "Tax"}):</span>
              <span className="font-black text-purple-400">{details.currencySymbol}{parseFloat(details.totalAmount || 0).toFixed(2)}</span>
            </div>
          </div>
        )}

        {/* Downgrade Warning details */}
        {variant === 'downgrade' && details && (
          <div className="bg-amber-950/10 border border-amber-500/10 rounded-xl p-4 text-xs text-amber-300/80 leading-relaxed">
            <div className="flex gap-2">
              <svg className="w-5 h-5 shrink-0 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-bold text-white block mb-1">Downgrade Note</span>
                Some premium features, such as 4K resolution and concurrent streams limits, may become unavailable once the downgrade takes effect.
              </div>
            </div>
          </div>
        )}

        {/* Cancel Subscription Options */}
        {variant === 'cancel' && (
          <div className="flex flex-col gap-3">
            {details?.renewalDate && (
              <div className="text-[11px] text-white/40 text-center font-light bg-white/[0.01] border border-white/5 py-2 rounded-lg">
                Current Billing Cycle ends on <span className="font-bold text-white/60">{details.renewalDate}</span>
              </div>
            )}
            
            <label className="flex items-start gap-3 p-3.5 bg-white/[0.01] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-colors">
              <input
                type="radio"
                name="cancelOption"
                checked={cancelOption === 'PERIOD_END'}
                onChange={() => setCancelOption('PERIOD_END')}
                className="mt-0.5 text-purple-600 focus:ring-purple-600"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Cancel at Period End</span>
                <span className="text-[11px] text-white/50 leading-relaxed block font-light">
                  Your premium access remains active until the end of the current billing cycle. Auto-renewal is disabled.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3.5 bg-white/[0.01] border border-white/5 rounded-xl cursor-pointer hover:bg-white/[0.03] transition-colors">
              <input
                type="radio"
                name="cancelOption"
                checked={cancelOption === 'IMMEDIATE'}
                onChange={() => setCancelOption('IMMEDIATE')}
                className="mt-0.5 text-rose-600 focus:ring-rose-600"
              />
              <div className="text-left">
                <span className="text-xs font-bold text-white block">Cancel Immediately</span>
                <span className="text-[11px] text-white/50 leading-relaxed block font-light">
                  Revoke billing and cancel access immediately. No refunds for unused days.
                </span>
              </div>
            </label>
          </div>
        )}

        {/* Buttons Action footer */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs font-bold text-white rounded-xl border border-white/5 transition-all cursor-pointer focus:outline-none"
          >
            {cancelText}
          </button>
          
          <button
            type="button"
            disabled={loading}
            onClick={() => {
              if (variant === 'cancel') {
                onConfirm(cancelOption);
              } else {
                onConfirm();
              }
            }}
            className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl transition-all cursor-pointer focus:outline-none shadow-md disabled:bg-zinc-900 disabled:text-white/40 disabled:border-none ${style.button}`}
          >
            {loading ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
