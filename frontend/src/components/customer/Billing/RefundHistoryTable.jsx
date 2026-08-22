import { motion } from "framer-motion";
import EmptyState from "../Shared/EmptyState";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function RefundHistoryTable({ refunds = [], invoices = [], loading = false }) {
  const getStatusBadge = (status) => {
    const normStatus = (status || "").toUpperCase();
    switch (normStatus) {
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "APPROVED":
        return "bg-blue-500/10 text-blue-400 border border-blue-500/20";
      case "PROCESSING":
        return "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20";
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      case "FAILED":
      default:
        return "bg-zinc-500/10 text-zinc-400 border border-zinc-500/20";
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "-";
    }
  };

  if (loading) {
    return (
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex items-center justify-center min-h-[200px]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-red-500/20 border-t-red-500 animate-spin" />
          <span className="text-xs text-gray-400 font-medium">Loading refund history...</span>
        </div>
      </div>
    );
  }

  if (!refunds || refunds.length === 0) {
    return (
      <div className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
          <h3 className="text-lg font-black text-white tracking-wide">
            Refund History
          </h3>
        </div>
        <EmptyState message="No refund requests found." iconType="billing" />
      </div>
    );
  }

  // Sort refunds newest first (created_at DESC)
  const sortedRefunds = [...refunds].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );

  const userString = localStorage.getItem("current_user");
  const user = userString ? JSON.parse(userString) : null;
  const currencyCode = user?.currency_code || "INR";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: "easeOut" }}
      className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 space-y-6 shadow-xl shadow-black/50"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-white/5">
        <h3 className="text-lg font-black text-white tracking-wide flex items-center gap-2.5">
          Refund History
          <span className="px-2 py-0.5 text-[10px] bg-red-650 text-white rounded-full font-black shadow-sm shadow-red-900/50">
            {sortedRefunds.length}
          </span>
        </h3>
      </div>

      {/* Responsive Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[750px]">
          <thead>
            <tr className="border-b border-white/5 text-[10px] text-gray-400 uppercase tracking-widest font-black">
              <th className="py-3 px-4">REFUND ID</th>
              <th className="py-3 px-4">INVOICE</th>
              <th className="py-3 px-4">AMOUNT</th>
              <th className="py-3 px-4">STATUS</th>
              <th className="py-3 px-4">REQUESTED DATE</th>
              <th className="py-3 px-4">REASON</th>
              <th className="py-3 px-4">ADMIN NOTES</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {sortedRefunds.map((ref) => {
              const matchedInv = invoices.find((inv) => inv.id === ref.invoice_id);
              const invoiceNumber = matchedInv ? matchedInv.invoiceNumber : "-";

              return (
                <tr
                  key={ref.id}
                  className="hover:bg-white/[0.02] transition-colors text-xs"
                >
                  <td className="py-4 px-4 font-mono font-medium text-white">
                    #{ref.id}
                  </td>
                  <td className="py-4 px-4 font-mono text-gray-300">
                    {invoiceNumber}
                  </td>
                  <td className="py-4 px-4 text-white font-black">
                    {formatCurrency(ref.amount || 0, matchedInv?.currencyCode || currencyCode)}
                  </td>
                  <td className="py-4 px-4">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wide border ${getStatusBadge(
                        ref.status
                      )}`}
                    >
                      {ref.status || "PENDING"}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-gray-300 font-medium">
                    {formatDate(ref.created_at)}
                  </td>
                  <td className="py-4 px-4 text-gray-400 max-w-[200px] truncate" title={ref.reason}>
                    {ref.reason || "-"}
                  </td>
                  <td className="py-4 px-4 text-gray-400 max-w-[200px] truncate" title={ref.admin_notes}>
                    {ref.admin_notes || "-"}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}
