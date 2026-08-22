import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function PaymentFailureScreen({
  errorDetails,
  selectedMethod,
  paymentDetails,
  onRetry,
  onChangeMethod
}) {
  const { errorMessage = "Transaction declined by bank authorization server." } = errorDetails || {};
  const { planName = "Premium Plan", totalAmount = 352.82 } = paymentDetails || {};

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="py-6 px-4 space-y-6 text-center"
    >
      {/* Shake Animated Error Icon */}
      <motion.div
        animate={{ x: [-6, 6, -4, 4, 0] }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        className="w-16 h-16 rounded-full bg-red-500/20 text-red-400 border border-red-500/40 flex items-center justify-center mx-auto text-2xl font-black shadow-lg shadow-red-950/40"
      >
        ✕
      </motion.div>

      <div className="space-y-1">
        <h3 className="text-xl font-black text-white tracking-tight">
          Payment Failed
        </h3>
        <p className="text-xs text-red-400 font-medium max-w-sm mx-auto">
          We couldn't complete your payment. Please check your payment method and try again.
        </p>
      </div>

      {/* Failure Metadata Card */}
      <div className="bg-zinc-900/80 border border-red-900/30 rounded-2xl p-4 text-left space-y-2.5 text-xs max-w-md mx-auto shadow-xl">
        <div className="flex justify-between items-center pb-2 border-b border-white/5">
          <span className="text-gray-400 font-medium">Target Plan</span>
          <span className="font-bold text-white">{planName}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Payment Method</span>
          <span className="font-mono text-gray-200 font-bold">
            {selectedMethod?.display_name || selectedMethod?.provider || "Selected Method"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-medium">Amount Due</span>
          <span className="font-mono text-red-400 font-bold">
            {formatCurrency(totalAmount, paymentDetails?.currencyCode)}
          </span>
        </div>

        <div className="pt-2 border-t border-white/5">
          <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider block">
            Reason:
          </span>
          <span className="text-xs text-gray-300 font-medium block mt-0.5">
            {errorMessage}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={onChangeMethod}
          className="w-full sm:w-auto px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-gray-200 rounded-xl transition-all cursor-pointer border border-white/5"
        >
          Different Method
        </button>
        <button
          type="button"
          onClick={onRetry}
          className="w-full sm:w-auto px-5 py-2 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-red-900/30 transition-all cursor-pointer"
        >
          Retry Payment
        </button>
      </div>
    </motion.div>
  );
}
