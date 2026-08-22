// src/components/admin/Payments/PaymentTable.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, RefreshCw, RotateCcw, MoreVertical, Copy, Check, FileText, Download } from "lucide-react";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentMethodBadge from "./PaymentMethodBadge";
import GatewayBadge from "./GatewayBadge";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function PaymentTable({ 
  payments = [], 
  onView, 
  onRetry, 
  onRefund 
}) {
  const [activeMenuId, setActiveMenuId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveMenuId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleMenu = (id, e) => {
    e.stopPropagation();
    if (activeMenuId === id) {
      setActiveMenuId(null);
    } else {
      setActiveMenuId(id);
    }
  };

  const getInitials = (name) => {
    if (!name) return "CU";
    const parts = name.trim().split(" ");
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const handleCopyId = (id, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  };

  const tableVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.04 }
    }
  };

  const rowVariants = {
    hidden: { opacity: 0, y: 8 },
    show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="w-full overflow-x-auto rounded-2xl border border-white/5 bg-zinc-900/20 backdrop-blur-md">
      <table className="w-full text-left border-collapse min-w-[1200px] adm-table">
        <thead>
          <tr className="border-b border-white/5 bg-zinc-950/60 text-[10px] text-gray-500 uppercase font-black tracking-wider select-none">
            <th className="py-4.5 px-6">Transaction ID</th>
            <th className="py-4.5 px-6">Customer</th>
            <th className="py-4.5 px-6">Invoice & Plan</th>
            <th className="py-4.5 px-6">Amount</th>
            <th className="py-4.5 px-6">Tax</th>
            <th className="py-4.5 px-6">Total Charged</th>
            <th className="py-4.5 px-6">Gateway</th>
            <th className="py-4.5 px-6">Method</th>
            <th className="py-4.5 px-6">Status</th>
            <th className="py-4.5 px-6">Retry Status</th>
            <th className="py-4.5 px-6">Date</th>
            <th className="py-4.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <motion.tbody 
          variants={tableVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-white/5 text-xs text-gray-300"
        >
          {payments.map((p) => {
            const isFailed = p.status === "FAILED";
            const isRefunded = p.status === "REFUNDED";
            
            // Use backend-calculated base amount and tax amount directly
            const rawAmount = p.amount || 0;
            const baseAmount = p.base_amount !== undefined && p.base_amount !== null ? p.base_amount : rawAmount;
            const gstTax = p.tax_amount !== undefined && p.tax_amount !== null ? p.tax_amount : 0;
            const currencyCode = p.currency_code || undefined;
            const txnIdStr = p.transactionId || `TXN-${p.id}`;

            return (
              <motion.tr 
                variants={rowVariants}
                key={p.id} 
                className={`group hover:bg-white/2 transition-colors cursor-pointer ${
                  isFailed || isRefunded ? "text-zinc-500" : "text-gray-300"
                }`}
                onClick={() => onView(p)}
              >
                {/* 1. Transaction ID */}
                <td className="py-4 px-6 font-mono">
                  <div className="flex items-center gap-1 text-[11px] text-zinc-300 group-hover:text-white transition-colors">
                    <span className="font-bold truncate max-w-[130px]">{txnIdStr}</span>
                    <button 
                      type="button"
                      onClick={(e) => handleCopyId(txnIdStr, e)}
                      className="p-0.5 hover:text-white rounded transition-colors focus:outline-none"
                      title="Copy Transaction ID"
                    >
                      {copiedId === txnIdStr ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="text-zinc-650" />}
                    </button>
                  </div>
                </td>

                {/* 2. Customer Column */}
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-8.5 h-8.5 rounded-full bg-zinc-800 border border-zinc-700 text-gray-300 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-inner group-hover:border-[#8B5CF6]/50 transition-colors">
                    {getInitials(p.customerName)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold block truncate text-gray-200 group-hover:text-white transition-colors">
                      {p.customerName || "Customer"}
                    </span>
                    <span className="text-[10px] text-zinc-500 block truncate font-mono mt-0.5">{p.customerEmail || `CUST-${p.customerId}`}</span>
                  </div>
                </td>

                {/* 3. Invoice Number & Plan */}
                <td className="py-4 px-6">
                  <span className="font-bold text-gray-200 group-hover:text-white transition-colors block font-mono text-[11px]">
                    {p.invoiceNumber || `INV-00${p.id}`}
                  </span>
                  <span className="text-[10px] text-zinc-500 block mt-0.5">
                    {p.planName || "Subscription Plan"}
                  </span>
                </td>

                {/* 4. Base Amount */}
                <td className="py-4 px-6 font-mono text-zinc-400">
                  {formatCurrency(baseAmount, currencyCode)}
                </td>

                {/* 5. GST Tax */}
                <td className="py-4 px-6 font-mono text-zinc-555 text-[11px]">
                  {formatCurrency(gstTax, currencyCode)}
                </td>

                {/* 6. Total Charged */}
                <td className={`py-4 px-6 font-bold font-mono text-sm ${isFailed ? "text-red-500" : "text-white"}`}>
                  {formatCurrency(rawAmount, currencyCode)}
                </td>

                {/* 7. Gateway Badge */}
                <td className="py-4 px-6">
                  <GatewayBadge gateway={p.gateway || "Stripe"} />
                </td>

                {/* 8. Payment Method Badge */}
                <td className="py-4 px-6">
                  <PaymentMethodBadge method={p.paymentMethod} />
                </td>

                {/* 9. Status Badge */}
                <td className="py-4 px-6">
                  <PaymentStatusBadge status={p.status} />
                </td>

                {/* 10. Retry Status */}
                <td className="py-4 px-6">
                  {p.status === "FAILED" || p.retryStatus ? (
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${
                      p.retryStatus === "SUCCESS" || p.retryStatus === "RECOVERED"
                        ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                        : p.retryStatus === "EXHAUSTED" || p.retryStatus === "FAILED"
                        ? "text-red-400 bg-red-500/10 border-red-500/20"
                        : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                    }`}>
                      {p.retryStatus || "Scheduled"}
                    </span>
                  ) : (
                    <span className="text-[10px] text-zinc-600">—</span>
                  )}
                </td>

                {/* 11. Date */}
                <td className="py-4 px-6 font-mono text-[11px] text-zinc-400">
                  {p.paymentDate || "N/A"}
                </td>

                {/* 11. Actions Dropdown */}
                <td className="py-4 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(p)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                      title="Quick Details"
                    >
                      <Eye size={14} />
                    </button>

                    <div className="relative" ref={activeMenuId === p.id ? menuRef : null}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleMenu(p.id, e)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>

                      <AnimatePresence>
                        {activeMenuId === p.id && (
                          <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: -5 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -5 }}
                            className="absolute right-0 mt-1 w-40 bg-zinc-950 border border-white/10 rounded-xl shadow-2xl p-1.5 z-40 text-left origin-top-right"
                          >
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onView(p);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-medium flex items-center gap-1.5"
                            >
                              <Eye size={12} />
                              View Details
                            </button>

                            {/* RETRY OPTION FOR FAILED TRANSACTIONS */}
                            {isFailed && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onRetry(p.id);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg text-green-500 hover:bg-green-500/10 transition-colors cursor-pointer text-left focus:outline-none font-bold flex items-center gap-1.5"
                              >
                                <RefreshCw size={12} />
                                Retry Charge
                              </button>
                            )}

                            {/* REFUND OPTION FOR PAID TRANSACTIONS */}
                            {p.status === "PAID" && (
                              <button
                                type="button"
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onRefund(p);
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left focus:outline-none font-bold border-t border-white/5 mt-1 pt-1.5 flex items-center gap-1.5"
                              >
                                <RotateCcw size={12} />
                                Refund Payment
                              </button>
                            )}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </td>
              </motion.tr>
            );
          })}
        </motion.tbody>
      </table>
    </div>
  );
}
