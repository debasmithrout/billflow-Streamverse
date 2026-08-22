// src/components/customer/Billing/InvoiceHistoryTable.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { downloadInvoice } from "../../../services/customerService";
import EmptyState from "../Shared/EmptyState";
import useToast from "../../../hooks/useToast";
import RefundRequestModal from "./RefundRequestModal";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function InvoiceHistoryTable({ invoices = [], externalSelectedInvoice, onClearSelectedInvoice, onRefresh }) {
  const { showToast } = useToast();
  const [internalSelectedInvoice, setInternalSelectedInvoice] = useState(null);
  const [refundingInvoice, setRefundingInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [copied, setCopied] = useState(false);

  const selectedInvoice = externalSelectedInvoice || internalSelectedInvoice;

  const handleCloseModal = () => {
    setInternalSelectedInvoice(null);
    if (onClearSelectedInvoice) {
      onClearSelectedInvoice();
    }
  };

  const handleRefundClick = (inv) => {
    if (!inv.isRefundable) return;
    if (!inv.paymentId) {
      showToast("Unable to request refund: No valid payment ID found.", "error");
      return;
    }
    setRefundingInvoice(inv);
  };

  const handleRefundSuccess = () => {
    setRefundingInvoice(null);
    if (onRefresh) {
      onRefresh();
    }
  };

  const userString = localStorage.getItem("current_user");
  const user = userString ? JSON.parse(userString) : { name: "Customer", email: "" };

  const handleDownload = async (invoiceId, invoiceNumber) => {
    try {
      setDownloadingId(invoiceNumber);
      await downloadInvoice(invoiceId);
      showToast("Invoice downloaded successfully.", "success");
    } catch (err) {
      console.error("Error downloading invoice:", err);
      showToast("Failed to download PDF invoice. Please try again.", "error");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!invoices || invoices.length === 0) {
    return <EmptyState message="No Invoices Available" iconType="billing" />;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: "easeOut" }}
      className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl shadow-black/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2.5">
          Invoice History
          <span className="px-2 py-0.5 text-[10px] bg-red-600 text-white rounded-full font-black shadow-sm shadow-red-900/50">
            {invoices.length}
          </span>
        </h3>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[650px]">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-gray-400 uppercase tracking-widest font-black">
              <th className="py-3 px-4">INVOICE</th>
              <th className="py-3 px-4">DATE</th>
              <th className="py-3 px-4">PLAN</th>
              <th className="py-3 px-4">AMOUNT</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">RETRY STATUS</th>
              <th className="py-3 px-4 text-right">ACTION</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr
                key={inv.invoiceNumber || inv.id}
                className="hover:bg-white/[0.02] transition-colors text-xs"
              >
                <td className="py-4 px-4 font-mono font-medium text-white">
                  {inv.invoiceNumber}
                </td>
                <td className="py-4 px-4 text-gray-300 font-medium">{inv.date}</td>
                <td className="py-4 px-4 text-gray-200 font-bold">
                  {inv.planName}
                </td>
                <td className="py-4 px-4 text-white font-black">
                  {formatCurrency(inv.totalAmount || inv.amount || 0, inv.currencyCode)}
                </td>
                <td className="py-4 px-4">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wide ${
                    inv.status === "PAID"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : inv.status === "FAILED"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : inv.status === "PAST_DUE" || inv.status === "UNPAID"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-zinc-500/10 text-zinc-400 border-zinc-500/20"
                  }`}>
                    {inv.status || "PAID"}
                  </span>
                </td>
                <td className="py-4 px-4">
                  {inv.status === "FAILED" || inv.status === "PAST_DUE" || inv.retryStatus ? (
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black border uppercase tracking-wide ${
                      inv.retryStatus === "SUCCESS" || inv.retryStatus === "RECOVERED"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : inv.retryStatus === "EXHAUSTED" || inv.retryStatus === "FAILED"
                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {inv.retryStatus || "Scheduled"}
                    </span>
                  ) : (
                    <span className="text-zinc-600">—</span>
                  )}
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  {inv.isRefundable && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      type="button"
                      onClick={() => handleRefundClick(inv)}
                      className="px-3 py-1.5 bg-red-650/10 hover:bg-red-650/20 text-red-500 font-bold rounded-lg border border-red-500/10 text-[11px] transition-all cursor-pointer focus:outline-none"
                    >
                      Request Refund
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    onClick={() => setInternalSelectedInvoice(inv)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[11px] text-gray-200 font-bold rounded-lg border border-white/10 transition-all cursor-pointer focus:outline-none"
                  >
                    View
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="button"
                    disabled={downloadingId === inv.invoiceNumber}
                    onClick={() => handleDownload(inv.id, inv.invoiceNumber)}
                    className="p-1.5 bg-zinc-800 hover:bg-red-600 disabled:bg-zinc-800 text-gray-300 hover:text-white rounded-lg border border-white/10 transition-all cursor-pointer inline-flex items-center justify-center focus:outline-none"
                    title="Download PDF"
                  >
                    {downloadingId === inv.invoiceNumber ? (
                      <span className="text-[9px] font-mono">...</span>
                    ) : (
                      <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                        <path d="M13 8V2H7v6H2l8 8 8-8h-5zM0 18h20v2H0v-2z" />
                      </svg>
                    )}
                  </motion.button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Invoice View Modal */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-zinc-950 border border-white/10 rounded-2xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative"
            >
              {/* Header */}
              <div className="flex justify-between items-start border-b border-white/5 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black text-white tracking-tight">
                      Tax Invoice
                    </h3>
                    <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px] font-black uppercase">
                      {selectedInvoice.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 font-mono mt-1 flex items-center gap-2">
                    {selectedInvoice.invoiceNumber}
                    <button
                      onClick={() => handleCopy(selectedInvoice.invoiceNumber)}
                      className="text-gray-500 hover:text-white transition-colors"
                      title="Copy Invoice Number"
                    >
                      {copied ? "✓ Copied" : "📋"}
                    </button>
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
                >
                  ✕
                </button>
              </div>

              {/* Customer & Billing Info */}
              <div className="grid grid-cols-3 gap-4 text-xs bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-black block">
                    Billed To
                  </span>
                  <p className="text-white font-bold mt-1">{user.name}</p>
                  <p className="text-gray-400 truncate">{user.email}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-black block">
                    Billing Date
                  </span>
                  <p className="text-white font-bold mt-1">
                    {selectedInvoice.date}
                  </p>
                  <p className="text-gray-400">{selectedInvoice.invoiceType}</p>
                </div>
                <div>
                  <span className="text-[10px] text-gray-500 uppercase font-black block">
                    Payment Method
                  </span>
                  <p className="text-white font-bold mt-1">
                    {selectedInvoice.paymentMethod || "-"}
                  </p>
                </div>
              </div>

              {/* Retry Information */}
              {(selectedInvoice.status !== "PAID" || selectedInvoice.retryStatus) && (
                <div className="space-y-2 text-xs bg-red-500/5 p-4 rounded-xl border border-red-500/10">
                  <span className="text-[10px] text-red-400 uppercase font-black block tracking-wider">
                    Payment Retry Information
                  </span>
                  <div className="grid grid-cols-2 gap-y-2 mt-1">
                    <div>
                      <span className="text-[10px] text-gray-500 block">Retry Status</span>
                      <span className="text-amber-400 font-bold uppercase text-[10px]">{selectedInvoice.retryStatus || "Scheduled"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Attempt Count</span>
                      <span className="text-white font-bold">{selectedInvoice.retryAttempt || 1} / {selectedInvoice.maxAttempts || 3}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Next Retry Time</span>
                      <span className="text-zinc-300 font-mono">{selectedInvoice.nextRetryDate ? new Date(selectedInvoice.nextRetryDate).toLocaleDateString() : "Within 24 hours"}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-gray-500 block">Last Attempted</span>
                      <span className="text-zinc-400 font-mono">{selectedInvoice.lastRetryDate ? new Date(selectedInvoice.lastRetryDate).toLocaleString() : "No attempts yet"}</span>
                    </div>
                  </div>
                  {selectedInvoice.failureReason && (
                    <div className="pt-2 border-t border-white/5 mt-1">
                      <span className="text-[10px] text-gray-500 block">Failure Reason</span>
                      <p className="text-[11px] text-red-400 font-mono mt-0.5">{selectedInvoice.failureReason}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Line Item Breakdown */}
              <div className="space-y-3">
                <span className="text-[10px] text-gray-500 uppercase font-black block tracking-wider">
                  Summary
                </span>
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-gray-300">
                    <span>{selectedInvoice.planName} Plan (Base)</span>
                    <span className="font-mono">
                      {formatCurrency(selectedInvoice.baseAmount || 0, selectedInvoice.currencyCode)}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-400 text-[11px]">
                    <span>{selectedInvoice.taxName || "GST"} ({selectedInvoice.taxPercentage !== undefined ? selectedInvoice.taxPercentage : (selectedInvoice.gstPercentage || 18)}%)</span>
                    <span className="font-mono">
                      {formatCurrency(selectedInvoice.taxAmount || selectedInvoice.gstAmount || 0, selectedInvoice.currencyCode)}
                    </span>
                  </div>
                  <div className="flex justify-between text-white font-black text-sm pt-2 border-t border-white/5">
                    <span>Total Amount Charged</span>
                    <span className="font-mono text-red-500">
                      {formatCurrency(selectedInvoice.totalAmount || 0, selectedInvoice.currencyCode)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex justify-end gap-3 pt-4 border-t border-white/5">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-gray-300 rounded-xl transition-all cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() =>
                    handleDownload(
                      selectedInvoice.id,
                      selectedInvoice.invoiceNumber
                    )
                  }
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                >
                  Download PDF
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <RefundRequestModal
        invoice={refundingInvoice}
        isOpen={refundingInvoice !== null}
        onClose={() => setRefundingInvoice(null)}
        onSuccess={handleRefundSuccess}
      />
    </motion.div>
  );
}
