// src/components/admin/Payments/PaymentDetailsDrawer.jsx
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, User, Mail, Globe, Phone, Calendar, ArrowRight, CheckCircle2,
  Heart, AlertTriangle, XCircle, Activity, ShieldCheck, DollarSign,
  Clock, CreditCard, RefreshCw, RotateCcw, Download, Copy, Check,
  FileText, ExternalLink
} from "lucide-react";
import { getCustomerById, getBillingTimeline } from "../../../services/adminService";
import PaymentStatusBadge from "./PaymentStatusBadge";
import PaymentMethodBadge from "./PaymentMethodBadge";
import GatewayBadge from "./GatewayBadge";
import { formatCurrency } from "../../../utils/currencyFormatter";
import useToast from "../../../hooks/useToast";

export default function PaymentDetailsDrawer({ 
  isOpen, 
  payment, 
  onClose, 
  onRetry, 
  onRefund 
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

  // Load subscriber profile and timeline logs dynamically
  useEffect(() => {
    const loadDrawerMetadata = async () => {
      if (!payment) return;
      try {
        setLoadingCust(true);
        setLoadingTimeline(true);

        const custData = await getCustomerById(payment.customerId);
        setCustomerInfo(custData);

        const timelineData = await getBillingTimeline(payment.customerId);
        setTimelineEvents(timelineData);
      } catch (err) {
        console.error("Error loading payment drawer metadata details:", err);
      } finally {
        setLoadingCust(false);
        setLoadingTimeline(false);
      }
    };

    if (isOpen) {
      loadDrawerMetadata();
    }
  }, [payment, isOpen]);

  if (!payment) return null;

  const isFailed = payment.status === "FAILED";
  const isPaid = payment.status === "PAID";
  const rawAmount = payment.amount || 0;
  const currencyCode = payment.currency_code || undefined;
  // Use backend-calculated breakdown fields; fall back to raw amount if not available
  const baseAmount = payment.base_amount !== undefined && payment.base_amount !== null ? payment.base_amount : rawAmount;
  const gstTax = payment.tax_amount !== undefined && payment.tax_amount !== null ? payment.tax_amount : 0;
  const taxLabel = payment.tax_name || "Tax";
  const taxPct = payment.tax_percentage !== undefined ? payment.tax_percentage : null;
  const prorationCredit = payment.proration_credit || 0;
  const prorationDebit = payment.proration_debit || 0;
  const txnIdStr = payment.transactionId || `TXN-${payment.id}`;

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(text);
    setTimeout(() => setCopiedId(null), 1500);
    showToast("Copied to clipboard.", "info");
  };

  // Chronological Payment Timeline events
  const paymentTimeline = [
    { title: "Payment Initiated", desc: "Customer triggered checkout flow.", date: payment.paymentDate || "2026-07-26", icon: Clock, color: "text-purple-400", bg: "bg-purple-500/10" },
    { title: "Gateway Processing", desc: `Processed via ${payment.gateway || "Stripe"} Gateway.`, date: payment.paymentDate || "2026-07-26", icon: Activity, color: "text-blue-400", bg: "bg-blue-500/10" },
  ];

  if (isPaid) {
    paymentTimeline.push(
      { title: "Payment Successful", desc: `Charged ${formatCurrency(rawAmount)} successfully.`, date: payment.paymentDate || "2026-07-26", icon: CheckCircle2, color: "text-green-400", bg: "bg-green-500/10" },
      { title: "Invoice Generated", desc: `Invoice ${payment.invoiceNumber || `INV-00${payment.id}`} created.`, date: payment.paymentDate || "2026-07-26", icon: FileText, color: "text-amber-400", bg: "bg-amber-500/10" },
      { title: "Receipt Sent", desc: `Confirmation emailed to ${customerInfo?.email || "customer"}.`, date: payment.paymentDate || "2026-07-26", icon: Mail, color: "text-cyan-400", bg: "bg-cyan-500/10" }
    );
  } else if (isFailed) {
    paymentTimeline.push(
      { title: "Payment Failed", desc: "Gateway declined transaction attempt.", date: payment.paymentDate || "2026-07-26", icon: XCircle, color: "text-red-500", bg: "bg-red-500/10" }
    );
  } else {
    paymentTimeline.push(
      { title: "Processing Pending", desc: "Awaiting gateway webhook confirmation.", date: payment.paymentDate || "2026-07-26", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10" }
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
            {/* Drawer Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#08080a]">
              <div>
                <h3 className="text-sm font-bold text-white tracking-wide uppercase">Transaction Workspace</h3>
                <div className="flex items-center gap-1.5 mt-0.5 font-mono text-[10px] text-zinc-500">
                  <span>TXN: {txnIdStr}</span>
                  <button 
                    type="button" 
                    onClick={() => handleCopy(txnIdStr)}
                    className="p-0.5 hover:text-white rounded"
                  >
                    {copiedId === txnIdStr ? <Check size={10} className="text-green-500" /> : <Copy size={10} />}
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

            {/* Scrollable Container */}
            <div className="flex-1 p-6 space-y-7 overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent">
              
              {/* Subscriber Profile */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Subscriber Information
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
                      <div className="flex justify-between items-start pt-1 border-t border-white/5">
                        <span className="text-zinc-500 font-light">Billing Address</span>
                        <span className="text-right text-zinc-400 font-mono text-[11px] max-w-[180px]">{customerInfo.address || "Digital Billing Address"}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-zinc-500">Error loading customer metadata.</p>
                )}
              </div>

              {/* Transaction Overview & Badges */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Transaction Metadata
                </h4>

                <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 space-y-3 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Payment Status</span>
                    <PaymentStatusBadge status={payment.status} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Gateway Provider</span>
                    <GatewayBadge gateway={payment.gateway || "Stripe"} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Payment Method</span>
                    <PaymentMethodBadge method={payment.paymentMethod} />
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Invoice Number</span>
                    <span className="text-white font-mono font-bold">{payment.invoiceNumber || `INV-00${payment.id}`}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Subscription Plan</span>
                    <span className="text-white font-bold">{payment.planName || "Subscription Plan"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-500 font-light">Processed At</span>
                    <span className="text-zinc-400 font-mono text-[11px]">{payment.paymentDate || "N/A"}</span>
                  </div>
                </div>
              </div>

              {/* Retry Information */}
              {(payment.status === "FAILED" || payment.retryStatus) && (
                <div className="space-y-3.5">
                  <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-amber-500 pl-2 select-none">
                    Retry Information
                  </h4>

                  <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 space-y-3 text-xs">
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-light">Retry Status</span>
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold border uppercase tracking-wider ${
                        payment.retryStatus === "SUCCESS" || payment.retryStatus === "RECOVERED"
                          ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/20"
                          : payment.retryStatus === "EXHAUSTED" || payment.retryStatus === "FAILED"
                          ? "text-red-400 bg-red-500/10 border-red-500/20"
                          : "text-amber-400 bg-amber-500/10 border-amber-500/20"
                      }`}>
                        {payment.retryStatus || "Scheduled"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-light">Retry Attempt</span>
                      <span className="text-white font-bold">{payment.retryAttempt !== undefined ? payment.retryAttempt : 1} / {payment.maxAttempts || 3}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-light">Next Retry Time</span>
                      <span className="text-white font-mono">{payment.nextRetryDate ? new Date(payment.nextRetryDate).toLocaleDateString() : "Pending scheduler"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-zinc-500 font-light">Last Attempted</span>
                      <span className="text-zinc-400 font-mono">{payment.lastRetryDate ? new Date(payment.lastRetryDate).toLocaleString() : "No attempts yet"}</span>
                    </div>
                    {payment.failureReason && (
                      <div className="pt-2 border-t border-white/5">
                        <span className="text-zinc-500 font-light block mb-1">Failure Reason</span>
                        <p className="text-[11px] text-red-400 bg-red-500/5 rounded-lg p-2 font-mono border border-red-500/10">
                          {payment.failureReason}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Amount Breakdown Card */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Amount Breakdown
                </h4>

                <div className="bg-[#121218]/45 border border-white/5 rounded-2xl p-4.5 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>Base Amount</span>
                    <span>{formatCurrency(baseAmount, currencyCode)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-400">
                    <span>{taxLabel}{taxPct !== null ? ` (${taxPct}%)` : ""}</span>
                    <span>{formatCurrency(gstTax, currencyCode)}</span>
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
                  <div className="flex justify-between items-center pt-2.5 border-t border-white/10 text-white font-bold text-sm">
                    <span>Final Charged Total</span>
                    <span className={isFailed ? "text-red-400" : "text-green-400"}>{formatCurrency(rawAmount, currencyCode)}</span>
                  </div>
                </div>
              </div>

              {/* Transaction Timeline */}
              <div className="space-y-3.5">
                <h4 className="text-[10px] uppercase font-black tracking-wider text-zinc-500 border-l-2 border-[#8B5CF6] pl-2 select-none">
                  Transaction Timeline
                </h4>
                <div className="space-y-0.5 pl-2">
                  {paymentTimeline.map((ev, index) => {
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
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => showToast(`Downloading Invoice ${payment.invoiceNumber || payment.id}...`, "success")}
                  className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download size={12} />
                  Download Invoice
                </button>
                <button
                  type="button"
                  onClick={() => showToast(`Receipt generated for transaction ${txnIdStr}.`, "info")}
                  className="py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors flex items-center justify-center gap-1.5"
                >
                  <FileText size={12} />
                  Download Receipt
                </button>
              </div>

              <div className="flex gap-3.5 w-full">
                {isFailed && (
                  <button
                    type="button"
                    onClick={() => onRetry(payment.id)}
                    className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold cursor-pointer focus:outline-none transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw size={12} />
                    Retry Payment Charge
                  </button>
                )}

                {isPaid && (
                  <button
                    type="button"
                    onClick={() => onRefund(payment)}
                    className="w-full py-2.5 bg-red-650/15 hover:bg-red-650/20 text-red-500 border border-red-500/10 rounded-xl text-xs font-bold cursor-pointer focus:outline-none transition-colors text-center flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={12} />
                    Refund Payment
                  </button>
                )}

                {!isFailed && !isPaid && (
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors text-center"
                  >
                    Close Details
                  </button>
                )}
              </div>
            </div>

          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
