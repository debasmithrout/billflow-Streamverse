// src/components/customer/Subscription/CancelSubscriptionModal.jsx

export default function CancelSubscriptionModal({ isOpen, onClose, onConfirm, isCancelling }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 relative animate-fade-in shadow-2xl space-y-6">
        {/* Warning Icon Banner */}
        <div className="text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-650/10 border border-red-650/25 flex items-center justify-center mx-auto text-red-500 shadow shadow-red-500/10 animate-bounce">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          <div className="space-y-1">
            <h3 className="text-lg font-black text-white">Cancel Subscription?</h3>
            <p className="text-xs text-gray-500 font-light max-w-sm mx-auto leading-relaxed">
              We're sad to see you go! You will lose access to all premium 4K video streams and features at the end of your billing cycle.
            </p>
          </div>
        </div>

        {/* Buttons Action */}
        <div className="flex gap-3">
          <button
            type="button"
            disabled={isCancelling}
            onClick={onClose}
            className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-white rounded-xl border border-white/5 transition-all cursor-pointer focus:outline-none"
          >
            Keep Subscription
          </button>
          
          <button
            type="button"
            disabled={isCancelling}
            onClick={onConfirm}
            className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-900 text-xs font-bold text-white rounded-xl transition-all cursor-pointer focus:outline-none shadow-md shadow-red-600/15"
          >
            {isCancelling ? "Cancelling..." : "Confirm Cancel"}
          </button>
        </div>
      </div>
    </div>
  );
}
