// src/components/customer/Billing/ManagePaymentMethodsDrawer.jsx
import { motion, AnimatePresence } from "framer-motion";
import PaymentMethodsCenter from "./PaymentMethodsCenter";

export default function ManagePaymentMethodsDrawer({ isOpen, onClose, paymentMethod }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/80 backdrop-blur-md cursor-pointer"
          />

          {/* Sliding Side Panel (Desktop: w-[48vw] max-w-4xl, Mobile: full width) */}
          <div className="fixed inset-y-0 right-0 max-w-full flex">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 240, damping: 28 }}
              className="relative w-screen md:w-[48vw] md:max-w-4xl bg-zinc-950 border-l border-white/10 p-6 md:p-8 overflow-y-auto space-y-6 shadow-2xl flex flex-col justify-between"
            >
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between border-b border-white/5 pb-4">
                  <div>
                    <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      Manage Payment Methods
                    </h2>
                    <p className="text-xs text-gray-400 font-medium mt-1">
                      Add, remove or set default payment methods.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer focus:outline-none"
                    title="Close Drawer"
                  >
                    ✕
                  </button>
                </div>

                {/* Main Payment Methods Center View */}
                <PaymentMethodsCenter paymentMethod={paymentMethod} />
              </div>

              {/* Drawer Footer Notice */}
              <div className="pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-gray-500">
                <span>StreamVerse Secure Billing Infrastructure</span>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-gray-300 font-bold rounded-xl border border-white/5 transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
