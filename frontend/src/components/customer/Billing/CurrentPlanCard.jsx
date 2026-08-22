// src/components/customer/Billing/CurrentPlanCard.jsx
import { motion } from "framer-motion";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function CurrentPlanCard({ subscription }) {
  if (!subscription) return null;

  const { planName, price, billingCycle, renewalDate, status, cancelledAt } = subscription;
  const isTrial = status?.toUpperCase() === "TRIAL";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      whileHover={{ scale: 1.01 }}
      className="relative bg-zinc-900/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 flex flex-col justify-between h-full space-y-6 shadow-xl shadow-black/50 hover:border-white/20 transition-all overflow-hidden group"
    >
      {/* Subtle background glare glow */}
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-red-600/5 rounded-full blur-2xl group-hover:bg-red-600/10 transition-all duration-500" />

      <div className="space-y-4 z-10">
        <span className="text-[10px] text-gray-400 uppercase font-black tracking-widest block">
          {status === "CANCELLED" ? "Cancelled Subscription" : "Current Plan"}
        </span>
        <div>
          <h4 className="text-2xl font-black text-white tracking-tight">
            {status === "CANCELLED" ? `Last Plan: ${planName || "Standard"}` : `${planName || "Standard"} Plan`}
          </h4>
          <p className="text-xs text-gray-400 mt-1 font-medium flex items-center gap-2">
            Status:{" "}
            <span
              className={`font-black tracking-wide uppercase px-2 py-0.5 rounded text-[10px] ${
                isTrial
                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                  : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
              }`}
            >
              {status || "ACTIVE"}
            </span>
          </p>
        </div>
      </div>

      <div className="pt-4 border-t border-white/5 flex justify-between items-end z-10">
        <div>
          <span className="text-3xl font-black text-white tracking-tight">
            {formatCurrency(price !== undefined ? price : 299, subscription.currency_code)}
          </span>
          <span className="text-xs text-gray-400 font-medium ml-1">
            / {(billingCycle || "month").toLowerCase()}
          </span>
        </div>

        {status === "CANCELLED" && cancelledAt ? (
          <div className="text-right">
            <span className="text-[10px] text-rose-400 uppercase font-bold block tracking-wider">
              Cancelled On
            </span>
            <span className="text-xs font-mono font-bold text-gray-200 mt-0.5 block">
              {cancelledAt}
            </span>
          </div>
        ) : (
          renewalDate && (
            <div className="text-right">
              <span className="text-[10px] text-gray-400 uppercase font-bold block tracking-wider">
                Next billing date
              </span>
              <span className="text-xs font-mono font-bold text-gray-200 mt-0.5 block">
                {renewalDate}
              </span>
            </div>
          )
        )}
      </div>
    </motion.div>
  );
}
