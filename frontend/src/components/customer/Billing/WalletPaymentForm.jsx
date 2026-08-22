// src/components/customer/Billing/WalletPaymentForm.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import OrderSummaryCard from "./OrderSummaryCard";

export default function WalletPaymentForm({
  selectedMethod,
  paymentDetails,
  onPay,
  onBack
}) {
  const [walletProvider, setWalletProvider] = useState(selectedMethod?.rawMethod?.wallet_name || "Paytm Wallet");
  const [mobileNumber, setMobileNumber] = useState("9876543210");
  const [saveWallet, setSaveWallet] = useState(false);



  const {
    totalAmount = 352.82,
    currencySymbol = "₹"
  } = paymentDetails || {};

  const walletOptions = [
    { id: "paytm", name: "Paytm Wallet", icon: "👛" },
    { id: "phonepe", name: "PhonePe Wallet", icon: "📱" },
    { id: "amazonpay", name: "Amazon Pay", icon: "📦" }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onPay({
      savePaymentMethod: saveWallet,
      walletProvider,
      mobileNumber
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
          Digital Wallet Checkout
        </span>
      </div>

      {/* Split View Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left Panel: Animated Wallet Container & Summary */}
        <div className="space-y-6">
          <motion.div
            animate={{ y: [-3, 3, -3] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
            className="w-full h-52 rounded-3xl bg-gradient-to-tr from-zinc-950 via-zinc-900 to-red-950/40 border border-red-500/30 p-5 flex flex-col justify-between shadow-2xl shadow-red-950/40 relative overflow-hidden"
          >
            <div className="flex justify-between items-center z-10">
              <span className="px-2.5 py-1 rounded-full text-[9px] font-black bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Wallet Auto-Debit
              </span>
              <span className="text-2xl">👛</span>
            </div>

            <div className="z-10 space-y-1 my-auto text-center py-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                Selected Digital Wallet
              </span>
              <h4 className="text-lg font-black text-white">
                {walletProvider}
              </h4>
              <span className="text-xs font-mono text-gray-300 block">
                Linked Account: +91 {mobileNumber}
              </span>
            </div>

            <div className="flex justify-between items-center z-10 pt-2 border-t border-white/5 text-[10px]">
              <span className="text-gray-400">1-Click Fast Payment</span>
              <span className="text-emerald-400 font-bold">✓ Instant Balance Verification</span>
            </div>
          </motion.div>

          <OrderSummaryCard paymentDetails={paymentDetails} />
        </div>

        {/* Right Panel: Input Wallet Form */}
        <div className="space-y-5 bg-zinc-900/40 p-5 rounded-2xl border border-white/5">
          <h5 className="text-xs font-black text-white uppercase tracking-wider">
            Select Wallet & Phone Number
          </h5>

          <div className="space-y-2">
            <label className="text-[10px] text-gray-400 font-bold uppercase block">
              Wallet Provider
            </label>
            <div className="grid grid-cols-1 gap-2">
              {walletOptions.map((w) => {
                const isSelected = walletProvider === w.name;
                return (
                  <div
                    key={w.id}
                    onClick={() => setWalletProvider(w.name)}
                    className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? "bg-red-950/20 border-red-500 text-white"
                        : "bg-zinc-900 border-white/10 text-gray-400 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span>{w.icon}</span>
                      <span className="text-xs font-bold">{w.name}</span>
                    </div>
                    <div
                      className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                        isSelected ? "border-red-500 bg-red-600" : "border-gray-500"
                      }`}
                    >
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
              Registered Mobile Number
            </label>
            <input
              type="text"
              required
              maxLength="10"
              placeholder="9876543210"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors"
            />
          </div>

          {/* Save Wallet Checkbox */}
          <label className="flex items-center gap-2 text-xs text-gray-300 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={saveWallet}
              onChange={(e) => setSaveWallet(e.target.checked)}
              className="rounded border-gray-700 text-red-600 focus:ring-red-500 bg-zinc-900 cursor-pointer"
            />
            <span>Save this wallet</span>
          </label>

          <div className="pt-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              className="w-full py-3.5 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-xl shadow-red-900/50 border border-red-500/30 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>👛</span> Pay {currencySymbol}{Number(totalAmount).toFixed(2)} via Wallet
            </motion.button>
          </div>
        </div>
      </div>
    </form>
  );
}
