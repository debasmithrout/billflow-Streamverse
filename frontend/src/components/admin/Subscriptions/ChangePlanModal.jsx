// src/components/admin/Subscriptions/ChangePlanModal.jsx
import { useState } from "react";
import { formatCurrency } from "../../../utils/currencyFormatter";

export default function ChangePlanModal({ isOpen, subscription, plans = [], onSave, onCancel }) {
  const currentActivePlan = plans.find(
    (p) => p.name.toLowerCase() === subscription?.planName?.toLowerCase()
  );

  const [selectedPlanId, setSelectedPlanId] = useState(currentActivePlan ? currentActivePlan.id : "");
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  if (!isOpen || !subscription) return null;

  // Filter out archived plans unless it is the customer's current plan
  const availablePlans = plans.filter(
    (p) => !p.isArchived || p.name.toLowerCase() === subscription.planName.toLowerCase()
  );

  const handleSaveClick = (e) => {
    e.preventDefault();
    setErrorMsg("");

    const currentActivePlan = plans.find(
      (p) => p.name.toLowerCase() === subscription.planName.toLowerCase()
    );
    
    if (selectedPlanId === (currentActivePlan ? currentActivePlan.id : "")) {
      setErrorMsg("Please select a plan different from the current subscription.");
      return;
    }

    if (!selectedPlanId) {
      setErrorMsg("Please select a plan to migrate this customer.");
      return;
    }

    setShowConfirm(true);
  };

  const handleConfirmSubmit = () => {
    onSave(subscription.customerId, selectedPlanId);
    setShowConfirm(false);
  };

  const matchedNewPlan = plans.find(p => p.id === selectedPlanId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={onCancel} 
        className="fixed inset-0 bg-black/85 backdrop-blur-sm transition-opacity duration-300"
      />

      {/* Main Dialog Modal */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl z-10 animate-fade-in origin-center flex flex-col">
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide">Migrate Subscription Plan</h3>
          <button
            type="button"
            onClick={onCancel}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {errorMsg && (
          <div className="p-3 bg-red-650/15 border border-red-500/10 rounded-xl mb-4 text-xs font-bold text-red-500">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSaveClick} className="space-y-4">
          <div className="text-xs space-y-1">
            <span className="text-gray-500 font-light block">Customer:</span>
            <span className="text-white font-bold block text-sm">{subscription.customerName}</span>
          </div>

          <div className="text-xs space-y-1 bg-zinc-900/40 p-3 rounded-xl border border-white/5">
            <span className="text-gray-500 font-light block">Current Subscription:</span>
            <span className="text-white font-semibold block">{subscription.planName} ({formatCurrency(subscription.planPrice)}/mo)</span>
          </div>

          {/* Selector */}
          <div>
            <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1.5">Select New Subscription Plan</label>
            <select
              value={selectedPlanId}
              onChange={(e) => {
                setSelectedPlanId(e.target.value);
                setErrorMsg("");
              }}
              className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-gray-300 outline-none focus:border-red-600 transition-colors"
            >
              <option value="" disabled className="bg-zinc-950 text-white">Choose a plan...</option>
              {availablePlans.map((p) => (
                <option key={p.id} value={p.id} className="bg-zinc-950 text-white">
                  {p.name} ({formatCurrency(p.price)} / {p.billing_interval}) {p.isArchived ? "[Archived]" : ""}
                </option>
              ))}
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-red-650 hover:bg-red-750 text-xs font-bold text-white rounded-xl cursor-pointer focus:outline-none transition-colors"
            >
              Migrate Plan
            </button>
          </div>
        </form>

        {/* Double Confirmation Overlay Drawer */}
        {showConfirm && matchedNewPlan && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/95 rounded-2xl animate-fade-in">
            <div className="max-w-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h4 className="text-sm font-bold text-white">Confirm Plan Migration?</h4>
              <p className="text-xs text-gray-400 font-light leading-relaxed">
                Are you sure you want to migrate <span className="font-bold text-gray-250">{subscription.customerName}</span> to the <span className="font-bold text-red-500">{matchedNewPlan.name}</span> plan? The customer will be billed at <span className="font-mono text-white font-bold">{formatCurrency(matchedNewPlan.price)}/mo</span> immediately.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirm(false)}
                  className="flex-1 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSubmit}
                  className="flex-1 py-2 bg-red-650 hover:bg-red-750 rounded-xl text-xs font-bold text-white"
                >
                  Confirm Change
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
