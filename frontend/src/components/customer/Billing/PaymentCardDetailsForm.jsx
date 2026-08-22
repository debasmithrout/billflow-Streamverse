// src/components/customer/Billing/PaymentCardDetailsForm.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import AnimatedCreditCard from "./AnimatedCreditCard";
import OrderSummaryCard from "./OrderSummaryCard";

export default function PaymentCardDetailsForm({
  selectedMethod,
  paymentDetails,
  onPay,
  onBack
}) {
  const [cardNumber, setCardNumber] = useState(selectedMethod?.rawMethod?.last_four ? `•••• •••• •••• ${selectedMethod.rawMethod.last_four}` : "");
  const [cardHolder, setCardHolder] = useState(selectedMethod?.rawMethod?.display_name || "Debasmith Rout");
  const [expiry, setExpiry] = useState(selectedMethod?.rawMethod?.expiry_date || "12/28");
  const [cvv, setCvv] = useState("");
  const [isCvvFocused, setIsCvvFocused] = useState(false);

  const [saveCard, setSaveCard] = useState(false);
  const {
    totalAmount = 352.82,
    currencySymbol = "₹"
  } = paymentDetails || {};

  const provider = selectedMethod?.rawMethod?.provider || selectedMethod?.name || "VISA";

  const handleSubmit = (e) => {
    e.preventDefault();
    onPay({
      savePaymentMethod: saveCard,
      cardType: provider,
      cardNumber,
      cardHolder,
      expiry
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex justify-between items-center border-b border-white/5 pb-3">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-gray-400 hover:text-white transition-colors cursor-pointer flex items-center gap-1"
        >
          <span>&lt;</span> Change Payment Method
        </button>
        <span className="text-[10px] text-red-500 uppercase font-black tracking-widest">
          Step 2 of 3 — Payment Details
        </span>
      </div>

      {/* Split View Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Side: 3D Animated Credit Card & Itemized Summary */}
        <div className="space-y-6">
          <AnimatedCreditCard
            isFlipped={isCvvFocused}
            cardNumber={cardNumber}
            cardHolder={cardHolder}
            expiry={expiry}
            cvv={cvv}
            provider={provider}
          />

          <OrderSummaryCard paymentDetails={paymentDetails} />
        </div>

        {/* Right Side: Input Form Fields */}
        <div className="space-y-4 bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
          <h5 className="text-xs font-black text-white uppercase tracking-wider">
            Enter Card & Account Details
          </h5>

          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              Cardholder Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Debasmith Rout"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              Card / Account Number
            </label>
            <input
              type="text"
              required
              maxLength="19"
              placeholder="4242 4242 4242 4242"
              value={cardNumber}
              onChange={(e) => setCardNumber(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                Expiry Date
              </label>
              <input
                type="text"
                required
                placeholder="MM/YY"
                value={expiry}
                onChange={(e) => setExpiry(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                CVV / CVC
              </label>
              <input
                type="password"
                required
                maxLength="4"
                placeholder="•••"
                value={cvv}
                onChange={(e) => setCvv(e.target.value)}
                onFocus={() => setIsCvvFocused(true)}
                onBlur={() => setIsCvvFocused(false)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
              />
            </div>
          </div>

          {/* Optional Save Method Checkbox */}
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={saveCard}
              onChange={(e) => setSaveCard(e.target.checked)}
              className="rounded border-gray-700 text-red-600 focus:ring-red-500 bg-zinc-900 cursor-pointer"
            />
            <span>Save this card for future payments</span>
          </label>

          {/* Primary Pay Button */}
          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xl shadow-red-900/50 border border-red-500/30 transition-all cursor-pointer"
            >
              Pay {currencySymbol}{Number(totalAmount).toFixed(2)} Now
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  );
}
