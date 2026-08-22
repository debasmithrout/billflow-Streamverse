// src/components/customer/Billing/ProcessingPaymentScreen.jsx
import { motion } from "framer-motion";

export default function ProcessingPaymentScreen({ selectedMethod }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="py-16 px-6 text-center space-y-8 max-w-md mx-auto"
    >
      {/* Large Red Gradient Circular Progress Ring (Video-536.mp4 Parity) */}
      <div className="relative w-28 h-28 mx-auto flex items-center justify-center">
        {/* Outer continuous rotating ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.4, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-transparent border-t-red-600 border-r-red-500/60 border-b-red-900/20 shadow-2xl shadow-red-950/80"
        />

        {/* Pulsing inner lock badge */}
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className="w-16 h-16 rounded-full bg-red-950/40 border border-red-500/40 flex items-center justify-center text-red-400 shadow-inner"
        >
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
          </svg>
        </motion.div>
      </div>

      <div className="space-y-2">
        <h3 className="text-2xl font-black text-white tracking-tight">
          Processing Securely...
        </h3>
        <p className="text-xs text-gray-400 font-medium max-w-xs mx-auto">
          Verifying payment authorization with your financial institution.
        </p>
        {selectedMethod && (
          <span className="text-[11px] font-mono text-gray-300 bg-zinc-900 border border-white/5 py-1 px-3 rounded-lg inline-block mt-2 font-medium">
            Instrument: {selectedMethod.name || selectedMethod.display_name || "Saved Method"}
          </span>
        )}
      </div>

      <div className="pt-4 border-t border-white/5">
        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-widest bg-amber-500/10 py-1.5 px-4 rounded-full border border-amber-500/20 inline-block">
          🔒 Do not close or refresh this window
        </span>
      </div>
    </motion.div>
  );
}
