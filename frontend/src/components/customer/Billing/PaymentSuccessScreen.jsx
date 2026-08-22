import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function PaymentSuccessScreen({
  receiptData,
  onGoToBilling,
  onViewInvoice
}) {
  const {
    transactionId = "TXN_1721458923",
    invoiceNumber = "INV-2026-0042",
    amountPaid = 352.82,
    planName = "Premium Plan",
    paymentDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  } = receiptData || {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4 }}
      className="py-6 px-4 space-y-6 text-center"
    >
      {/* Spring Animated Checkmark Icon */}
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: [0, 1.15, 1] }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-emerald-950/40"
      >
        ✓
      </motion.div>

      <div className="space-y-1">
        <h3 className="text-xl font-black text-white tracking-tight">
          Payment Successful!
        </h3>
        <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">
          Subscription Activated
        </p>
      </div>

      {/* Real Transaction Receipt Metadata Card */}
      <div className="bg-zinc-900/80 border border-white/10 rounded-2xl p-4 text-left space-y-2.5 text-xs max-w-md mx-auto shadow-xl">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <span className="text-gray-400 font-medium">Activated Plan</span>
          <span className="font-bold text-white">{planName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Transaction ID</span>
          <span className="font-mono text-gray-200 font-bold">{transactionId}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Invoice Number</span>
          <span className="font-mono text-gray-200 font-bold">{invoiceNumber}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Payment Date</span>
          <span className="font-mono text-gray-300">{paymentDate}</span>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-white/5 font-black">
          <span className="text-white">Amount Paid</span>
          <span className="font-mono text-emerald-400 text-sm">
            {formatCurrency(amountPaid, receiptData?.currencyCode)}
          </span>
        </div>
      </div>

      {/* Action CTA Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        {onViewInvoice && (
          <button
            type="button"
            onClick={onViewInvoice}
            className="w-full sm:w-auto px-5 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-gray-200 rounded-xl transition-all cursor-pointer border border-white/5"
          >
            View Invoice
          </button>
        )}
        <button
          type="button"
          onClick={onGoToBilling}
          className="w-full sm:w-auto px-6 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-red-900/30 transition-all cursor-pointer"
        >
          Go To Billing
        </button>
      </div>
    </motion.div>
  );
}
