// src/components/common/RefundRequestModal.jsx
import React, { useEffect, useRef, useState } from 'react';

export default function RefundRequestModal({
  isOpen,
  onClose,
  onConfirm,
  invoiceId = '',
  amount = 0.0,
  loading = false
}) {
  const modalRef = useRef(null);
  const previousFocus = useRef(null);
  const [reason, setReason] = useState('');

  // Lock body scroll and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocus.current = document.activeElement;
      document.body.style.overflow = 'hidden';
      if (modalRef.current) {
        modalRef.current.focus();
      }
      setReason('');
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

  // Accessibility key down hooks
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) {
        onClose();
      }
      // Tab navigation loop focus trap
      if (e.key === 'Tab' && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'input:not([disabled]), textarea:not([disabled]), button:not([disabled]), [tabindex="0"]'
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
  }, [isOpen, loading, onClose]);

  if (!isOpen) return null;

  const handleOutsideClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason);
  };

  return (
    <div
      onClick={handleOutsideClick}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300 animate-fade-in"
    >
      <form
        onSubmit={handleSubmit}
        ref={modalRef}
        tabIndex="-1"
        className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 relative shadow-2xl focus:outline-none flex flex-col gap-6"
      >
        <div className="flex flex-col items-center text-center gap-4">
          <div className="w-12 h-12 rounded-full border border-violet-500/20 bg-violet-500/10 flex items-center justify-center shadow shadow-violet-500/10 text-violet-400">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">Request Refund</h3>
            <p className="text-xs text-white/50 leading-relaxed font-light">Submit a refund request for this paid statement.</p>
          </div>
        </div>

        {/* Input Details */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Invoice ID</label>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono">
                {invoiceId}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Refund Amount</label>
              <div className="bg-white/[0.02] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono font-bold">
                ₹{parseFloat(amount).toFixed(2)}
              </div>
            </div>
          </div>

          <div className="space-y-1.5 text-left">
            <label htmlFor="refund-reason" className="text-[10px] font-bold text-white/40 uppercase tracking-wider block">Reason for Refund</label>
            <textarea
              id="refund-reason"
              disabled={loading}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Provide a detailed reason for requesting a refund..."
              required
              rows={4}
              className="w-full bg-white/[0.02] border border-white/5 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.04] transition-all resize-none"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-xs font-bold text-white rounded-xl border border-white/5 transition-all cursor-pointer focus:outline-none"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading || !reason.trim()}
            className="flex-1 py-2.5 bg-violet-600 hover:bg-violet-700 disabled:bg-zinc-900 disabled:text-white/40 disabled:border-none text-xs font-bold text-white rounded-xl transition-all cursor-pointer focus:outline-none shadow-md shadow-violet-600/20"
          >
            {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </div>
      </form>
    </div>
  );
}
