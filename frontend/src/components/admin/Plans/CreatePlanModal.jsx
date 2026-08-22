// src/components/admin/Plans/CreatePlanModal.jsx
import { useState } from "react";
import { X, Info, CreditCard, Sparkles, Sliders, Eye, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { formatCurrency } from "../../../utils/currencyFormatter";
import { addPlanPrice, updatePlanPrice, deletePlanPrice } from "../../../services/adminService";
import useToast from "../../../hooks/useToast";

export default function CreatePlanModal({ isOpen, plan, onSave, onCancel, existingPlans = [] }) {
  const isEdit = !!plan;

  // Form states
  const [formData, setFormData] = useState({
    name: plan?.name || "",
    description: plan?.description || "",
    price: plan ? plan.price.toString() : "",
    billing_interval: plan?.billing_interval || "month",
    trial_period_days: plan ? plan.trial_period_days.toString() : "0"
  });

  const [features, setFeatures] = useState(plan?.features || []);
  const [featureInput, setFeatureInput] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  // Tab State
  const [activeTab, setActiveTab] = useState("general");

  const { showToast } = useToast();
  const [localPrices, setLocalPrices] = useState(plan?.prices || []);
  const [priceForm, setPriceForm] = useState({
    currency_code: "USD",
    billing_interval: "Monthly",
    price: "",
    is_default: false,
    is_active: true
  });

  const handleAddPrice = async () => {
    if (!priceForm.price || isNaN(parseFloat(priceForm.price)) || parseFloat(priceForm.price) < 0) {
      setErrorMsg("Price must be a valid positive number.");
      return;
    }
    setErrorMsg("");

    try {
      const payload = {
        currency_code: priceForm.currency_code,
        billing_interval: priceForm.billing_interval,
        price: parseFloat(priceForm.price),
        is_default: priceForm.is_default,
        is_active: priceForm.is_active
      };
      
      const newPrice = await addPlanPrice(plan.id, payload);
      showToast("Pricing configuration saved successfully.", "success");
      
      // Update local price list
      setLocalPrices(prev => {
        let updated = prev.filter(p => p.id !== newPrice.id);
        if (newPrice.is_default) {
          updated = updated.map(p => 
            p.billing_interval === newPrice.billing_interval ? { ...p, is_default: false } : p
          );
        }
        return [...updated, newPrice];
      });
      
      // Reset form
      setPriceForm({
        currency_code: "USD",
        billing_interval: "Monthly",
        price: "",
        is_default: false,
        is_active: true
      });
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || "Failed to add plan pricing.");
    }
  };

  const handleTogglePriceActive = async (priceId, currentActive) => {
    try {
      if (currentActive) {
        // Soft delete deactivates
        const updatedPrice = await deletePlanPrice(priceId);
        showToast("Pricing de-activated.", "success");
        setLocalPrices(prev => prev.map(p => p.id === priceId ? updatedPrice : p));
      } else {
        // Reactivate
        const updatedPrice = await updatePlanPrice(priceId, { is_active: true });
        showToast("Pricing re-activated.", "success");
        setLocalPrices(prev => prev.map(p => p.id === priceId ? updatedPrice : p));
      }
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to alter pricing status.", "error");
    }
  };

  const handleSetPriceDefault = async (priceId) => {
    try {
      const updatedPrice = await updatePlanPrice(priceId, { is_default: true });
      showToast("Default currency pricing updated.", "success");
      
      // Sync local prices default flag
      setLocalPrices(prev => prev.map(p => {
        if (p.id === priceId) {
          return updatedPrice;
        }
        if (p.billing_interval === updatedPrice.billing_interval) {
          return { ...p, is_default: false };
        }
        return p;
      }));
    } catch (err) {
      showToast(err.response?.data?.detail || "Failed to set default pricing.", "error");
    }
  };

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrorMsg("");
  };

  const handleAddFeature = () => {
    if (!featureInput.trim()) return;
    if (features.includes(featureInput.trim())) {
      setErrorMsg("This feature is already added.");
      return;
    }
    setFeatures((prev) => [...prev, featureInput.trim()]);
    setFeatureInput("");
    setErrorMsg("");
  };

  const handleRemoveFeature = (featureToRemove) => {
    setFeatures((prev) => prev.filter((f) => f !== featureToRemove));
  };

  const isDirty = () => {
    const origName = plan?.name || "";
    const origDesc = plan?.description || "";
    const origPrice = plan ? plan.price.toString() : "";
    const origInterval = plan?.billing_interval || "month";
    const origTrial = plan ? plan.trial_period_days.toString() : "0";
    const origFeatures = plan?.features || [];

    return (
      formData.name !== origName ||
      formData.description !== origDesc ||
      formData.price !== origPrice ||
      formData.billing_interval !== origInterval ||
      formData.trial_period_days !== origTrial ||
      JSON.stringify(features) !== JSON.stringify(origFeatures)
    );
  };

  const handleCancelClick = () => {
    if (isDirty()) {
      setShowConfirmDiscard(true);
    } else {
      onCancel();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!formData.name.trim()) {
      setErrorMsg("Plan name is required.");
      return;
    }

    const priceVal = parseFloat(formData.price);
    if (isNaN(priceVal) || priceVal < 0) {
      setErrorMsg("Price must be a positive number.");
      return;
    }

    const trialVal = parseInt(formData.trial_period_days || 0, 10);
    if (isNaN(trialVal) || trialVal < 0) {
      setErrorMsg("Trial days must be a non-negative integer.");
      return;
    }

    const isDuplicate = existingPlans.some(
      (p) => p.id !== plan?.id && p.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (isDuplicate) {
      setErrorMsg("A plan with this name already exists.");
      return;
    }

    const payload = {
      ...formData,
      price: priceVal,
      trial_period_days: trialVal,
      features
    };

    onSave(plan?.id, payload);
  };

  const tabs = [
    { id: "general", label: "General", icon: Info },
    { id: "pricing", label: "Pricing", icon: CreditCard },
    { id: "features", label: "Features", icon: Sparkles },
    { id: "billing", label: "Limits & Visibility", icon: Sliders }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        onClick={handleCancelClick} 
        className="fixed inset-0 bg-black/80 backdrop-blur-xs transition-opacity duration-300"
      />

      {/* Main Dialog Modal */}
      <div className="relative bg-zinc-950 border border-white/10 rounded-2xl w-full max-w-lg p-6 shadow-2xl z-10 animate-fade-in origin-center flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-4">
          <h3 className="text-sm font-bold text-white tracking-wide">
            {isEdit ? "Edit Subscription Plan" : "Create Subscription Plan"}
          </h3>
          <button
            type="button"
            onClick={handleCancelClick}
            className="p-1 rounded-lg text-gray-500 hover:text-white hover:bg-white/5 cursor-pointer focus:outline-none transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div className="p-3 bg-red-650/15 border border-red-500/10 rounded-xl mb-4 text-xs font-bold text-red-500">
            {errorMsg}
          </div>
        )}

        {/* Tab Headers */}
        <div className="flex gap-1.5 border-b border-white/5 pb-3 mb-4 overflow-x-auto scrollbar-none">
          {tabs.map((t) => {
            const TabIcon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors ${
                  activeTab === t.id
                    ? "bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/20"
                    : "text-gray-500 hover:text-gray-300 hover:bg-white/3"
                }`}
              >
                <TabIcon size={12} />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* Form Body Scroll Area */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
          <div className="space-y-4 overflow-y-auto pr-1 flex-1 adm-scrollbar mb-6">
            
            {/* Tab content: General */}
            {activeTab === "general" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-left"
              >
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Plan Name</label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Premium Ultra HD"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Description</label>
                  <input
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="e.g. 4 Screens 4K streaming quality"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                  />
                </div>
              </motion.div>
            )}

            {/* Tab content: Pricing */}
            {activeTab === "pricing" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-left"
              >
                {!isEdit ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Price (INR)</label>
                      <input
                        type="number"
                        name="price"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={handleChange}
                        placeholder="0.00"
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Billing Interval</label>
                      <select
                        name="billing_interval"
                        value={formData.billing_interval}
                        onChange={handleChange}
                        className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-gray-300 outline-none focus:border-[#8B5CF6] transition-all cursor-pointer font-medium"
                      >
                        <option value="month" className="bg-zinc-950 text-white">Monthly</option>
                        <option value="year" className="bg-zinc-950 text-white">Yearly</option>
                      </select>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    {/* List of current Prices */}
                    <div className="space-y-2">
                      <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">Active Currency Pricing Mappings</label>
                      <div className="rounded-xl border border-white/5 bg-zinc-950 overflow-hidden divide-y divide-white/5 max-h-[160px] overflow-y-auto adm-scrollbar">
                        {localPrices.length === 0 ? (
                          <div className="p-4 text-center text-xs text-gray-500 italic">No pricing configurations defined.</div>
                        ) : (
                          localPrices.map((pr) => (
                            <div key={pr.id} className="p-3 flex items-center justify-between gap-4 text-xs">
                              <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-white px-2 py-0.5 bg-white/5 rounded-lg border border-white/8">{pr.currency_code}</span>
                                <span className="font-bold text-[#A78BFA]">{formatCurrency(pr.price, pr.currency_code)}</span>
                                <span className="text-gray-500 font-light lowercase">/ {pr.billing_interval === "Annual" || pr.billing_interval === "Annual" ? "year" : "month"}</span>
                                {pr.is_default && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-[#8B5CF6]/15 text-[#A78BFA] border border-[#8B5CF6]/20 uppercase tracking-wider">Default</span>
                                )}
                                {!pr.is_active && (
                                  <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-red-650/15 text-red-500 border border-red-500/10 uppercase tracking-wider">Inactive</span>
                                )}
                              </div>
                              <div className="flex gap-2">
                                {!pr.is_default && pr.is_active && (
                                  <button
                                    type="button"
                                    onClick={() => handleSetPriceDefault(pr.id)}
                                    className="px-2 py-1 bg-purple-600/10 hover:bg-purple-650/20 text-[10px] font-bold rounded-lg border border-[#8B5CF6]/15 text-purple-300 cursor-pointer"
                                  >
                                    Set Default
                                  </button>
                                )}
                                {pr.is_active ? (
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePriceActive(pr.id, true)}
                                    className="px-2 py-1 bg-red-650/10 hover:bg-red-650/20 text-[10px] font-bold rounded-lg border border-red-500/10 text-red-400 cursor-pointer"
                                  >
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => handleTogglePriceActive(pr.id, false)}
                                    className="px-2 py-1 bg-green-600/10 hover:bg-green-650/20 text-[10px] font-bold rounded-lg border border-green-500/10 text-green-400 cursor-pointer"
                                  >
                                    Activate
                                  </button>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Form to add a new Price configuration */}
                    <div className="p-4 bg-white/2 rounded-xl border border-white/5 space-y-4">
                      <span className="text-[10px] text-gray-405 font-bold uppercase tracking-wider block">Add Price Configuration</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Currency</label>
                          <select
                            value={priceForm.currency_code}
                            onChange={(e) => setPriceForm(p => ({ ...p, currency_code: e.target.value }))}
                            className="w-full px-2 py-2 bg-zinc-950 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#8B5CF6] cursor-pointer"
                          >
                            <option value="INR">INR (₹)</option>
                            <option value="USD">USD ($)</option>
                            <option value="EUR">EUR (€)</option>
                            <option value="GBP">GBP (£)</option>
                            <option value="CAD">CAD (C$)</option>
                            <option value="AUD">AUD (A$)</option>
                            <option value="JPY">JPY (¥)</option>
                            <option value="SGD">SGD (S$)</option>
                            <option value="AED">AED (AED)</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Billing Cycle</label>
                          <select
                            value={priceForm.billing_interval}
                            onChange={(e) => setPriceForm(p => ({ ...p, billing_interval: e.target.value }))}
                            className="w-full px-2 py-2 bg-zinc-950 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#8B5CF6] cursor-pointer"
                          >
                            <option value="Monthly">Monthly</option>
                            <option value="Annual">Yearly</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[9px] text-gray-500 font-bold uppercase tracking-wider block mb-1">Price</label>
                          <input
                            type="number"
                            step="0.01"
                            value={priceForm.price}
                            onChange={(e) => setPriceForm(p => ({ ...p, price: e.target.value }))}
                            placeholder="0.00"
                            className="w-full px-2 py-2 bg-zinc-950 border border-white/10 rounded-lg text-xs text-white outline-none focus:border-[#8B5CF6]"
                          />
                        </div>
                      </div>
                      <div className="flex gap-4 items-center">
                        <label className="flex items-center gap-2 text-xs text-gray-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={priceForm.is_default}
                            onChange={(e) => setPriceForm(p => ({ ...p, is_default: e.target.checked }))}
                            className="rounded border-white/10 bg-zinc-950 text-[#8B5CF6] focus:ring-0 focus:ring-offset-0 cursor-pointer"
                          />
                          <span>Set as Default Price</span>
                        </label>
                        <button
                          type="button"
                          onClick={handleAddPrice}
                          className="ml-auto px-4 py-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-xs font-bold text-white rounded-lg cursor-pointer focus:outline-none transition-colors border-none"
                        >
                          Add Price
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Tab content: Features */}
            {activeTab === "features" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-left"
              >
                <div className="space-y-2">
                  <label className="text-[10px] text-gray-450 font-bold uppercase tracking-wider block">Plan Features Editor</label>
                  
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={featureInput}
                      onChange={(e) => setFeatureInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          handleAddFeature();
                        }
                      }}
                      placeholder="Type feature tag e.g. Dolby Atmos"
                      className="flex-1 px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                    />
                    <button
                      type="button"
                      onClick={handleAddFeature}
                      className="adm-btn adm-btn-purple cursor-pointer focus:outline-none text-xs font-bold px-4 py-2 border-none"
                    >
                      Add
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2 pt-2">
                    {features.length === 0 ? (
                      <span className="text-[10px] text-gray-500 font-light italic">No features defined. Add at least one above.</span>
                    ) : (
                      features.map((feature, idx) => (
                        <span 
                          key={idx}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#8B5CF6]/10 border border-[#8B5CF6]/15 text-[#A78BFA] rounded-lg text-xs font-semibold"
                        >
                          <span>{feature}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveFeature(feature)}
                            className="text-[#A78BFA] hover:text-white p-0.5 rounded-full hover:bg-white/5 focus:outline-none shrink-0"
                          >
                            <X size={10} />
                          </button>
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Tab content: Limits & Visibility */}
            {activeTab === "billing" && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 text-left"
              >
                <div>
                  <label className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-1">Trial Period (Days)</label>
                  <input
                    type="number"
                    name="trial_period_days"
                    required
                    value={formData.trial_period_days}
                    onChange={handleChange}
                    placeholder="0"
                    className="w-full px-3 py-2.5 bg-zinc-950 border border-white/10 rounded-xl text-xs text-white outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                  <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Visibility Status</span>
                    <span className="text-xs font-bold text-white mt-1 block flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                      Active / Visible on Portal
                    </span>
                  </div>
                  <div className="p-3 bg-white/2 rounded-xl border border-white/5">
                    <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Billing Gateway</span>
                    <span className="text-xs font-bold text-[#A78BFA] mt-1 block flex items-center gap-1.5">
                      <Sliders size={12} />
                      Production Mode
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

          </div>

          {/* Form Actions Footer */}
          <div className="flex gap-3 pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={handleCancelClick}
              className="flex-1 py-2.5 bg-zinc-900 hover:bg-zinc-800 border border-white/5 text-xs font-bold text-gray-300 rounded-xl cursor-pointer focus:outline-none transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] hover:from-[#9D6EF8] hover:to-[#8B5CF6] text-xs font-bold text-white rounded-xl cursor-pointer focus:outline-none transition-colors border-none shadow-lg shadow-[#8B5CF6]/25"
            >
              {isEdit ? "Save Changes" : "Create Plan"}
            </button>
          </div>

        </form>

        {/* Discard confirm */}
        {showConfirmDiscard && (
          <div className="absolute inset-0 z-20 flex items-center justify-center p-4 bg-black/90 rounded-2xl">
            <div className="max-w-xs text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-500 flex items-center justify-center mx-auto">
                <AlertTriangle size={24} style={{ color: "#F59E0B" }} />
              </div>
              <h4 className="text-sm font-bold text-white">Discard Unsaved Changes?</h4>
              <p className="text-xs text-gray-400 font-light leading-normal">
                You have unsaved edits. Closing now will lose all values permanently.
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmDiscard(false)}
                  className="flex-1 py-2 bg-zinc-900 border border-white/5 rounded-xl text-xs font-bold text-gray-300"
                >
                  Keep Editing
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowConfirmDiscard(false);
                    onCancel();
                  }}
                  className="flex-1 py-2 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-xl text-xs font-bold text-white border-none"
                >
                  Discard
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
