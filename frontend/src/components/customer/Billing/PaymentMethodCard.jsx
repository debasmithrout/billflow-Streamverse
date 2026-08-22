// src/components/customer/Billing/PaymentMethodCard.jsx
import { motion } from "framer-motion";

export default function PaymentMethodCard({ paymentMethod, onManageMethods }) {
  const hasMethod = !!paymentMethod;
  const {
    cardType = "VISA",
    last4 = "4242",
    expiryDate = "12/28",
    billingEmail = "Card Holder"
  } = paymentMethod || {};

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="relative bg-zinc-900/60 backdrop-blur-xl border border-red-600/50 rounded-2xl p-6 flex flex-col justify-between h-full space-y-4 shadow-xl shadow-red-950/20 hover:border-red-500 transition-all overflow-hidden group"
    >
      {/* Background Red Accent Glow */}
      <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-red-600/10 rounded-full blur-3xl group-hover:bg-red-600/20 transition-all duration-500" />

      <div className="space-y-3 z-10">
        <div className="flex justify-between items-center">
          <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">
            Payment Method
          </span>
          {!hasMethod && (
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
              No Method Saved
            </span>
          )}
        </div>

        {hasMethod ? (
          /* Realistic Dark Red Credit Card Graphic */
          <div className="relative h-28 w-full rounded-xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/60 border border-white/10 p-3.5 flex flex-col justify-between shadow-inner shadow-black/80 overflow-hidden">
            {/* Subtle glossy overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />

            <div className="flex justify-between items-start z-10">
              {/* Card Chip graphic */}
              <div className="w-7 h-5 rounded bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                <div className="w-3.5 h-2.5 bg-amber-500/40 rounded-sm" />
              </div>
              <span className="text-xs font-black italic tracking-wider text-white">
                {(cardType || "VISA").toUpperCase()}
              </span>
            </div>

            <div className="z-10">
              <span className="text-xs font-mono tracking-widest text-gray-200 block font-semibold">
                •••• •••• •••• {last4 || "4242"}
              </span>
              <div className="flex justify-between items-center mt-1.5 text-[10px]">
                <span className="text-gray-400 font-medium truncate max-w-[140px]">
                  {billingEmail || "Card Holder"}
                </span>
                <span className="font-mono text-gray-300 font-medium">
                  Expires {expiryDate || "12/28"}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Empty State Graphic */
          <div className="relative h-28 w-full rounded-xl bg-zinc-950/80 border border-dashed border-white/15 p-4 flex flex-col items-center justify-center text-center space-y-1">
            <span className="text-xs font-bold text-gray-300">No Payment Method Saved</span>
            <span className="text-[11px] text-gray-500">Click below to add a card, UPI ID, or bank account.</span>
          </div>
        )}
      </div>

      {/* Footer Manage CTA */}
      <div className="pt-2 z-10 text-center">
        <motion.button
          whileHover={{ x: 3 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onManageMethods}
          className="inline-flex items-center justify-center gap-1 text-xs font-bold text-gray-300 hover:text-white transition-colors cursor-pointer focus:outline-none"
        >
          Manage Methods <span className="text-red-500">&gt;</span>
        </motion.button>
      </div>
    </motion.div>
  );
}
