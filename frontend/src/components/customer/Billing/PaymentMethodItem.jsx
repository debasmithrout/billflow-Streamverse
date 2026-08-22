// src/components/customer/Billing/PaymentMethodItem.jsx
import { motion } from "framer-motion";
import PaymentMethodActions from "./PaymentMethodActions";

export default function PaymentMethodItem({ method, onSetDefault, onRemove }) {
  if (!method) return null;

  const {
    method_type = "card",
    provider = "VISA",
    display_name = "Payment Instrument",
    last_four = "",
    upi_id = "",
    bank_name = "",
    wallet_name = "",
    expiry_date = "",
    is_default = false,
    created_at = ""
  } = method;

  const type = method_type;
  const brand = provider;
  const last4 = last_four;
  const holderName = display_name;
  const expiryDate = expiry_date || "12/28";
  const lastUsed = method?.last_used ?? method?.lastUsed ?? "Never";
  const totalPayments = method?.total_payments ?? method?.totalPayments ?? 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.005 }}
      transition={{ duration: 0.2 }}
      className={`relative bg-zinc-900/60 backdrop-blur-xl border rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all shadow-lg ${
        is_default
          ? "border-emerald-500/40 shadow-emerald-950/10"
          : "border-white/10 hover:border-white/20 shadow-black/40"
      }`}
    >
      {/* Left Info Section */}
      <div className="flex items-center gap-4 z-10 w-full sm:w-auto">
        {/* Brand / Type Icon */}
        <div className="w-12 h-10 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-inner">
          {type === "card" && (
            <span className="italic tracking-widest">{brand.toUpperCase()}</span>
          )}
          {type === "upi" && (
            <span className="text-amber-400 font-bold text-[11px]">UPI</span>
          )}
          {type === "netbanking" && (
            <span className="text-blue-400 font-bold text-[10px]">BANK</span>
          )}
          {type === "wallet" && (
            <span className="text-purple-400 font-bold text-[10px]">WALLET</span>
          )}
        </div>

        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-white tracking-tight truncate">
              {type === "card" && `${brand.toUpperCase()} •••• ${last4}`}
              {type === "upi" && (upi_id || holderName)}
              {type === "netbanking" && (bank_name || holderName)}
              {type === "wallet" && (wallet_name || holderName)}
            </h4>

            {is_default && (
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                Default
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 text-xs text-gray-400">
            {type === "card" && (
              <>
                <span className="font-medium truncate">{holderName}</span>
                <span className="text-gray-600">•</span>
                <span className="font-mono text-gray-400">Expires {expiryDate}</span>
              </>
            )}
            {type !== "card" && (
              <span className="text-gray-400 font-medium">Verified Account</span>
            )}
          </div>
        </div>
      </div>

      {/* Right Stats & Actions Section */}
      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
        <div className="text-left sm:text-right space-y-0.5">
          <div className="flex sm:block items-center gap-2">
            <span className="text-[10px] text-gray-500 uppercase font-medium">
              Last used:
            </span>
            <span className="text-xs font-mono font-bold text-gray-200 ml-1 sm:ml-0">
              {lastUsed}
            </span>
          </div>

          <div className="flex sm:block items-center gap-2">
            <span className="text-[10px] text-gray-500 uppercase font-medium">
              Total Payments:
            </span>
            <span className="text-xs font-mono font-bold text-white ml-1 sm:ml-0">
              {totalPayments}
            </span>
          </div>
        </div>

        {/* 3-Dot Actions Menu */}
        <PaymentMethodActions
          method={method}
          onSetDefault={onSetDefault}
          onRemove={onRemove}
        />
      </div>
    </motion.div>
  );
}
