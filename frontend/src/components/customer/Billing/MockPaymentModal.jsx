import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function MockPaymentModal({
  isOpen,
  onClose,
  paymentId,
  invoiceDetails,
  onComplete
}) {
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const getHeaders = () => {
    const token = localStorage.getItem("access_token");
    return {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json"
      }
    };
  };

  const handlePayment = async (result) => {
    setProcessing(true);
    setError(null);
    try {
      await axios.post(
        `${API_URL}/payments/mock/complete`,
        {
          payment_id: paymentId,
          result: result
        },
        getHeaders()
      );
      onComplete(result);
    } catch (err) {
      console.error("Mock payment failed:", err);
      const errMsg = err.response?.data?.detail || "Payment gateway processing failed.";
      setError(errMsg);
    } finally {
      setProcessing(false);
    }
  };

  const { planName, baseAmount, gstPercentage, gstAmount, totalAmount, currencySymbol = "", taxName = "Tax" } = invoiceDetails || {};

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 relative animate-fade-in shadow-2xl space-y-6">
        
        {/* Modal Header */}
        <div className="text-center space-y-1">
          <span className="text-[10px] text-red-500 uppercase tracking-widest font-black block">SECURE GATEWAY</span>
          <h4 className="text-lg font-black text-white">Mock Payment Sandbox</h4>
          <p className="text-xs text-gray-400 font-light mt-1">Transaction ID: txn_pending_{paymentId}</p>
        </div>

        {/* Invoice breakdown */}
        <div className="border-t border-b border-white/5 py-4 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400 font-medium">Plan Description</span>
            <span className="text-white font-bold">{planName || "Subscription Plan"}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Base Amount</span>
            <span className="text-white font-mono font-medium">{currencySymbol}{parseFloat(baseAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">{taxName} %</span>
            <span className="text-white font-mono font-medium">{gstPercentage || 0}%</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">{taxName} Amount</span>
            <span className="text-white font-mono font-medium">{currencySymbol}{parseFloat(gstAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs pt-2 border-t border-white/5">
            <span className="text-gray-300 font-bold">Total Charged</span>
            <span className="text-red-500 font-mono font-black text-sm">{currencySymbol}{parseFloat(totalAmount || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Payment Status</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 uppercase tracking-wider">
              {processing ? "PROCESSING..." : "PENDING"}
            </span>
          </div>
        </div>

        {/* Error notification */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-center text-xs font-semibold">
            {error}
          </div>
        )}

        {/* Actions grid */}
        <div className="flex flex-col space-y-2 pt-2">
          <button
            type="button"
            disabled={processing}
            onClick={() => handlePayment("SUCCESS")}
            className="w-full py-3 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 text-white text-xs font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer focus:outline-none"
          >
            {processing ? "Processing..." : "Pay Success"}
          </button>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={processing}
              onClick={() => handlePayment("FAILED")}
              className="py-3 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-800 text-gray-300 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer focus:outline-none"
            >
              Fail Payment
            </button>
            <button
              type="button"
              disabled={processing}
              onClick={() => handlePayment("CANCELLED")}
              className="py-3 bg-zinc-900 hover:bg-zinc-800 disabled:bg-zinc-800 border border-white/5 text-gray-400 text-xs font-bold uppercase rounded-xl transition-all cursor-pointer focus:outline-none"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
