// src/components/customer/Billing/UPIPaymentForm.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import OrderSummaryCard from "./OrderSummaryCard";

export default function UPIPaymentForm({
  selectedMethod,
  paymentDetails,
  onPay,
  onBack
}) {
  const [upiId, setUpiId] = useState(selectedMethod?.rawMethod?.upi_id || "debas@oksbi");
  const [saveUpi, setSaveUpi] = useState(false);

  const {
    totalAmount = 352.82,
    currencySymbol = "₹"
  } = paymentDetails || {};

  const handleQuickSuffix = (suffix) => {
    const prefix = upiId.split("@")[0] || "user";
    setUpiId(`${prefix}${suffix}`);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onPay({
      savePaymentMethod: saveUpi,
      upiId
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
          UPI Instant Checkout
        </span>
      </div>

      {/* Split View Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Floating Smartphone Mockup & Summary */}
        <div className="space-y-6">
          <motion.div
            animate={{ y: [-4, 4, -4] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-full h-52 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-950 to-red-950/40 border border-red-500/30 p-5 flex flex-col justify-between shadow-2xl shadow-red-950/40 relative overflow-hidden"
          >
            {/* Ambient Background Glow */}
            <div className="absolute -right-8 -top-8 w-28 h-28 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex justify-between items-center z-10">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                UPI Instant Auto-Approve
              </span>
              <span className="text-sm font-black italic tracking-wider text-white">
                ⚡ UPI
              </span>
            </div>

            <div className="z-10 space-y-1 my-auto text-center py-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Target VPA Address
              </span>
              <span className="text-base font-mono font-bold text-white block truncate">
                {upiId || "yourname@upi"}
              </span>
              <span className="text-lg font-mono font-black text-emerald-400 block mt-1">
                {currencySymbol}{Number(totalAmount).toFixed(2)}
              </span>
            </div>

            <div className="flex justify-between items-center z-10 pt-2 border-t border-white/5 text-[10px]">
              <span className="text-gray-400">Supported: GPay, PhonePe, Paytm</span>
              <span className="text-emerald-400 font-bold">✓ Verified Merchant</span>
            </div>
          </motion.div>

          <OrderSummaryCard paymentDetails={paymentDetails} />
        </div>

        {/* Right Panel: Input VPA Form */}
        <div className="space-y-5 bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
          <h5 className="text-xs font-black text-white uppercase tracking-wider">
            Enter Virtual Payment Address (VPA)
          </h5>

          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              UPI VPA ID
            </label>
            <input
              type="text"
              required
              placeholder="e.g. debas@oksbi or 9876543210@paytm"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Quick Bank Suffix Selector Chips */}
          <div className="space-y-1.5">
            <span className="text-[10px] text-gray-400 font-bold uppercase block">
              Quick Bank Suffixes:
            </span>
            <div className="flex flex-wrap gap-2">
              {["@oksbi", "@okhdfcbank", "@icici", "@paytm", "@ybl"].map((suffix) => (
                <button
                  key={suffix}
                  type="button"
                  onClick={() => handleQuickSuffix(suffix)}
                  className="px-2.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-[10px] font-mono text-gray-300 border border-white/5 transition-colors cursor-pointer"
                >
                  {suffix}
                </button>
              ))}
            </div>
          </div>

          {/* Save UPI Checkbox */}
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={saveUpi}
              onChange={(e) => setSaveUpi(e.target.checked)}
              className="rounded border-gray-700 text-red-600 focus:ring-red-500 bg-zinc-900 cursor-pointer"
            />
            <span>Save this UPI ID for future payments</span>
          </label>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xl shadow-red-900/50 border border-red-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
               <span>⚡</span> Pay {currencySymbol}{Number(totalAmount).toFixed(2)} via UPI
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  );
}
