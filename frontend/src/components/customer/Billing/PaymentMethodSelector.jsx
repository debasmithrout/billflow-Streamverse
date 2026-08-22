// src/components/customer/Billing/PaymentMethodSelector.jsx
import { motion } from "framer-motion";

export default function PaymentMethodSelector({
  methods = [],
  selectedMethod,
  onSelectMethod,
  onContinue,
  onOpenAddDrawer
}) {
  // Built-in method categories matching reference PNG
  const defaultCategories = [
    {
      id: "card_default",
      type: "card",
      name: "Credit or Debit Card",
      subtitle: "VISA, Mastercard, Rupay, Amex",
      icon: "💳"
    },
    {
      id: "upi_default",
      type: "upi",
      name: "UPI / Instant Pay",
      subtitle: "Google Pay, PhonePe, Paytm, BHIM",
      icon: "⚡"
    },
    {
      id: "netbanking_default",
      type: "netbanking",
      name: "Net Banking",
      subtitle: "SBI, HDFC, ICICI, Axis, & all Indian Banks",
      icon: "🏦"
    },
    {
      id: "wallet_default",
      type: "wallet",
      name: "Digital Wallets",
      subtitle: "Paytm, PhonePe Wallet, Amazon Pay",
      icon: "👛"
    }
  ];

  // Merge real saved methods if customer has any saved in DB
  const displayList = methods.length > 0
    ? methods.map((m) => ({
        id: `saved_${m.id}`,
        rawMethod: m,
        type: m.method_type,
        name: m.display_name || (m.method_type === "card" ? `${(m.provider || "VISA").toUpperCase()} •••• ${m.last_four || "4242"}` : m.provider),
        subtitle: m.method_type === "card" ? `Expires ${m.expiry_date || "12/28"}` : (m.upi_id || m.bank_name || m.wallet_name || "Saved Method"),
        isDefault: m.is_default,
        icon: m.method_type === "card" ? "💳" : m.method_type === "upi" ? "⚡" : m.method_type === "netbanking" ? "🏦" : "👛"
      }))
    : defaultCategories;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <div>
          <h4 className="text-base font-black text-white tracking-tight">
            Select Payment Method
          </h4>
          <p className="text-xs text-gray-400 font-medium mt-0.5">
            Choose how you want to pay for your subscription.
          </p>
        </div>
        {methods.length > 0 && (
          <button
            type="button"
            onClick={onOpenAddDrawer}
            className="text-xs font-bold text-red-500 hover:text-red-400 transition-colors cursor-pointer"
          >
            + Add Saved Method
          </button>
        )}
      </div>

      {/* Methods Selection List */}
      <div className="space-y-3">
        {displayList.map((item) => {
          const isSelected = selectedMethod && (selectedMethod.id === item.id || (selectedMethod.rawMethod && selectedMethod.rawMethod.id === item.rawMethod?.id));

          return (
            <motion.div
              key={item.id}
              whileHover={{ y: -2, scale: 1.005 }}
              whileTap={{ scale: 0.99 }}
              onClick={() => onSelectMethod(item)}
              className={`p-4 rounded-2xl border flex items-center justify-between gap-4 cursor-pointer transition-all ${
                isSelected
                  ? "bg-gradient-to-r from-zinc-900 via-zinc-900 to-red-950/40 border-red-600 shadow-xl shadow-red-950/30"
                  : "bg-zinc-900/50 border-white/10 hover:border-white/20"
              }`}
            >
              <div className="flex items-center gap-4 min-w-0">
                {/* Method Icon Square */}
                <div className="w-12 h-12 rounded-xl bg-zinc-800 border border-white/10 flex items-center justify-center text-xl shrink-0 shadow-inner">
                  {item.icon}
                </div>

                <div className="min-w-0 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h5 className="text-sm font-bold text-white tracking-tight truncate">
                      {item.name}
                    </h5>
                    {item.isDefault && (
                      <span className="px-2 py-0.5 rounded text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-wide">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 font-medium truncate">
                    {item.subtitle}
                  </p>
                </div>
              </div>

              {/* Right Radio Indicator / Chevron */}
              <div className="flex items-center gap-2 shrink-0">
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                    isSelected
                      ? "border-red-500 bg-red-600 shadow-md shadow-red-600/50"
                      : "border-gray-500 bg-zinc-800/50"
                  }`}
                >
                  {isSelected && <div className="w-2 h-2 rounded-full bg-white" />}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Large Red Primary CTA */}
      <div className="pt-2">
        <motion.button
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={onContinue}
          disabled={!selectedMethod}
          className={`w-full py-3.5 text-sm font-black rounded-xl shadow-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
            selectedMethod
              ? "text-white border border-purple-500/30"
              : "bg-zinc-800 text-gray-500 cursor-not-allowed"
          }`}
          style={selectedMethod ? {
            background: "linear-gradient(135deg, #8B5CF6, #6D28D9)",
            boxShadow: "0 4px 20px rgba(139,92,246,0.3)"
          } : {}}
        >
          Continue to Payment Details <span className="text-base">&gt;</span>
        </motion.button>
      </div>

      {/* StreamVerse Security Footer */}
      <div className="pt-4 border-t border-white/5 flex items-center justify-center gap-2 text-[11px] text-gray-500 font-medium">
        <svg className="w-3.5 h-3.5 fill-current text-purple-400" viewBox="0 0 24 24">
          <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
        </svg>
        <span>Secured by StreamVerse 256-bit SSL Payment Gateway</span>
      </div>
    </div>
  );
}
