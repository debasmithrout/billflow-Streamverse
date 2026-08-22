// src/components/customer/Billing/LastPaymentCard.jsx
import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function LastPaymentCard({ lastInvoice, onViewInvoice }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-full space-y-6 shadow-xl shadow-black/50 hover:border-white/20 transition-all overflow-hidden group"
    >
      <div className="space-y-4 z-10">
        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">
          Last Payment
        </span>

        {lastInvoice ? (
          <div className="space-y-3 pt-1">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Date</span>
              <span className="font-mono font-semibold text-gray-200">
                {lastInvoice.date}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Amount</span>
              <span className="font-black text-white text-sm">
                {formatCurrency(lastInvoice.amount || lastInvoice.totalAmount || 0, lastInvoice.currencyCode)}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400 font-medium">Status</span>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                {lastInvoice.status || "PAID"}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-xs text-gray-500 font-medium">
              No recent payment found.
            </p>
          </div>
        )}
      </div>

      {lastInvoice && (
        <div className="pt-2 z-10 text-center">
          <motion.button
            whileHover={{ x: 3 }}
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => onViewInvoice && onViewInvoice(lastInvoice)}
            className="inline-flex items-center justify-center gap-1 text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
          >
            View Invoice <span className="text-red-500">&gt;</span>
          </motion.button>
        </div>
      )}
    </motion.div>
  );
}
