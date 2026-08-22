// src/components/customer/Billing/NetBankingPaymentForm.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import OrderSummaryCard from "./OrderSummaryCard";

export default function NetBankingPaymentForm({
  selectedMethod,
  paymentDetails,
  onPay,
  onBack
}) {
  const [bankName, setBankName] = useState(selectedMethod?.rawMethod?.bank_name || "State Bank of India (SBI)");
  const [accountHolder, setAccountHolder] = useState(selectedMethod?.rawMethod?.display_name || "Debasmith Rout");
  const {
    totalAmount = 352.82,
    currencySymbol = "₹"
  } = paymentDetails || {};
  const [saveBank, setSaveBank] = useState(false);



  const indianBanks = [
    "State Bank of India (SBI)",
    "HDFC Bank",
    "ICICI Bank",
    "Axis Bank",
    "Kotak Mahindra Bank",
    "Punjab National Bank (PNB)",
    "Bank of Baroda"
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onPay({
      savePaymentMethod: saveBank,
      bankName,
      accountHolder
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
          Net Banking Portal
        </span>
      </div>

      {/* Split View Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Animated Bank Portal Card & Summary */}
        <div className="space-y-6">
          <motion.div
            animate={{ scale: [1, 1.01, 1] }}
            transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
            className="w-full h-52 rounded-3xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/40 border border-red-500/30 p-5 flex flex-col justify-between shadow-2xl shadow-red-950/40 relative overflow-hidden"
          >
            <div className="flex justify-between items-center z-10">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Bank Direct Connection
              </span>
              <span className="text-xl">🏦</span>
            </div>

            <div className="z-10 space-y-1 my-auto py-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Selected Financial Institution
              </span>
              <h4 className="text-base font-black text-white truncate">
                {bankName}
              </h4>
              <span className="text-xs text-gray-300 font-medium block">
                Account Holder: {accountHolder}
              </span>
            </div>

            <div className="flex justify-between items-center z-10 pt-2 border-t border-white/5 text-[10px]">
              <span className="text-gray-400">Security Shield Active</span>
              <span className="text-emerald-400 font-bold">✓ 256-bit Encrypted Portal</span>
            </div>
          </motion.div>

          <OrderSummaryCard paymentDetails={paymentDetails} />
        </div>

        {/* Right Panel: Input Bank Selector Form */}
        <div className="space-y-5 bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
          <h5 className="text-xs font-black text-white uppercase tracking-wider">
            Select Your Bank Account
          </h5>

          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              Select Bank
            </label>
            <select
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 transition-colors"
            >
              {indianBanks.map((b) => (
                <option key={b} value={b} className="bg-zinc-950 text-white">
                  {b}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              Account Holder Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Debasmith Rout"
              value={accountHolder}
              onChange={(e) => setAccountHolder(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Remember Bank Checkbox */}
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={saveBank}
              onChange={(e) => setSaveBank(e.target.checked)}
              className="rounded border-gray-700 text-red-600 focus:ring-red-500 bg-zinc-900 cursor-pointer"
            />
            <span>Remember this bank account</span>
          </label>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xl shadow-red-900/50 border border-red-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>🏦</span> Continue to Bank Portal ({currencySymbol}{Number(totalAmount).toFixed(2)})
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  );
}
