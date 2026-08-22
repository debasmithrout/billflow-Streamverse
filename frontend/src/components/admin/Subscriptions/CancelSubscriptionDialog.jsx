// src/components/admin/Subscriptions/CancelSubscriptionDialog.jsx
import { useState } from "react";

export default function CancelSubscriptionDialog({ isOpen, subscription, onConfirm, onCancel }) {
  const [cancelType, setCancelType] = useState("immediate");

  if (!isOpen || !subscription) return null;

  const handleConfirmSubmit = () => {
    onConfirm(subscription.id, cancelType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onCancel} 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Dialog Frame */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-sm p-6 shadow-2xl z-10 animate-fade-in origin-center">
        
        {/* Warning Icon Banner */}
        <div className="mx-auto w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mb-4">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-center text-sm font-bold text-white tracking-tight">
          Cancel Customer Subscription?
        </h3>

        <p className="text-center text-xs text-gray-500 font-light mt-2 leading-relaxed">
          Select the cancellation strategy for <span className="font-semibold text-gray-300">{subscription.customerName}</span>'s plan.
        </p>

        {/* Strategy Select options */}
        <div className="mt-4 space-y-2.5">
          <label className="flex items-start gap-3 p-3 bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 rounded-xl cursor-pointer select-none">
            <input
              type="radio"
              name="cancelType"
              value="immediate"
              checked={cancelType === "immediate"}
              onChange={() => setCancelType("immediate")}
              className="mt-1 accent-red-650 cursor-pointer"
            />
            <div className="text-xs">
              <span className="text-white font-bold block">Cancel Immediately</span>
              <span className="text-gray-500 font-light block mt-0.5">Access is revoked immediately. No refunds are processed automatically.</span>
            </div>
          </label>

          {subscription.renewalDate && (
            <label className="flex items-start gap-3 p-3 bg-zinc-900/40 hover:bg-zinc-900 border border-white/5 rounded-xl cursor-pointer select-none">
              <input
                type="radio"
                name="cancelType"
                value="cycle"
                checked={cancelType === "cycle"}
                onChange={() => setCancelType("cycle")}
                className="mt-1 accent-red-650 cursor-pointer"
              />
              <div className="text-xs">
                <span className="text-white font-bold block">Cancel at End of Billing Cycle</span>
                <span className="text-gray-500 font-light block mt-0.5">
                  Subscription will remain active until the renewal date: <span className="font-mono text-gray-300 font-medium">{subscription.renewalDate}</span>.
                </span>
              </div>
            </label>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex gap-3 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors"
          >
            Go Back
          </button>
          <button
            type="button"
            onClick={handleConfirmSubmit}
            className="flex-1 py-2.5 bg-red-650 hover:bg-red-755 text-xs font-bold text-white rounded-xl cursor-pointer focus:outline-none transition-colors"
          >
            Cancel Plan
          </button>
        </div>
      </div>
    </div>
  );
}
