// src/components/admin/Invoices/InvoiceDetailsDrawer.jsx
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, Globe, Phone, Calendar, ArrowRight, CheckCircle2,
  Heart, AlertTriangle, XCircle, Activity, ShieldCheck, DollarSign,
  Clock, CreditCard, RefreshCw, RotateCcw, Download, Copy, Check,
  FileText, ExternalLink
} from "lucide-react";
import { getCustomerById, getBillingTimeline } from "../../../services/adminService";
import InvoiceStatusBadge from "./InvoiceStatusBadge";
import PaymentMethodBadge from "../Payments/PaymentMethodBadge";
import { formatCurrency } from "../../../utils/currencyFormatter";
import useToast from "../../../hooks/useToast";

export default function InvoiceDetailsDrawer({ 
  isOpen, 
  invoice, 
  onClose, 
  onDownload, 
  onRegenerate 
}) {
  const { showToast } = useToast();
  const drawerRef = useRef(null);
  const [customerInfo, setCustomerInfo] = useState(null);
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [copiedId, setCopiedId] = useState(null);
  
  const [loadingCust, setLoadingCust] = useState(false);
  const [loadingTimeline, setLoadingTimeline] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (drawerRef.current && !drawerRef.current.contains(event.target) && isOpen) {
        onClose();
      }
    }
    const handler = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(handler);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Load customer metadata and timeline logs
  useEffect(() => {
    const loadDrawerMetadata = async () => {
      if (!invoice) return;
      try {
        setLoadingCust(true);
        setLoadingTimeline(true);

        const custData = await getCustomerById(invoice.customerId);
        setCustomerInfo(custData);

        const timelineData = await getBillingTimeline(invoice.customerId);
        setTimelineEvents(timelineData);
      } catch (err) {
        console.error("Error loading invoice details metadata details:", err);
      } finally {
        setLoadingCust(false);
        setLoadingTimeline(false);
      }
    };

    if (isOpen) {
      loadDrawerMetadata();
    }
  }, [invoice, isOpen]);

  if (!invoice) return null;

  const isPaid = invoice.status === "PAID";
  const isOverdue = invoice.status === "OVERDUE";
  const rawAmount = invoice.amount || 0;
  const currencyCode = invoice.currency_code || undefined;
  // Use backend-calculated breakdown fields directly
  const baseAmount = invoice.base_amount !== undefined && invoice.base_amount !== null ? invoice.base_amount : rawAmount;
  const gstTax = invoice.tax_amount !== undefined && invoice.tax_amount !== null ? invoice.tax_amount : 0;
  const taxLabel = invoice.tax_name || "Tax";
  const taxPct = invoice.tax_percentage !== undefined ? invoice.tax_percentage : null;
  const prorationCredit = invoice.proration_credit || 0;
  const prorationDebit = invoice.proration_debit || 0;
  const invNumberStr = invoice.invoiceNumber || `INV-00${invoice.id}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
    showToast("Copied to clipboard.", "info");
  };

  // Invoice Chronological Timeline
  const invoiceTimeline = [
    { title: "Invoice Created", desc: `Issued on ${invoice.generatedDate || "2026-07-26"}`, date: invoice.generatedDate || "2026-07-26", icon: FileText, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
    { title: "Payment Initiated", desc: `Billing cycle charge scheduled.`, date: invoice.generatedDate || "2026-07-26", icon: Clock, color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  if (isPaid) {
    invoiceTimeline.push(
      { title: "Payment Successful", desc: `Charged ${formatCurrency(rawAmount)} via auto-debit.`, date: invoice.generatedDate || "2026-07-26", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
      { title: "PDF Generated", desc: "Statement compiled and rendered.", date: invoice.generatedDate || "2026-07-26", icon: Download, color: "text-amber-400", bg: "bg-amber-500/10" },
      { title: "Receipt Sent", desc: `Invoice dispatched to ${customerInfo?.email || "customer"}.`, date: invoice.generatedDate || "2026-07-26", icon: Mail, color: "text-cyan-400", bg: "bg-cyan-500/10" }
    );
  } else if (isOverdue) {
    invoiceTimeline.push(
      { title: "Payment Overdue", desc: "Payment past due date. Nudge reminder dispatched.", date: invoice.dueDate || "2026-07-26", icon: AlertTriangle, color: "text-red-400", bg: "bg-red-500/10" }
    );
  } else {
    invoiceTimeline.push(
      { title: "Awaiting Payment", desc: `Payment collection pending until ${invoice.dueDate || "Due Date"}.`, date: invoice.dueDate || "2026-07-26", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" }
    );
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black backdrop-blur-xs"
          />

          {/* Drawer Panel */}
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 220 }}
            ref={drawerRef}
            className="relative w-full max-w-md h-full bg-[#050507] border-l border-white/10 shadow-2xl flex flex-col z-10 overflow-hidden"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#08080a]">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Invoice Statement</h3>
                <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-zinc-500">
                  <span>INV: {invNumberStr}</span>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(invNumberStr)}
                    className="p-0.5 hover:text-white rounded"
                  >
                    {copiedId === invNumberStr ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
                  </button>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Scroll Body */}
            <div className="flex-1 p-6 space-y-7 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              
              {/* Subscriber Profile */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Subscriber Profile
                </h4>
                
                {loadingCust ? (
                  <div className="space-y-2 animate-pulse py-2 bg-zinc-900/10 p-4 rounded-2xl border border-white/5">
                    <div className="h-4 bg-zinc-800 rounded-lg w-2/3" />
                    <div className="h-3 bg-zinc-900 rounded-lg w-1/2" />
                    <div className="h-3 bg-zinc-900 rounded-lg w-1/3" />
                  </div>
                ) : customerInfo ? (
                  <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 space-y-3 text-xs">
                    <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-bold text-xs text-white">
                        {customerInfo.name.charAt(0)}
                      </div>
                      <div>
                        <span className="text-white font-bold block">{customerInfo.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono block mt-0.5">{customerInfo.email}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 pt-1 font-medium text-zinc-300">
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-light flex items-center gap-1.5"><Globe size={13} /> Country</span>
                        <span>{customerInfo.country}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-zinc-500 font-light flex items-center gap-1.5"><Phone size={13} /> Phone</span>
                        <span>{customerInfo.phone_number || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">Error loading customer metadata.</p>
                )}
              </div>

              {/* Statement Summary */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Statement Details
                </h4>

                <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Subscription Plan</span>
                    <span className="text-white font-bold">{invoice.planName}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Statement Status</span>
                    <InvoiceStatusBadge status={invoice.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Payment Method</span>
                    <PaymentMethodBadge method="Visa" />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Issued Date</span>
                    <span className="text-zinc-300 font-mono">{invoice.generatedDate || "N/A"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Due Date</span>
                    <span className="text-zinc-300 font-mono">{invoice.dueDate || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Financial Amount Breakdown */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Line Items & Financial Breakdown
                </h4>

                <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-zinc-300 font-bold border-b border-white/5 pb-2">
                    <span>{invoice.planName} Subscription Fee</span>
                    <span>{formatCurrency(baseAmount, currencyCode)}</span>
                  </div>
                  {prorationCredit > 0 && (
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Proration Credit</span>
                      <span className="text-green-400">- {formatCurrency(prorationCredit, currencyCode)}</span>
                    </div>
                  )}
                  {prorationDebit > 0 && (
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Proration Debit</span>
                      <span className="text-purple-400">+ {formatCurrency(prorationDebit, currencyCode)}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>{taxLabel}{taxPct !== null ? ` (${taxPct}%)` : ""}</span>
                    <span>{formatCurrency(gstTax, currencyCode)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-white font-bold text-sm">
                    <span>Final Statement Total</span>
                    <span className="text-[#8B5CF6]">{formatCurrency(rawAmount, currencyCode)}</span>
                  </div>
                </div>
              </div>

              {/* Invoice Timeline */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Invoice Timeline
                </h4>
                <div className="space-y-0.5 pl-2">
                  {invoiceTimeline.map((ev, index) => {
                    const EvIcon = ev.icon;
                    return (
                      <div key={index} className="adm-timeline-item">
                        <div className={`w-8 h-8 rounded-xl ${ev.bg} border border-white/5 flex items-center justify-center shrink-0 z-10`}>
                          <EvIcon size={14} className={ev.color} />
                        </div>
                        <div className="pt-0.5 text-xs">
                          <span className="text-white font-bold block">{ev.title}</span>
                          <span className="text-[10px] text-zinc-500 block mt-0.5 leading-relaxed">{ev.desc}</span>
                          <span className="text-[9px] text-zinc-600 font-mono mt-1 block">{ev.date}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Quick Actions Footer */}
            <div className="p-6 border-t border-white/5 bg-[#08080a] flex flex-col gap-3 shrink-0">
              <div className="grid grid-cols-2 gap-3.5">
                <button
                  type="button"
                  onClick={() => onRegenerate(invoice.id)}
                  className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5"
                >
                  <RefreshCw size={12} />
                  Regenerate
                </button>

                <button
                  type="button"
                  onClick={() => onDownload(invoice.id)}
                  className="py-2.5 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white rounded-xl text-xs font-bold cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5 shadow-lg shadow-[#8B5CF6]/20"
                >
                  <Download size={12} />
                  Download PDF
                </button>
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
