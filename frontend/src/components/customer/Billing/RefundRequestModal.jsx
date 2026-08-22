import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { requestRefund } from "../../../services/customerService";
import useToast from "../../../hooks/useToast";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function RefundRequestModal({ invoice, isOpen, onClose, onSuccess }) {
  const { showToast } = useToast();
  const [reason, setReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [serverError, setServerError] = useState(null);

  if (!isOpen || !invoice) return null;

  const invoiceAmount = parseFloat(invoice.totalAmount || invoice.amount || 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidationError(null);
    setServerError(null);

    // Hardened safety pre-validation check
    if (!invoice.paymentId) {
      setValidationError("Unable to request refund: No valid payment ID found.");
      return;
    }
    if (invoiceAmount <= 0) {
      setValidationError("Unable to request refund: Refund amount must be greater than zero.");
      return;
    }
    if (reason.trim().length < 10) {
      setValidationError("Reason for refund must be at least 10 characters long.");
      return;
    }

    setSubmitting(true);
    try {
      await requestRefund(invoice.paymentId, invoiceAmount, reason.trim());
      showToast("Refund request submitted successfully.", "success");
      
      // Reset form states on success
      setReason("");
      setValidationError(null);
      setServerError(null);
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      console.error("Error submitting refund request:", err);
      const detailMsg = err.response?.data?.detail || "Failed to submit refund request. Please try again.";
      setServerError(detailMsg);
      showToast(detailMsg, "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-zinc-950 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-5 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex justify-between items-start border-b border-white/5 pb-3">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">Request Refund</h3>
              <p className="text-[11px] text-gray-500 font-mono mt-0.5">{invoice.invoiceNumber}</p>
            </div>
            <button
              onClick={onClose}
              disabled={submitting}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✕
            </button>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-xs bg-zinc-900/50 p-4 rounded-xl border border-white/5">
            <div>
              <span className="text-[9px] text-gray-500 uppercase font-black block">Billing Date</span>
              <p className="text-white font-bold mt-0.5">{invoice.date}</p>
            </div>
            <div>
              <span className="text-[9px] text-gray-500 uppercase font-black block">Total Charged</span>
              <p className="text-red-500 font-black mt-0.5">{formatCurrency(invoiceAmount, invoice.currencyCode)}</p>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
                Refund Amount (Full Refund)
              </label>
              <input
                type="text"
                readOnly
                value={formatCurrency(invoiceAmount, invoice.currencyCode)}
                className="w-full bg-zinc-900 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-gray-400 font-bold focus:outline-none cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] text-gray-400 uppercase font-black tracking-wider block">
                Reason for Refund *
              </label>
              <textarea
                rows={3}
                disabled={submitting}
                placeholder="Please describe in detail why you are requesting a refund (minimum 10 characters)..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full bg-zinc-900 border border-white/5 focus:border-red-500/30 rounded-xl px-4 py-3 text-xs text-white placeholder-gray-600 focus:outline-none resize-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            {/* Error displays */}
            {validationError && (
              <p className="text-[11px] text-red-500 font-bold text-left animate-pulse">
                ⚠️ {validationError}
              </p>
            )}
            {serverError && (
              <div className="p-3 bg-red-950/20 border border-red-500/10 rounded-xl text-[11px] text-red-400 font-medium">
                {serverError}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-3 pt-2 border-t border-white/5">
              <button
                type="button"
                onClick={onClose}
                disabled={submitting}
                className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-xs font-bold text-gray-300 rounded-xl border border-white/5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2.5 bg-red-650 hover:bg-red-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-red-900/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
              >
                {submitting ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    Submitting...
                  </>
                ) : (
                  "Submit Request"
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
