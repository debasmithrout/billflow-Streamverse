// src/components/customer/Billing/PaymentMethodsCenter.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import PaymentMethodItem from "./PaymentMethodItem";
import PaymentSummary from "./PaymentSummary";
import AddPaymentMethodModal from "./AddPaymentMethodModal";
import {
  getPaymentMethods,
  setDefaultPaymentMethod,
  deletePaymentMethod
} from "../../../services/customerService";
import useToast from "../../../hooks/useToast";
import useModal from "../../../hooks/useModal";

export default function PaymentMethodsCenter({ paymentMethod }) {
  const { showToast } = useToast();
  const { showConfirm } = useModal();
  const [activeTab, setActiveTab] = useState("cards");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [methods, setMethods] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const data = await getPaymentMethods();
      setMethods(data || []);
    } catch (err) {
      console.error("Failed to load payment methods:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
    window.addEventListener("billing_state_updated", loadMethods);
    return () => {
      window.removeEventListener("billing_state_updated", loadMethods);
    };
  }, []);

  const cardsList = methods.filter((m) => m.method_type === "card");
  const upiList = methods.filter((m) => m.method_type === "upi");
  const bankList = methods.filter((m) => m.method_type === "netbanking");
  const walletList = methods.filter((m) => m.method_type === "wallet");

  const handleSetDefaultCard = async (targetMethod) => {
    try {
      await setDefaultPaymentMethod(targetMethod.id);
      await loadMethods();
      window.dispatchEvent(new Event("billing_state_updated"));
      showToast("Default payment method updated.", "success");
    } catch (err) {
      showToast(err?.response?.data?.detail || "Failed to set default method", "error");
    }
  };

  const handleRemoveMethod = (targetMethod) => {
    showConfirm({
      title: "Remove Payment Method?",
      description: `Are you sure you want to remove this payment method? This action cannot be undone.`,
      variant: "remove-payment-method",
      confirmText: "Remove Method",
      cancelText: "Cancel",
      onConfirm: async () => {
        try {
          await deletePaymentMethod(targetMethod.id);
          await loadMethods();
          window.dispatchEvent(new Event("billing_state_updated"));
          showToast("Payment method removed successfully.", "success");
        } catch (err) {
          showToast(err?.response?.data?.detail || "Failed to remove payment method", "error");
        }
      }
    });
  };

  const handleAddSuccess = async () => {
    await loadMethods();
    window.dispatchEvent(new Event("billing_state_updated"));
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Add CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 p-1 bg-zinc-900 rounded-xl border border-white/5 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab("cards")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "cards"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Cards ({cardsList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("upi")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "upi"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            UPI ({upiList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("netbanking")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "netbanking"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Net Banking ({bankList.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("wallets")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-black transition-colors cursor-pointer whitespace-nowrap ${
              activeTab === "wallets"
                ? "bg-zinc-800 text-white shadow-sm"
                : "text-gray-400 hover:text-gray-200"
            }`}
          >
            Wallets ({walletList.length})
          </button>
        </div>

        {/* Add New Method Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-black rounded-xl shadow-lg shadow-red-900/30 border border-red-500/30 transition-all cursor-pointer inline-flex items-center justify-center gap-1.5 shrink-0"
        >
          <span className="text-sm">+</span> Add New Method
        </motion.button>
      </div>

      {/* Tab Content Panels */}
      <AnimatePresence mode="wait">
        {activeTab === "cards" && (
          <motion.div
            key="cards"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {cardsList.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/40 border border-white/5 rounded-2xl space-y-2">
                <p className="text-sm font-bold text-gray-300">No cards saved yet.</p>
                <p className="text-xs text-gray-500">Click '+ Add New Method' to add your credit or debit card.</p>
              </div>
            ) : (
              cardsList.map((card) => (
                <PaymentMethodItem
                  key={card.id}
                  method={card}
                  onSetDefault={handleSetDefaultCard}
                  onRemove={handleRemoveMethod}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === "upi" && (
          <motion.div
            key="upi"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {upiList.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/40 border border-white/5 rounded-2xl space-y-2">
                <p className="text-sm font-bold text-gray-300">No UPI VPA saved yet.</p>
                <p className="text-xs text-gray-500">Click '+ Add New Method' to add your UPI ID.</p>
              </div>
            ) : (
              upiList.map((upi) => (
                <PaymentMethodItem
                  key={upi.id}
                  method={upi}
                  onSetDefault={handleSetDefaultCard}
                  onRemove={handleRemoveMethod}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === "netbanking" && (
          <motion.div
            key="netbanking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {bankList.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/40 border border-white/5 rounded-2xl space-y-2">
                <p className="text-sm font-bold text-gray-300">No net banking accounts saved yet.</p>
                <p className="text-xs text-gray-500">Click '+ Add New Method' to select your bank.</p>
              </div>
            ) : (
              bankList.map((bank) => (
                <PaymentMethodItem
                  key={bank.id}
                  method={bank}
                  onSetDefault={handleSetDefaultCard}
                  onRemove={handleRemoveMethod}
                />
              ))
            )}
          </motion.div>
        )}

        {activeTab === "wallets" && (
          <motion.div
            key="wallets"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {walletList.length === 0 ? (
              <div className="p-8 text-center bg-zinc-900/40 border border-white/5 rounded-2xl space-y-2">
                <p className="text-sm font-bold text-gray-300">No digital wallets saved yet.</p>
                <p className="text-xs text-gray-500">Click '+ Add New Method' to add Paytm, PhonePe, or Amazon Pay.</p>
              </div>
            ) : (
              walletList.map((wallet) => (
                <PaymentMethodItem
                  key={wallet.id}
                  method={wallet}
                  onSetDefault={handleSetDefaultCard}
                  onRemove={handleRemoveMethod}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Payment Summary Section */}
      <PaymentSummary />

      {/* Add Method Modal */}
      <AddPaymentMethodModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddSuccess={handleAddSuccess}
      />
    </div>
  );
}
