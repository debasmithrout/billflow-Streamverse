// src/components/customer/Billing/InvoiceTable.jsx
import { useState } from "react";
import { downloadInvoice } from "../../../services/customerService";
import EmptyState from "../Shared/EmptyState";
import useToast from "../../../hooks/useToast";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function InvoiceTable({ invoices = [] }) {
  const { showToast } = useToast();
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [copied, setCopied] = useState(false);



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
    <div className="bg-zinc-900/40 border border-white/5 rounded-2xl p-6 space-y-6">
      <div className="border-b border-white/5 pb-4 flex items-center justify-between">
        <h3 className="text-base font-black text-white tracking-wide flex items-center gap-2">
          Invoice History
          <span className="px-2 py-0.5 text-[10px] bg-red-600 text-white rounded-full font-black">
            {invoices.length}
          </span>
        </h3>
      </div>

      {/* Responsive table container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-gray-500 uppercase tracking-wider font-black">
              <th className="py-3 px-4">Invoice Number</th>
              <th className="py-3 px-4">Invoice Type</th>
              <th className="py-3 px-4">Plan</th>
              <th className="py-3 px-4">Generated Date</th>
              <th className="py-3 px-4">Base Amount</th>
              <th className="py-3 px-4">Tax Type</th>
              <th className="py-3 px-4">Tax Amount</th>
              <th className="py-3 px-4">Total</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {invoices.map((inv) => (
              <tr key={inv.invoiceNumber} className="hover:bg-white/2 transition-colors text-xs">
                <td className="py-4 px-4 font-mono font-medium text-white">{inv.invoiceNumber}</td>
                <td className="py-4 px-4 text-gray-400 font-medium">{inv.invoiceType}</td>
                <td className="py-4 px-4 text-gray-300 font-bold">{inv.planName}</td>
                <td className="py-4 px-4 text-gray-300">{inv.date}</td>
                <td className="py-4 px-4 text-gray-300">{formatCurrency(inv.baseAmount, inv.currencyCode)}</td>
                <td className="py-4 px-4 text-gray-400 font-medium">{inv.taxName || "GST"} ({inv.taxPercentage !== undefined ? inv.taxPercentage : (inv.gstPercentage || 18)}%)</td>
                <td className="py-4 px-4 text-gray-300">{formatCurrency(inv.taxAmount || inv.gstAmount, inv.currencyCode)}</td>
                <td className="py-4 px-4 text-white font-black">{formatCurrency(inv.totalAmount, inv.currencyCode)}</td>
                <td className="py-4 px-4">
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase">
                    {inv.status}
                  </span>
                </td>
                <td className="py-4 px-4 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => setSelectedInvoice(inv)}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-[10px] text-gray-200 font-bold rounded-lg border border-white/5 transition-all cursor-pointer focus:outline-none"
                  >
                    View Invoice
                  </button>
                  <button
                    type="button"
                    disabled={downloadingId === inv.invoiceNumber}
                    onClick={() => handleDownload(inv.id, inv.invoiceNumber)}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-[10px] text-white font-bold rounded-lg transition-all cursor-pointer focus:outline-none"
                  >
                    {downloadingId === inv.invoiceNumber ? "Downloading..." : "Download PDF"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simple View Invoice Modal Popup */}
      {selectedInvoice && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 relative animate-fade-in shadow-2xl">
            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors cursor-pointer focus:outline-none"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

              <div className="text-center space-y-1">
                <span className="text-[10px] text-purple-400 uppercase tracking-widest font-black">StreamVerse Statement</span>
                <h4 className="text-lg font-black text-white">Invoice Details</h4>
              </div>

              <div className="border-t border-b border-white/5 py-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Invoice Number</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-white font-medium">{selectedInvoice.invoiceNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(selectedInvoice.invoiceNumber)}
                      className="text-[10px] text-purple-400 hover:text-purple-300 transition-colors font-bold px-1.5 py-0.5 bg-purple-500/10 border border-purple-500/20 rounded cursor-pointer"
                    >
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Invoice Type</span>
                  <span className="text-white font-medium">{selectedInvoice.invoiceType}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Invoice Date</span>
                  <span className="text-white font-medium">{selectedInvoice.date}</span>
                </div>
                {selectedInvoice.status === "PAID" ? (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Payment Date</span>
                    <span className="text-white font-medium">{selectedInvoice.date}</span>
                  </div>
                ) : (
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-400">Due Date</span>
                    <span className="text-white font-medium">{selectedInvoice.dueDate}</span>
                  </div>
                )}
                {(selectedInvoice.invoiceType === "PLAN_UPGRADE" || selectedInvoice.invoiceType === "NEW_SUBSCRIPTION") ? (
                  <>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">Previous Plan</span>
                      <span className="text-white font-medium">
                        {selectedInvoice.previousPlanName || "None"} ({selectedInvoice.previousPlanPrice !== null && selectedInvoice.previousPlanPrice !== undefined ? formatCurrency(selectedInvoice.previousPlanPrice, selectedInvoice.currencyCode) : formatCurrency(0, selectedInvoice.currencyCode)})
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-gray-400">New Plan</span>
                      <span className="text-white font-bold">
                        {selectedInvoice.newPlanName || selectedInvoice.planName} ({selectedInvoice.newPlanPrice !== null && selectedInvoice.newPlanPrice !== undefined ? formatCurrency(selectedInvoice.newPlanPrice, selectedInvoice.currencyCode) : formatCurrency(selectedInvoice.amount, selectedInvoice.currencyCode)})
                      </span>
                    </div>
                    {selectedInvoice.invoiceType === "PLAN_UPGRADE" && (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-gray-400">Upgrade Difference</span>
                        <span className="text-white font-medium">{formatCurrency(selectedInvoice.upgradeDifference || 0, selectedInvoice.currencyCode)}</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                    <span className="text-gray-400">Plan Name</span>
                    <span className="text-white font-bold">{selectedInvoice.planName}</span>
                  </div>
                )}
                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
                  <span className="text-gray-400">Base Amount</span>
                  <span className="text-white font-medium">{formatCurrency(selectedInvoice.baseAmount, selectedInvoice.currencyCode)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{selectedInvoice.taxName || "GST"} %</span>
                  <span className="text-white font-medium">{selectedInvoice.taxPercentage !== undefined ? selectedInvoice.taxPercentage : selectedInvoice.gstPercentage}%</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">{selectedInvoice.taxName || "GST"} Amount</span>
                  <span className="text-white font-medium">{formatCurrency(selectedInvoice.taxAmount || selectedInvoice.gstAmount, selectedInvoice.currencyCode)}</span>
                </div>
                <div className="flex justify-between items-center text-xs pt-3 border-t border-white/5">
                  <span className="text-gray-200 font-bold">Total Charged</span>
                  <span className="text-purple-400 font-black text-sm">{formatCurrency(selectedInvoice.totalAmount, selectedInvoice.currencyCode)}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">Payment Status</span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-bold bg-green-500/10 text-green-500 border border-green-500/20 uppercase">
                    {selectedInvoice.status}
                  </span>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedInvoice(null)}
                  className="flex-1 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-xs text-white font-bold rounded-xl border border-white/5 transition-all cursor-pointer"
                >
                  Close View
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleDownload(selectedInvoice.id, selectedInvoice.invoiceNumber);
                    setSelectedInvoice(null);
                  }}
                  className="flex-1 py-2.5 hover:from-purple-500 hover:to-violet-500 text-xs text-white font-bold rounded-xl transition-all cursor-pointer"
                  style={{ background: "linear-gradient(135deg, #8B5CF6, #6D28D9)" }}
                >
                  Download PDF
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}
