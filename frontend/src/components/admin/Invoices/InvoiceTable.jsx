// src/components/admin/Invoices/InvoiceTable.jsx
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Eye, Download, RefreshCw, FileText, MoreVertical, 
  Copy, Check, Calendar, ArrowRight, ShieldCheck, FileDown,
  Sparkles
} from "lucide-react";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function InvoiceTable({ 
  invoices = [], 
  onView, 
  onPreview,
  onDownload, 
  onRegenerate 
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

  const handleCopyId = (text, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
  };

  // Due Date countdown calculation helper
  const calculateDueCountdown = (dueDateStr, status) => {
    if (status === "PAID") return { text: "Paid", color: "text-zinc-500" };
    if (status === "CANCELLED" || status === "VOID") return { text: "Void", color: "text-zinc-600" };
    if (!dueDateStr) return { text: "N/A", color: "text-zinc-600" };

    const today = new Date("2026-07-26");
    const dueDate = new Date(dueDateStr);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);

    const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { text: `Overdue by ${Math.abs(diffDays)}d`, color: "text-red-400 font-bold" };
    if (diffDays === 0) return { text: "Due Today", color: "text-amber-400 font-bold animate-pulse" };
    if (diffDays === 1) return { text: "Due Tomorrow", color: "text-amber-400 font-bold" };
    return { text: `${diffDays} days left`, color: "text-zinc-400" };
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
      <table className="w-full text-left border-collapse min-w-[1100px] adm-table">
        <thead>
          <tr className="border-b border-white/5 bg-zinc-950/60 text-[10px] text-gray-500 uppercase font-black tracking-wider select-none sticky top-0 z-20">
            <th className="py-4.5 px-6">Invoice Number</th>
            <th className="py-4.5 px-6">Customer</th>
            <th className="py-4.5 px-6">Plan</th>
            <th className="py-4.5 px-6">Base Amount</th>
            <th className="py-4.5 px-6">Tax</th>
            <th className="py-4.5 px-6">Grand Total</th>
            <th className="py-4.5 px-6">Issued Date</th>
            <th className="py-4.5 px-6">Due Date</th>
            <th className="py-4.5 px-6">Status</th>
            <th className="py-4.5 px-6 text-center">PDF</th>
            <th className="py-4.5 px-6 text-right">Actions</th>
          </tr>
        </thead>
        <motion.tbody 
          variants={tableVariants}
          initial="hidden"
          animate="show"
          className="divide-y divide-white/5 text-xs text-gray-300"
        >
          {invoices.map((inv) => {
            const isCancelled = inv.status === "CANCELLED" || inv.status === "VOID";
            const rawAmount = inv.amount || 0;
            // Use backend-calculated breakdown fields directly
            const baseAmount = inv.base_amount !== undefined && inv.base_amount !== null ? inv.base_amount : rawAmount;
            const gstTax = inv.tax_amount !== undefined && inv.tax_amount !== null ? inv.tax_amount : 0;
            const currencyCode = inv.currency_code || undefined;
            const dueMeta = calculateDueCountdown(inv.dueDate, inv.status);

            return (
              <motion.tr 
                variants={rowVariants}
                key={inv.id} 
                className={`group hover:bg-white/2 transition-colors cursor-pointer ${
                  isCancelled ? "text-zinc-550" : "text-gray-300"
                }`}
                onClick={() => onView(inv)}
              >
                {/* 1. Invoice Number */}
                <td className="py-4 px-6 font-mono">
                  <div className="flex items-center gap-1.5 text-xs text-gray-200 group-hover:text-white font-bold transition-colors">
                    <FileText size={13} className="text-[#8B5CF6] shrink-0" />
                    <span>{inv.invoiceNumber}</span>
                    <button 
                      type="button"
                      onClick={(e) => handleCopyId(inv.invoiceNumber, e)}
                      className="p-0.5 hover:text-white rounded transition-colors focus:outline-none"
                      title="Copy Invoice Number"
                    >
                      {copiedId === inv.invoiceNumber ? <Check size={11} className="text-green-500" /> : <Copy size={11} className="text-zinc-600" />}
                    </button>
                  </div>
                </td>

                {/* 2. Customer Column */}
                <td className="py-4 px-6 flex items-center gap-3">
                  <div className="w-8.5 h-8.5 rounded-full bg-zinc-800 border border-zinc-700 text-gray-300 flex items-center justify-center font-bold text-[11px] shrink-0 shadow-inner group-hover:border-[#8B5CF6]/50 transition-colors">
                    {getInitials(inv.customerName)}
                  </div>
                  <div className="min-w-0">
                    <span className="font-bold block truncate text-gray-200 group-hover:text-white transition-colors">
                      {inv.customerName}
                    </span>
                    <span className="text-[10px] text-zinc-500 block truncate font-mono mt-0.5">{inv.customerEmail || `CUST-${inv.customerId}`}</span>
                  </div>
                </td>

                {/* 3. Plan Name */}
                <td className="py-4 px-6">
                  <span className="font-bold text-gray-300 group-hover:text-white transition-colors block">
                    {inv.planName}
                  </span>
                </td>

                {/* 4. Base Amount */}
                <td className="py-4 px-6 font-mono text-zinc-400">
                  {formatCurrency(baseAmount, currencyCode)}
                </td>

                {/* 5. GST Tax */}
                <td className="py-4 px-6 font-mono text-zinc-500 text-[11px]">
                  {formatCurrency(gstTax, currencyCode)}
                </td>

                {/* 6. Grand Total */}
                <td className="py-4 px-6 font-bold font-mono text-white text-sm">
                  {formatCurrency(rawAmount, currencyCode)}
                </td>

                {/* 7. Generated Date */}
                <td className="py-4 px-6 font-mono text-zinc-400 text-[11px]">
                  {inv.generatedDate || "N/A"}
                </td>

                {/* 8. Due Date & Countdown */}
                <td className="py-4 px-6 font-mono">
                  <span className="text-zinc-300 block text-[11px]">{inv.dueDate || "N/A"}</span>
                  <span className={`text-[10px] block mt-0.5 ${dueMeta.color}`}>{dueMeta.text}</span>
                </td>

                {/* 9. Status badge */}
                <td className="py-4 px-6">
                  <InvoiceStatusBadge status={inv.status} />
                </td>

                {/* 10. PDF Download Badge Button */}
                <td className="py-4 px-6 text-center" onClick={(e) => e.stopPropagation()}>
                  <button
                    type="button"
                    onClick={() => onDownload(inv.id)}
                    className="p-1.5 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white rounded-lg border border-white/5 cursor-pointer focus:outline-none transition-colors inline-flex items-center gap-1 text-[10px] font-bold"
                    title="Download Statement PDF"
                  >
                    <Download size={12} className="text-[#8B5CF6]" />
                    <span>PDF</span>
                  </button>
                </td>

                {/* 11. Actions Dropdown */}
                <td className="py-4 px-6 text-right relative" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onView(inv)}
                      className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                      title="View Details"
                    >
                      <Eye size={14} />
                    </button>

                    <div className="relative" ref={activeMenuId === inv.id ? menuRef : null}>
                      <button
                        type="button"
                        onClick={(e) => handleToggleMenu(inv.id, e)}
                        className="p-1.5 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
                      >
                        <MoreVertical size={14} />
                      </button>

                      <AnimatePresence>
                        {activeMenuId === inv.id && (
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
                                onView(inv);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-medium flex items-center gap-1.5"
                            >
                              <Eye size={12} />
                              View Details
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onPreview(inv);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-medium flex items-center gap-1.5"
                            >
                              <FileText size={12} />
                              Preview Statement
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onDownload(inv.id);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg text-gray-300 hover:bg-white/5 hover:text-white transition-colors cursor-pointer text-left focus:outline-none font-medium flex items-center gap-1.5"
                            >
                              <Download size={12} />
                              Download PDF
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setActiveMenuId(null);
                                onRegenerate(inv.id);
                              }}
                              className="w-full px-2.5 py-1.5 text-xs rounded-lg text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer text-left focus:outline-none font-bold border-t border-white/5 mt-1 pt-1.5 flex items-center gap-1.5"
                            >
                              <RefreshCw size={12} />
                              Regenerate
                            </button>
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
