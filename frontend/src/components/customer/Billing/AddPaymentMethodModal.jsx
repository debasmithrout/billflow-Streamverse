// src/components/customer/Billing/AddPaymentMethodModal.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createPaymentMethod } from "../../../services/customerService";
import useToast from "../../../hooks/useToast";

export default function AddPaymentMethodModal({ isOpen, onClose, onAddSuccess }) {
  const { showToast } = useToast();
  const [methodType, setMethodType] = useState("card");
  const [cardHolder, setCardHolder] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [upiId, setUpiId] = useState("");
  const [bank, setBank] = useState("SBI");
  const [wallet, setWallet] = useState("Paytm");
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    let payload = {};
    if (methodType === "card") {
      const parts = expiry.split("/");
      const month = parseInt(parts[0], 10) || 12;
      const yr = parts[1] ? (parts[1].length === 2 ? 2000 + parseInt(parts[1], 10) : parseInt(parts[1], 10)) : 2028;
      payload = {
        method_type: "card",
        provider: "VISA",
        display_name: cardHolder || "Customer",
        last_four: cardNumber.slice(-4) || "4242",
        expiry_month: month,
        expiry_year: yr
      };
    } else if (methodType === "upi") {
      payload = {
        method_type: "upi",
        provider: "UPI",
        display_name: "UPI VPA",
        upi_id: upiId || "user@oksbi"
      };
    } else if (methodType === "netbanking") {
      payload = {
        method_type: "netbanking",
        provider: bank,
        display_name: bank,
        bank_name: bank
      };
    } else {
      payload = {
        method_type: "wallet",
        provider: wallet,
        display_name: wallet,
        wallet_name: wallet
      };
    }

    try {
      const created = await createPaymentMethod(payload);
      setIsSuccess(true);
      showToast("Payment method added successfully.", "success");
      setTimeout(() => {
        if (onAddSuccess) onAddSuccess(created);
        setIsSuccess(false);
        onClose();
      }, 1000);
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to add payment method", "error");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="bg-zinc-950 border border-white/10 rounded-2xl max-w-md w-full p-6 space-y-6 shadow-2xl relative"
        >
          {/* Header */}
          <div className="flex justify-between items-center border-b border-white/5 pb-4">
            <div>
              <h3 className="text-lg font-black text-white tracking-tight">
                Add New Payment Method
              </h3>
              <p className="text-xs text-gray-400 font-medium mt-0.5">
                Select method type and enter details.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/5 transition-colors"
            >
              ✕
            </button>
          </div>

          {isSuccess ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto text-xl font-bold">
                ✓
              </div>
              <h4 className="text-base font-bold text-white">
                Payment Method Added!
              </h4>
              <p className="text-xs text-gray-400">
                Updating your payment methods list...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Method Type Selector Tabs */}
              <div className="grid grid-cols-4 gap-1 p-1 bg-zinc-900 rounded-xl border border-white/5 text-[11px] font-bold">
                <button
                  type="button"
                  onClick={() => setMethodType("card")}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    methodType === "card"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Card
                </button>
                <button
                  type="button"
                  onClick={() => setMethodType("upi")}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    methodType === "upi"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  UPI
                </button>
                <button
                  type="button"
                  onClick={() => setMethodType("netbanking")}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    methodType === "netbanking"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Banking
                </button>
                <button
                  type="button"
                  onClick={() => setMethodType("wallet")}
                  className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                    methodType === "wallet"
                      ? "bg-zinc-800 text-white shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  Wallet
                </button>
              </div>

              {/* Form Input Fields */}
              {methodType === "card" && (
                <div className="space-y-3">
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
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                      Card Number
                    </label>
                    <input
                      type="text"
                      required
                      maxLength="16"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
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
                      className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {methodType === "upi" && (
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    VPA / UPI ID
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="user@oksbi"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-600 focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              {methodType === "netbanking" && (
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Select Bank
                  </label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="State Bank of India (SBI)">State Bank of India (SBI)</option>
                    <option value="HDFC Bank">HDFC Bank</option>
                    <option value="ICICI Bank">ICICI Bank</option>
                    <option value="Axis Bank">Axis Bank</option>
                  </select>
                </div>
              )}

              {methodType === "wallet" && (
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase block mb-1">
                    Select Wallet Provider
                  </label>
                  <select
                    value={wallet}
                    onChange={(e) => setWallet(e.target.value)}
                    className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  >
                    <option value="Paytm">Paytm</option>
                    <option value="PhonePe">PhonePe</option>
                    <option value="Amazon Pay">Amazon Pay</option>
                  </select>
                </div>
              )}

              {/* Footer Notice & Actions */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] font-bold text-amber-400/80 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Frontend Demo Only
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-xs font-bold text-gray-300 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-xs font-bold text-white rounded-xl shadow-lg shadow-red-900/30 transition-all cursor-pointer"
                  >
                    Save Method
                  </button>
                </div>
              </div>
            </form>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
