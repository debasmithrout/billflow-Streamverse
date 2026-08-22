// src/components/customer/Billing/OrderSummaryCard.jsx
import { motion } from "framer-motion";

export default function OrderSummaryCard({ paymentDetails }) {
  if (!paymentDetails) return null;

  const {
    planName = "Premium Plan",
    billingInterval = "Monthly",
    baseAmount = 0,
    gstAmount = 0,
    totalAmount = 0,
    currencySymbol = "",
    taxName = "",
    gstPercentage = 0
  } = paymentDetails;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-5 space-y-4 shadow-xl shadow-black/40"
    >
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">
            Selected Order
          </span>
          <h4 className="text-base font-black text-white tracking-tight mt-0.5">
            {planName} <span className="text-xs font-normal text-gray-400">({billingInterval})</span>
          </h4>
        </div>
        <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-red-600/20 text-red-400 border border-red-500/30 uppercase tracking-wider">
          Instant Activation
        </span>
      </div>

      {/* Itemized Price Breakdown (Backend Calculated Values) */}
      <div className="space-y-2 text-xs">
        {paymentDetails.isProrated ? (
          <>
            <div className="flex justify-between items-center text-gray-300">
              <span>Subscription Charge</span>
              <span className="font-mono font-bold text-gray-200">
                {currencySymbol}{Number(baseAmount).toFixed(2)}
              </span>
            </div>

            {Number(paymentDetails.prorationCredit || 0) > 0 && (
              <div className="flex justify-between items-center text-red-400">
                <span>Proration Credit</span>
                <span className="font-mono font-bold">
                  -{currencySymbol}{Number(paymentDetails.prorationCredit).toFixed(2)}
                </span>
              </div>
            )}

            {Number(paymentDetails.prorationDebit || 0) > 0 && (
              <div className="flex justify-between items-center text-purple-400">
                <span>Proration Debit</span>
                <span className="font-mono font-bold">
                  +{currencySymbol}{Number(paymentDetails.prorationDebit).toFixed(2)}
                </span>
              </div>
            )}

            <div className="flex justify-between items-center text-gray-300 border-t border-white/5 pt-1.5 mt-1.5">
              <span>Net Proration</span>
              <span className="font-mono font-bold text-gray-200">
                {currencySymbol}{Number(paymentDetails.netProration || 0).toFixed(2)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex justify-between items-center text-gray-300">
            <span>Base Plan Price</span>
            <span className="font-mono font-bold text-gray-200">
              {currencySymbol}{Number(baseAmount).toFixed(2)}
            </span>
          </div>
        )}

        <div className="flex justify-between items-center text-gray-300">
          <div className="flex items-center gap-1">
            <span>{taxName} ({gstPercentage}%)</span>
          </div>
          <span className="font-mono font-bold text-gray-200">
            {currencySymbol}{Number(gstAmount).toFixed(2)}
          </span>
        </div>

        <div className="pt-3 border-t border-white/10 flex justify-between items-center text-sm font-black">
          <span className="text-white">Total Payable</span>
          <span className="font-mono text-red-500 text-lg">
            {currencySymbol}{Number(totalAmount).toFixed(2)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
